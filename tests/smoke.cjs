const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('catalog schema',()=>{const d=JSON.parse(read('data/catalog.json'));assert.ok(Array.isArray(d.products));assert.ok(Array.isArray(d.categories));assert.equal(new Set(d.categories.map(c=>c.id)).size,d.categories.length);for(const p of d.products){assert.ok(d.categories.some(c=>c.id===p.categoryId));assert.ok(p.priceCents==null||Number.isSafeInteger(p.priceCents)&&p.priceCents>=0)}});
test('homepage local links exist',()=>{for(const m of read('index.html').matchAll(/href="([^"]+)"/g)){const p=m[1].split(/[?#]/)[0];if(p&&!/^(https?:|mailto:|tel:|\/)/.test(p))assert.ok(fs.existsSync(p),p)}});
test('mannequin regression markers',()=>{const s=read('manequins-3d.html');assert.ok(s.includes('white.clone()'));assert.ok(s.includes('o.geometry.dispose()'));assert.ok(s.includes('localWhite.color.setHex'))});
test('catalog editor preservation markers',()=>{const s=read('editor-catalogo.html');for(const v of ['old.variants','old.printAreas','old.shippingNotes','old.images.slice(1)'])assert.ok(s.includes(v))});
