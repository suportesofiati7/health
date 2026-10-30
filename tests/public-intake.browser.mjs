import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { startStaticServer } from '../scripts/lib/static-server.mjs';
import { fileURLToPath } from 'node:url';
const server=await startStaticServer(fileURLToPath(new URL('../',import.meta.url)));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
try {
  for(const scenario of ['saved','prepare-failure','upload-retry','old-browser']){
    const page=await browser.newPage();let prepares=0,uploads=0,completes=0;const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    if(scenario==='old-browser')await page.addInitScript(()=>{AbortSignal.timeout=undefined;});
    await page.route('**/*',async route=>{
      const req=route.request();
      if(!req.url().startsWith('https://'))return route.continue();
      if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, PUT, OPTIONS','Access-Control-Allow-Headers':'content-type'}});
      if(req.url().includes('/functions/v1/formulario')){
        const body=req.postDataJSON();
        if(body.action==='prepare'){
          prepares++;assert.equal(body.payload.full_name,'Fictional intake fixture');assert.equal(body.attachments.length,1);
          return route.fulfill({status:scenario==='prepare-failure'?400:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify(scenario==='prepare-failure'?{error:'cpf'}:{prepared:true,session:'fictional-session',files:[{upload_url:'https://upload.invalid/signed-file'}]})});
        }
        assert.equal(body.action,'complete');assert.equal(body.session,'fictional-session');completes++;
        return route.fulfill({status:202,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({received:true,email_status:'error'})});
      }
      if(req.url()==='https://upload.invalid/signed-file'){
        uploads++;assert.equal(req.method(),'PUT','Signed uploads require PUT');assert.equal(req.postDataBuffer().toString(),'fixture attachment content');
        return route.fulfill({status:scenario==='upload-retry'&&uploads===1?500:200,headers:{'Access-Control-Allow-Origin':'*'},body:'{}'});
      }
      return route.abort();
    });
    await page.goto(`${server.baseUrl}/formulario.html`);
    await page.locator('[name=selected_procedures][value=limpeza_pele]').waitFor();
    const enzymes=page.locator('.sf-consent-procedure').filter({has:page.locator('[name=selected_procedures][value=enzimas]')});
    assert.equal(await enzymes.locator('label small').first().innerText(),'Redução de papada e flacidez de face, pescoço e colo conforme avaliação.');
    await page.locator('[name=full_name]').fill('Fictional intake fixture');await page.locator('[name=cpf]').fill('52998224725');
    await page.locator('[name=selected_procedures][value=limpeza_pele]').check();
    for(const checkbox of await page.locator('form[data-public-intake] input[type=checkbox][required]').all())await checkbox.check();
    await page.locator('[name=identity_upload]').setInputFiles({name:'fixture.txt',mimeType:'text/plain',buffer:Buffer.from('fixture attachment content')});
    const submit=page.locator('form[data-public-intake] button[type=submit]');assert.equal(await submit.count(),1);
    assert.deepEqual(await page.locator('form[data-public-intake]').evaluate(form=>[...form.elements].filter(el=>el.willValidate&&!el.validity.valid).map(el=>({name:el.name,message:el.validationMessage}))),[]);
    await submit.click();
    if(scenario==='prepare-failure'){
      await page.locator('[data-form-state=error]:visible').waitFor();assert.equal(completes,0);assert.equal(uploads,0);
      assert.equal(await page.locator('[name=full_name]').inputValue(),'Fictional intake fixture');
    }else{
      if(scenario==='upload-retry'){await page.locator('[data-form-state=error]:visible').waitFor();await submit.click();}
      await Promise.race([page.waitForURL('**/obrigada.html'),page.locator('[data-form-state=error]:visible').waitFor().then(async()=>{throw Error(JSON.stringify({prepares,uploads,completes,errors,text:await page.locator('[data-form-state=error]').innerText()}));})]);assert.equal(completes,1);assert.equal(uploads,scenario==='upload-retry'?2:1);
    }
    assert.equal(prepares,1,'Retry keeps the original saved intake');assert.deepEqual(errors,[]);
    console.log(`PASS ${scenario}`);await page.close();
  }
}finally{await browser.close();await server.close();}
