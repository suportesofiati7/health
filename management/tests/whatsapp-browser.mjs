import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const origin = process.env.MANAGEMENT_TEST_URL || 'http://127.0.0.1:5560';
const browser = await chromium.launch({ executablePath:'/usr/bin/google-chrome', headless:true, args:['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1000} });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/preview/whatsapp`);
  await page.getByRole('heading', { name:'Cliques no WhatsApp', exact:true }).waitFor();
  await page.locator('.wa-metric strong').first().filter({hasText:/^\d/}).waitFor();
  const readCount = async () => Number((await page.locator('.wa-metric strong').first().innerText()).replace(/\D/g,''));
  const initial = await readCount();
  const frame = page.frameLocator('iframe');
  // Consent denied: clicking still works without sending measurement.
  await frame.getByRole('link').click();
  await page.getByRole('button', { name:'Atualizar', exact:true }).click();
  await page.waitForFunction(() => document.querySelector('.wa-dashboard').getAttribute('aria-busy') === 'false');
  assert.equal(await readCount(), initial);
  // Consent granted: actual public analytics code calls the collector once.
  await frame.getByRole('checkbox').check();
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/__whatsapp/collect'));
  await frame.getByRole('link').click();
  const response = await responsePromise;
  assert.equal(response.status(), 202);
  const request = response.request();
  const body = request.postDataJSON();
  assert.deepEqual(Object.keys(body).sort(), ['consent','event_id']);
  await page.getByRole('button', { name:'Atualizar', exact:true }).click();
  await page.waitForFunction(expected => document.querySelector('.wa-metric strong')?.textContent === String(expected), initial + 1);
  // Retrying the same event is idempotent.
  const retry = await page.request.post(`${origin}/__whatsapp/collect`, {data:body});
  assert.equal(retry.status(), 202);
  await page.reload();
  await page.waitForFunction(expected => document.querySelector('.wa-metric strong')?.textContent === String(expected), initial + 1);
  await page.getByRole('button', { name:'7 dias', exact:true }).click();
  assert.equal(await page.locator('.wa-chart-column').count(), 7);
  await page.getByText('Ver tabela de cliques', {exact:true}).click();
  assert.match(await page.locator('tbody').innerText(), /Sem histórico/);
  const csvPromise = page.waitForEvent('download');
  await page.getByRole('button', {name:'Baixar planilha'}).click();
  assert.match((await csvPromise).suggestedFilename(), /^whatsapp-.*\.csv$/);
  await page.screenshot({path:'/tmp/sofiati-whatsapp-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'/tmp/sofiati-whatsapp-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow on mobile');
  await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
  await page.screenshot({path:'/tmp/sofiati-whatsapp-dark.png',fullPage:true});
  // A failed refresh must show an error, never convert missing data into zeros.
  await page.route('**/__whatsapp/report', route => route.fulfill({status:503,body:'{}'}));
  await page.getByRole('button', {name:'Atualizar',exact:true}).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await readCount(), initial + 1);
  assert.deepEqual(errors, []);
  console.log('PASS: denied/granted consent, one click → one count, duplicate retry, reload persistence, 7-day filter, CSV, mobile, dark mode, failed refresh.');
} finally { await browser.close(); }
