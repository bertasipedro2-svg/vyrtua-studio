import {createPrintApi} from './api.mjs';

const el = id => document.getElementById(id);
const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const money = cents => cents == null ? 'Sem preço' : currency.format(Number(cents) / 100);
const statuses = {
  draft: 'Rascunho', requested: 'Aguardando orçamento', quoted: 'Orçado',
  approved: 'Aprovado', in_production: 'Em produção', ready: 'Pronto',
  completed: 'Concluído', cancelled: 'Cancelado'
};
const next = {
  draft: ['requested', 'Solicitar orçamento'],
  requested: ['quoted', 'Enviar orçamento', 'owner'],
  quoted: ['approved', 'Aprovar orçamento', 'owner'],
  approved: ['in_production', 'Iniciar produção'],
  in_production: ['ready', 'Marcar pronto'],
  ready: ['completed', 'Concluir pedido']
};
let api, companies, role, editor, editing, busy;
let productOffset = 0, orderOffset = 0;

function status(message) {
  el('status').textContent = message;
}

async function run(task, onError = status) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll('input,select,button:not(:disabled)')].filter(control => !control.disabled);
  controls.forEach(control => { control.disabled = true; });
  try {
    await task();
  } catch (error) {
    onError(error.message);
  } finally {
    busy = false;
    controls.forEach(control => { control.disabled = false; });
  }
}

function setOptions(select, list) {
  select.replaceChildren(new Option('Selecione', ''));
  for (const item of list) select.add(new Option(item.name, item.id));
}

function item(label, detail) {
  const row = document.createElement('li');
  const title = document.createElement('strong');
  const description = document.createElement('p');
  title.textContent = label;
  description.textContent = detail;
  row.append(title, description);
  return row;
}

function button(label, action) {
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'secondary';
  control.textContent = label;
  control.onclick = () => run(action);
  return control;
}

function closeEditor() {
  editor?.remove();
  editor = null;
  el('open-editor').textContent = 'Abrir editor visual';
}

async function showProducts() {
  const products = await api.products(productOffset);
  const list = el('products');
  list.replaceChildren(...products.map(product => {
    const row = item(product.name, money(product.price_cents) + (product.active ? ' · Ativo' : ' · Inativo'));
    if (role === 'owner') row.append(button('Editar produto', () => {
      editing = product.id;
      el('product-name').value = product.name;
      el('product-price').value = product.price_cents == null ? '' : (product.price_cents / 100).toFixed(2);
      el('product-active').checked = product.active;
      el('save-product').textContent = 'Salvar produto';
      el('product-form').scrollIntoView({block: 'center'});
      requestAnimationFrame(() => el('product-name').focus());
    }));
    return row;
  }));
  if (!products.length) list.append(item('Nenhum produto nesta página', ''));
  const select = el('product');
  const selected = select.value;
  setOptions(select, products.filter(product => product.active));
  select.value = [...select.options].some(option => option.value === selected) ? selected : '';
  el('previous-products').hidden = productOffset === 0;
  el('next-products').hidden = products.length < 50;
}

async function showOrders() {
  const orders = await api.orders(orderOffset);
  const list = el('orders');
  list.replaceChildren(...orders.map(order => {
    const row = item(order.products?.name ?? 'Produto', [
      statuses[order.status], order.quantity + ' un.', order.color, order.size,
      order.side === 'front' ? 'Frente' : 'Costas', order.print_width_cm + ' cm',
      new Date(order.created_at).toLocaleDateString('pt-BR')
    ].join(' · '));
    if (order.quote_cents != null) row.append(itemDetail('Orçamento ' + money(order.quote_cents)));
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(button('Baixar estampa', async () => {
      const blob = await api.artwork(order.artwork_path);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = order.artwork_path.split('/').at(-1);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }));
    const transition = next[order.status];
    if (transition && (!transition[2] || transition[2] === role)) {
      const [target, label] = transition;
      const quote = document.createElement('input');
      if (target === 'quoted') {
        quote.type = 'number';
        quote.min = '0.01';
        quote.max = '21474836.47';
        quote.step = '0.01';
        quote.inputMode = 'decimal';
        quote.placeholder = 'Total em reais';
        quote.setAttribute('aria-label', 'Total do orçamento em reais');
        actions.append(quote);
      }
      actions.append(button(label, async () => {
        const cents = Math.round(quote.valueAsNumber * 100);
        if (target === 'quoted' && (!quote.validity.valid || !Number.isInteger(cents) || cents <= 0)) {
          throw Error('Informe um valor de orçamento válido.');
        }
        await api.transition(order, target, target === 'quoted' ? cents : undefined);
        status('Pedido atualizado.');
        await refreshOrders();
      }));
    }
    if (role === 'owner' && ['draft', 'requested', 'quoted', 'approved'].includes(order.status)) {
      actions.append(button('Cancelar pedido', async () => {
        if (!confirm('Cancelar este pedido?')) return;
        await api.transition(order, 'cancelled');
        status('Pedido cancelado.');
        await refreshOrders();
      }));
    }
    row.append(actions);
    return row;
  }));
  if (!orders.length) list.append(item('Nenhum pedido nesta página', ''));
  el('previous-orders').hidden = orderOffset === 0;
  el('next-orders').hidden = orders.length < 50;
}

function itemDetail(text) {
  const detail = document.createElement('p');
  detail.textContent = text;
  return detail;
}

async function refreshOrders() {
  const [summary] = await api.summary();
  el('open-orders').textContent = summary.open_orders;
  el('production-orders').textContent = summary.production_orders;
  el('quoted-total').textContent = money(summary.quoted_cents);
  el('completed-total').textContent = money(summary.completed_cents);
  await showOrders();
}

el('login').onsubmit = event => {
  event.preventDefault();
  run(async () => {
    try {
      api = createPrintApi(el('key').value.trim());
      await api.login(el('email').value, el('password').value);
      companies = await api.companies();
      setOptions(el('company'), companies);
      el('login').hidden = true;
      el('workspace').hidden = false;
      status(companies.length ? 'Selecione sua empresa.' : 'Sua conta precisa de um vínculo com uma empresa.');
    } finally {
      el('password').value = '';
    }
  });
};

el('company').onchange = () => run(async () => {
  el('company-panel').hidden = true;
  closeEditor();
  el('product-form').reset();
  productOffset = orderOffset = 0;
  const selected = companies.find(company => company.id === el('company').value);
  if (!selected) return;
  await api.selectCompany(selected.id);
  role = selected.memberships[0]?.role;
  el('product-form').hidden = role !== 'owner';
  await showProducts();
  await refreshOrders();
  el('company-panel').hidden = false;
  status('Empresa selecionada.');
});

el('logout').onclick = () => run(async () => {
  try {
    await api.logout();
  } finally {
    closeEditor();
    api = companies = null;
    el('workspace').hidden = el('company-panel').hidden = true;
    el('login').hidden = false;
    status('Sessão encerrada.');
  }
});

el('product-form').onreset = () => {
  editing = null;
  el('save-product').textContent = 'Cadastrar produto';
};
el('product-form').onsubmit = event => {
  event.preventDefault();
  run(async () => {
    const name = el('product-name').value.trim();
    if (!name) throw Error('Informe o nome do produto.');
    const price = el('product-price').valueAsNumber;
    await api.saveProduct(editing, {
      name, price_cents: Number.isNaN(price) ? null : Math.round(price * 100), active: el('product-active').checked
    });
    el('product-form').reset();
    status('Produto salvo.');
    await showProducts();
  });
};

el('refresh').onclick = () => run(async () => {
  await showProducts();
  await refreshOrders();
  status('Painel atualizado.');
});
function connectPagination(kind, move) {
  el('previous-' + kind).onclick = () => run(() => move(-50));
  el('next-' + kind).onclick = () => run(() => move(50));
}
connectPagination('products', async delta => {
  productOffset += delta;
  try { await showProducts(); } catch (error) { productOffset -= delta; throw error; }
});
connectPagination('orders', async delta => {
  orderOffset += delta;
  try { await showOrders(); } catch (error) { orderOffset -= delta; throw error; }
});

el('open-editor').onclick = () => {
  if (editor) {
    closeEditor();
    return;
  }
  if (!el('product').value) {
    status('Selecione um produto ativo.');
    el('product').focus();
    return;
  }
  editor = document.createElement('iframe');
  editor.title = 'Editor visual de estampas';
  editor.src = 'creative-lab.html?print=1';
  el('editor-slot').append(editor);
  el('open-editor').textContent = 'Fechar editor visual';
};
el('product').onchange = closeEditor;
window.addEventListener('message', event => {
  if (!editor || event.origin !== location.origin || event.source !== editor.contentWindow
      || event.data?.type !== 'vyrtua-print-draft') return;
  const reply = message => {
    status(message);
    event.source.postMessage({type: 'vyrtua-print-result', message}, location.origin);
  };
  run(async () => {
    const product_id = el('product').value;
    if (!product_id) throw Error('Selecione um produto ativo.');
    const {draft, file} = event.data;
    await api.draft({
      product_id, color: draft.color, size: draft.size, quantity: draft.quantity, side: draft.side,
      print_width_cm: draft.print_width_cm, scale_percent: draft.scale_percent, vertical_percent: draft.vertical_percent
    }, file);
    reply('Rascunho criado com a estampa original.');
    closeEditor();
    el('open-editor').focus();
    orderOffset = 0;
    try { await refreshOrders(); } catch { status('Rascunho criado. Atualize o painel para vê-lo.'); }
  }, reply);
});
