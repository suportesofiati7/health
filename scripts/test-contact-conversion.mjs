import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { startStaticServer } from './lib/static-server.mjs';

const server = await startStaticServer(new URL('../', import.meta.url).pathname, { port: 4178 });
const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try {
  const context = await browser.newContext({viewport:{width:390,height:844}});
  const requests = [];
  await context.route('https://wa.me/**', route => route.fulfill({contentType:'text/html',body:'<title>Intercepted WhatsApp test</title>'}));
  await context.route('https://www.googletagmanager.com/**', route => route.fulfill({body:''}));
  await context.route('**/functions/v1/whatsapp-click', route => { if(route.request().method()==='POST') requests.push(route.request()); return route.fulfill({status:202,body:'{"received":true}',headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}); });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror',error => errors.push(error.message));
  const load = async path => {
    await page.goto(server.baseUrl + path);
    await page.waitForFunction(() => Boolean(document.querySelector('#sf-header-inline')) && Boolean(window.FrancieleAnalytics));
  };
  await load('/');
  await page.getByRole('button',{name:'Rejeitar',exact:true}).click();
  const mainLink = page.locator('.sf-hero-copy a[data-contact-method="whatsapp"]');
  await mainLink.waitFor();
  const target = new URL(await mainLink.getAttribute('href'));
  assert.equal(target.hostname,'wa.me');
  assert.equal(target.pathname,'/5543991043536');
  assert.equal(target.searchParams.get('text'),'Olá! Vim pelo site e gostaria de falar com Franciele Sofiati.');
  assert.equal(await mainLink.getAttribute('target'),'_blank');
  const popupPromise = page.waitForEvent('popup');
  await mainLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  assert.match(popup.url(),/^https:\/\/wa.me\//);
  await popup.close();
  assert.equal(requests.length,0,'declining analytics never blocks contact or sends counter requests');
  assert.equal(await page.evaluate(()=>window.dataLayer.filter(row=>row.event==='contact_click').length),0);
  const label = page.locator('.sff-contact-text');
  await label.waitFor({state:'visible'});
  await page.screenshot({path:'/tmp/sofiati-free-contact-mobile-ready.png'});
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`no horizontal overflow at ${width}px`);
  }
  await page.screenshot({path:'/tmp/sofiati-free-contact-desktop-ready.png'});
  // All new contact links feed the existing consented GA contact event, once per click.
  await page.evaluate(()=>window.SofiatiConsentMode.apply({analytics:true},'test'));
  const measuredRequest = page.waitForRequest(request => request.url().includes('/functions/v1/whatsapp-click') && request.method()==='POST');
  const bodyPopup = page.waitForEvent('popup');
  await mainLink.click();
  await (await bodyPopup).close();
  assert.equal(await page.evaluate(()=>window.dataLayer.filter(row=>row.event==='contact_click'&&row.link_location==='hero').length),1);
  await measuredRequest;
  assert.equal(requests.length,1,'the dashboard counter includes direct hero WhatsApp clicks');
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-sf-mobile-open]').click();
  const menuLink = page.locator('.sfm-primary');
  await menuLink.waitFor({state:'visible'});
  assert.match(await menuLink.getAttribute('href'),/^https:\/\/wa.me\/5543991043536/);
  assert.match(await menuLink.innerText(),/Conversar pelo WhatsApp/i);
  await page.keyboard.press('Escape');
  for (const [path, word] of [['/tratamentos.html',null],['/pele.html','pele'],['/laser.html','tratamentos a laser'],['/consulta.html',null],['/contato.html',null]]) {
    await load(path);
    const primary = page.locator('a.sf-button--primary[data-contact-method="whatsapp"][data-link-location="hero"]').first();
    await primary.waitFor({state:'visible'});
    const href = new URL(await primary.getAttribute('href'));
    assert.equal(href.hostname,'wa.me');
    assert.equal(href.searchParams.get('text'),'Olá! Vim pelo site e gostaria de falar com Franciele Sofiati.',`exact message for ${path}`);
    if(path==='/consulta.html') {
      assert.match(await page.locator('a[href="#consultation-request-form-section"]').first().innerText(),/Prefiro preencher o formulário/i);
      assert.equal(await page.locator('#consultation-request-form').count(),1);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' has no overflow');
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: direct mobile contact, correct number/messages, consent-denied contact, consented hero event, all-button counting, menu, standard contact message, form fallback and 320–1440px layouts. All external contact requests intercepted.');
} finally { await browser.close(); await server.close(); }
