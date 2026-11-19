import {validateDraft} from './order.mjs';
const base='https://bwcfrgbvrhwbcjqdbtza.supabase.co';
export function createPrintApi(key){
 if(!key.startsWith('sb_publishable_')) throw Error('Use somente a chave publicável de desenvolvimento');
 let token=null, company=null;
 async function request(path,{method='GET',body,headers={},auth=true}={}){
 const h={apikey:key,...headers}; if(auth){if(!token)throw Error('Faça login');h.Authorization='Bearer '+token;}
 if(body!==undefined && !(body instanceof Blob)){h['Content-Type']='application/json';body=JSON.stringify(body);}
 const r=await fetch(base+path,{method,headers:h,body,cache:'no-store'});
 if(!r.ok)throw Error('API: '+r.status+' — '+(await r.text()).slice(0,300));
 return r.status===204?null:await r.json();
 }
 const db=(path,opts={})=>request('/rest/v1/'+path,{...opts,headers:{'Accept-Profile':'print','Content-Profile':'print',...opts.headers}});
 return {
 async login(email,password){token=null;company=null;const r=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},auth:false});token=r.access_token;},
 async logout(){try{if(token)await request('/auth/v1/logout',{method:'POST'});}finally{token=null;company=null;}},
 companies(){return db('companies?select=id,name');},
 async selectCompany(id){company=null;const rows=await db('companies?select=id&id=eq.'+encodeURIComponent(id));if(rows.length!==1)throw Error('Empresa indisponível');company=rows[0].id;},
 products(){if(!company)throw Error('Selecione empresa');return db('products?select=id,name,price_cents&active=eq.true&company_id=eq.'+encodeURIComponent(company));},
 async draft(d,file){if(!company)throw Error('Selecione empresa');validateDraft(d);const tenant=company;
 const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file?.type];if(!ext||!file.size||file.size>10485760)throw Error('Estampa inválida');
 const path=tenant+'/'+crypto.randomUUID()+'.'+ext;
 await request('/storage/v1/object/print-artworks/'+path,{method:'POST',body:file,headers:{'Content-Type':file.type,'x-upsert':'false'}});
 if(company!==tenant)throw Error('Empresa mudou; pedido não gravado');
 return db('orders',{method:'POST',headers:{Prefer:'return=representation'},body:{company_id:tenant,product_id:d.product_id,quantity:d.quantity,color:d.color,size:d.size,side:d.side,print_width_cm:d.print_width_cm,scale_percent:d.scale_percent,vertical_percent:d.vertical_percent,artwork_path:path}});
 }
 };
}
