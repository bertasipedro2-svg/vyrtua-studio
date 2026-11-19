const assert = require('node:assert/strict');
const {chromium, webkit, devices} = require('playwright');
const {createServer} = require('node:http');
const {readFile} = require('node:fs/promises');
const {resolve, extname, sep} = require('node:path');

const mime = {'.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css'};
const root = resolve(__dirname, '..');
const company = '11111111-1111-4111-8111-111111111111';
const product = '22222222-2222-4222-8222-222222222222';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAEklEQVR4nGP8z4APMOGVHbHSAEEsAROxCnMTAAAAAElFTkSuQmCC', 'base64');

async function main() {
  const server = createServer(async (req, res) => {
    try {
      const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!path.startsWith(root + sep)) throw Error('Outside test root');
      res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
      res.end(await readFile(path));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    const engine = process.env.PRINT_BROWSER === 'webkit' ? webkit : chromium;
    const executablePath = process.env.PRINT_CHROMIUM;
    browser = await engine.launch(executablePath ? {executablePath} : {});
    const page = await browser.newPage(devices['iPhone 13']);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let order, uploaded, savedProduct;
    await page.route('https://bwcfrgbvrhwbcjqdbtza.supabase.co/**', async route => {
      const {pathname} = new URL(route.request().url());
      const method = route.request().method();
      let json;
      if (pathname === '/auth/v1/token') json = {access_token: 'ui-test', refresh_token: 'ui-test', expires_in: 3600};
      if (pathname === '/rest/v1/companies') json = [{id: company, name: 'Loja teste', memberships: [{role: 'owner'}]}];
      if (pathname === '/rest/v1/products') {
        if (method === 'PATCH') savedProduct = route.request().postDataJSON();
        json = [{id: product, name: savedProduct?.name ?? 'Camiseta', active: true, price_cents: 2500}];
      }
      if (pathname === '/rest/v1/rpc/order_summary') {
        json = [{open_orders: order ? 1 : 0, production_orders: 0, quoted_cents: 0, completed_cents: 0}];
      }
      if (pathname.startsWith('/storage/v1/object/print-artworks/')) {
        uploaded = route.request().postDataBuffer();
        json = {};
      }
      if (pathname === '/rest/v1/orders') {
        if (method === 'POST') order = {...route.request().postDataJSON(), id: 'order-test', status: 'draft', created_at: new Date().toISOString()};
        if (method === 'PATCH') Object.assign(order, route.request().postDataJSON());
        json = order ? [order] : [];
      }
      if (json !== undefined) return route.fulfill({json});
      await route.fulfill({status: 404});
    });
    await page.goto('http://127.0.0.1:' + server.address().port + '/print-dev.html');
    await page.locator('#key').fill('sb_publishable_ui_test');
    await page.locator('#email').fill('interface@example.test');
    await page.locator('#password').fill('ui-test');
    await page.getByRole('button', {name: 'Entrar'}).click();
    await page.locator('#company').selectOption(company);
    await page.getByRole('button', {name: 'Editar produto'}).click();
    await page.locator('#product-name').fill('Camiseta personalizada');
    await page.getByRole('button', {name: 'Salvar produto'}).click();
    await page.getByText('Produto salvo.').waitFor();
    assert.equal(savedProduct.name, 'Camiseta personalizada');
    await page.locator('#product').selectOption(product);
    await page.getByRole('button', {name: 'Abrir editor visual'}).click();
    const iframe = page.frameLocator('iframe');
    await iframe.locator('#file').setInputFiles({name: 'teste.png', mimeType: 'image/png', buffer: png});
    await iframe.getByRole('button', {name: 'Salvar no painel VYRTUA PRINT'}).click();
    await page.getByRole('button', {name: 'Solicitar orçamento'}).click();
    await page.getByLabel('Total do orçamento em reais').fill('149.90');
    await page.getByRole('button', {name: 'Enviar orçamento'}).click();
    await page.getByRole('button', {name: 'Aprovar orçamento'}).click();
    await page.getByRole('button', {name: 'Iniciar produção'}).click();
    await page.getByRole('button', {name: 'Marcar pronto'}).click();
    await page.getByRole('button', {name: 'Concluir pedido'}).click();
    await page.getByText('Concluído ·', {exact: false}).waitFor();
    assert.equal(order.company_id, company);
    assert.equal(order.product_id, product);
    assert.equal(order.quote_cents, 14990);
    assert.deepEqual(uploaded, png);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile panel, editor, original file and order workflow (' + engine.name() + ', simulated API)');
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
