import assert from 'node:assert/strict';
const base='https://bwcfrgbvrhwbcjqdbtza.supabase.co';
const key=process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(key?.startsWith('sb_publishable_'),'Missing development publishable key');
async function call(path,token,opts={}){
 const r=await fetch(base+path,{signal:AbortSignal.timeout(15000),...opts,headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),...opts.headers}});
 return r;
}
async function login(email,password){
 assert.ok(email&&password,'Missing test account credentials');
 const r=await call('/auth/v1/token?grant_type=password',null,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 assert.equal(r.status,200,'Auth failed');const d=await r.json();assert.ok(d.access_token);return d.access_token;
}
async function rows(table,token,filter=''){
 const r=await call('/rest/v1/'+table+'?select=*'+filter,token,{headers:{'Accept-Profile':'print'}});
 assert.equal(r.status,200,'Data API failed: '+table);return r.json();
}
const anonymous = await call('/rest/v1/companies?select=id', null, {
  headers: {'Accept-Profile': 'print'}
});
assert.equal(anonymous.status, 401, 'Anonymous access must be denied');
assert.equal((await anonymous.json()).code, '42501', 'The print schema must be exposed but protected');
console.log('PASS: live DEV Data API denies anonymous access to print');

if (process.argv.includes('--anonymous-only')) process.exit(0);

const a=await login(process.env.TEST_A_EMAIL,process.env.TEST_A_PASSWORD);
const b=await login(process.env.TEST_B_EMAIL,process.env.TEST_B_PASSWORD);
const ca=await rows('companies',a),cb=await rows('companies',b);
assert.equal(ca.length,1);assert.equal(cb.length,1);assert.notEqual(ca[0].id,cb[0].id);
for(const [token,own,other] of [[a,ca[0].id,cb[0].id],[b,cb[0].id,ca[0].id]]){
 const products=await rows('products',token);assert.ok(products.length>0,'Seed own products first');
 assert.ok(products.every(p=>p.company_id===own));
 assert.deepEqual(await rows('products',token,'&company_id=eq.'+other),[]);
 assert.deepEqual(await rows('orders',token,'&company_id=eq.'+other),[]);
}
console.log('PASS: HTTP authentication and cross-tenant read isolation');
