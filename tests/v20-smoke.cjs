const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 fs.mkdirSync('test-results',{recursive:true});
 let failed=false;
 for(const [name,engine] of Object.entries({chromium,webkit})){
  let browser;
  try{
   browser=await engine.launch(name==='chromium'?{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }:{});
   const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of ['index.html','catalogo.html','carrinho.html','manequins-3d.html','showroom-floating-tee.html']){
    const response=await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200,route);
    if(route==='manequins-3d.html'){await page.locator('.viewer').first().scrollIntoViewIfNeeded();await page.locator('.viewer canvas').first().waitFor({timeout:60000});}
    if(route==='showroom-floating-tee.html'){
     await page.waitForFunction(()=>document.querySelector('#viewer')?.loaded===true,{},{timeout:90000});
     const bytes=await page.evaluate(async()=> (await document.querySelector('#viewer').toBlob({mimeType:'image/png'})).size);
     assert.ok(bytes>1000,'PNG capture empty');
     await page.locator('#threeEngine').click();
     await page.waitForFunction(()=>document.querySelector('#threeEngine').textContent.includes('Voltar'),{},{timeout:90000});
     await page.screenshot({path:'test-results/'+name+'-three.png'});
     await page.locator('#threeEngine').click();
    }
    await page.screenshot({path:'test-results/'+name+'-'+route+'.png'});
   }
   assert.deepEqual(errors,[]);
  }catch(e){failed=true;console.error(name,e);fs.writeFileSync('test-results/'+name+'-error.txt',String(e.stack||e));}
  finally{await browser?.close();}
 }
 process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
