export function createTenantSession(client) {
 let company=null;
 const db=client.schema('print');
 const check=r=>{if(r.error)throw r.error;return r.data};
 return {
 async login(email,password){company=null;return check(await client.auth.signInWithPassword({email,password}))},
 async logout(){company=null;check(await client.auth.signOut())},
 async companies(){return check(await db.from('companies').select('id,name'))},
 async selectCompany(id){company=null;const row=check(await db.from('companies').select('id').eq('id',id).single());if(!row)throw Error('Empresa indisponível');company=row.id},
 async products(){if(!company)throw Error('Selecione empresa');return check(await db.from('products').select('id,name,price_cents').eq('company_id',company).eq('active',true))}
 };
}
