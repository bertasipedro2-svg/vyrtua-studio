import {validateDraft} from './order.mjs';

const base = 'https://bwcfrgbvrhwbcjqdbtza.supabase.co';

export function createPrintApi(key) {
  if (!key.startsWith('sb_publishable_')) throw Error('Use a chave publicável DEV.');
  let token, refreshToken, expiresAt, company;

  async function request(path, {method = 'GET', body, headers = {}, auth = true, binary = false} = {}) {
    const h = {apikey: key, ...headers};
    if (auth) {
      if (!token) throw Error('Faça login.');
      if (Date.now() >= expiresAt) {
        try {
          setSession(await request('/auth/v1/token?grant_type=refresh_token', {
            method: 'POST', body: {refresh_token: refreshToken}, auth: false
          }));
        } catch {
          throw Error('Sessão expirada. Saia e entre novamente.');
        }
      }
      h.Authorization = 'Bearer ' + token;
    }
    if (body !== undefined && !(body instanceof Blob)) {
      h['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const result = await fetch(base + path, {method, headers: h, body, cache: 'no-store'});
    if (!result.ok) throw Error('O servidor recusou a operação (HTTP ' + result.status + ').');
    if (result.status === 204) return null;
    return binary ? result.blob() : result.json();
  }

  function setSession(session) {
    token = session.access_token;
    refreshToken = session.refresh_token;
    expiresAt = Date.now() + (session.expires_in - 30) * 1000;
  }

  const db = (path, opts = {}) => request('/rest/v1/' + path, {
    ...opts, headers: {'Accept-Profile': 'print', 'Content-Profile': 'print', ...opts.headers}
  });
  const write = (method, body) => ({method, body, headers: {Prefer: 'return=representation'}});
  function tenant() {
    if (!company) throw Error('Selecione uma empresa.');
    return company;
  }
  const filter = () => 'company_id=eq.' + encodeURIComponent(tenant());

  return {
    async login(email, password) {
      token = refreshToken = company = null;
      setSession(await request('/auth/v1/token?grant_type=password', {
        method: 'POST', body: {email, password}, auth: false
      }));
    },
    async logout() {
      try {
        if (token) await request('/auth/v1/logout', {method: 'POST'});
      } finally {
        token = refreshToken = company = null;
      }
    },
    companies() {
      return db('companies?select=id,name,memberships(role)&order=name');
    },
    async selectCompany(id) {
      company = null;
      const rows = await db('companies?select=id&id=eq.' + encodeURIComponent(id));
      if (rows.length !== 1) throw Error('Empresa indisponível.');
      company = rows[0].id;
    },
    products(offset = 0) {
      return db('products?select=id,name,price_cents,active&order=name,id&limit=50&offset=' + offset + '&' + filter());
    },
    async saveProduct(id, product) {
      const rows = id
        ? await db('products?' + filter() + '&id=eq.' + encodeURIComponent(id), write('PATCH', product))
        : await db('products', write('POST', {...product, company_id: tenant()}));
      if (rows.length !== 1) throw Error('Produto indisponível para edição.');
    },
    summary() {
      return db('rpc/order_summary', {method: 'POST', body: {tenant: tenant()}});
    },
    orders(offset = 0) {
      return db('orders?select=*,products(name)&order=created_at.desc,id.desc&limit=50&offset=' + offset + '&' + filter());
    },
    async transition(order, status, quote_cents) {
      const rows = await db('orders?' + filter() + '&id=eq.' + encodeURIComponent(order.id)
        + '&status=eq.' + encodeURIComponent(order.status), write('PATCH', {status, quote_cents}));
      if (rows.length !== 1) throw Error('Pedido alterado em outra sessão. Atualize a lista.');
    },
    artwork(path) {
      if (!path.startsWith(tenant() + '/')) throw Error('Estampa indisponível.');
      return request('/storage/v1/object/authenticated/print-artworks/' + path.split('/').map(encodeURIComponent).join('/'), {binary: true});
    },
    async draft(draft, file) {
      validateDraft(draft);
      const company_id = tenant();
      const extensions = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'};
      const ext = extensions[file?.type];
      if (!ext || !file.size || file.size > 10485760) throw Error('Estampa inválida.');
      const artwork_path = company_id + '/' + crypto.randomUUID() + '.' + ext;
      await request('/storage/v1/object/print-artworks/' + artwork_path, {
        method: 'POST', body: file, headers: {'Content-Type': file.type, 'x-upsert': 'false'}
      });
      return db('orders', write('POST', {...draft, company_id, artwork_path}));
    }
  };
}
