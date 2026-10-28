#!/usr/bin/env node

import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { startStaticServer } from './lib/static-server.mjs';

const server = process.env.PUBLIC_TEST_URL ? null : await startStaticServer(new URL('../', import.meta.url).pathname, { port: 4174 });
const publicOrigin = process.env.PUBLIC_TEST_URL || server.baseUrl;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  const context = await browser.newContext();
  let turnstileRequests = 0;
  await context.route('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async (route) => {
    turnstileRequests += 1;
    await route.fulfill({
      contentType: 'application/javascript',
      body: `window.turnstile = {
        render(_element, options) { window.__qaTurnstileOptions = options; return 'qa-widget'; },
        execute() { window.__qaTurnstileOptions.callback('fictional-test-token'); }
      };`,
    });
  });
  let intakeRequest = null;
  await context.route('**/functions/v1/formulario', async (route) => {
    intakeRequest = route.request();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ received: true, email_status: 'sent' }) });
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => { throw error; });
  if (!process.env.PUBLIC_TEST_URL) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${publicOrigin}/tratamentos.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => window.scrollY), 0, 'the treatment directory does not scroll visitors away from the top on load');

    await page.goto(`${publicOrigin}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SofiatiFunnelToken === 'function');
    assert.equal(turnstileRequests, 0, 'Turnstile stays unloaded until a visitor interacts with a protected form');

    await page.goto(`${publicOrigin}/contato.html`, { waitUntil: 'domcontentloaded' });
    const form = page.locator('form[data-funnel-ready]').first();
    await form.waitFor({ state: 'attached' });
    assert.equal(turnstileRequests, 0, 'opening the contact route does not fetch the challenge script');
    await form.locator('input:not([type="hidden"]):not([type="checkbox"]):not([tabindex="-1"])').first().focus();
    await page.waitForFunction(() => Boolean(document.querySelector('form[data-funnel-ready]')?.dataset.funnelWidget));
    const token = await page.evaluate(async () => window.SofiatiFunnelToken(document.querySelector('form[data-funnel-ready]')));
    assert.equal(token, 'fictional-test-token', 'the interaction-time challenge still provides the token required by protected submission');
    assert.equal(turnstileRequests, 1, 'the challenge library is loaded only once');
  }

  await page.goto(`${publicOrigin}/${process.env.PUBLIC_TEST_URL ? 'formulario' : 'formulario.html'}`, { waitUntil: 'domcontentloaded' });
  const intakeForm = page.locator('form[data-public-intake]');
  await intakeForm.waitFor({ state: 'attached' });
  for (const [name, fileName] of [['identity_upload', 'fictional-id.txt'], ['booking_payment_receipt', 'fictional-receipt.txt']]) {
    await intakeForm.locator(`input[name="${name}"]`).setInputFiles({ name: fileName, mimeType: 'text/plain', buffer: Buffer.from('Fictional QA attachment only.') });
  }
  await intakeForm.evaluate((form) => {
    const set = (field, value) => { field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true })); };
    for (const field of form.querySelectorAll('[required]')) {
      if (field.disabled || field.type === 'file') continue;
      if (field.type === 'checkbox') {
        if (field.name === 'selected_procedures' && field !== form.querySelector('[name=selected_procedures]')) continue;
        field.checked = true; field.dispatchEvent(new Event('change', { bubbles: true })); continue;
      }
      if (field.tagName === 'SELECT') {
        const option = [...field.options].find((item) => item.value); if (option) set(field, option.value); continue;
      }
      const name = field.name || '';
      if (field.type === 'email') set(field, 'qa@example.invalid');
      else if (/cpf/i.test(name)) set(field, '52998224725');
      else if (/birth_date|appointment_date/.test(name) || field.inputMode === 'numeric') set(field, '01/01/2000');
      else if (field.type === 'time') set(field, '10:00');
      else if (field.type === 'tel' || /phone|telefone|whatsapp/i.test(name)) set(field, '43991043536');
      else if (field.type === 'number') set(field, '1');
      else if (field.type === 'textarea') set(field, 'Não');
      else set(field, 'Fictional QA');
    }
    const selected = form.querySelector('[name=selected_procedures][value="harmony"]');
    if (selected) { selected.checked = true; selected.dispatchEvent(new Event('change', { bubbles: true })); }
    for (const field of form.querySelectorAll('[required][type=checkbox]')) field.checked = true;
    const dateFields = form.querySelectorAll('input[name=birth_date],input[name=appointment_date]');
    for (const field of dateFields) set(field, '01/01/2000');
    const cpf = form.querySelector('[name=cpf]'); if (cpf) set(cpf, '52998224725');
    const email = form.querySelector('[name=email]'); if (email) set(email, 'qa@example.invalid');
    const fullName = form.querySelector('[name=full_name]'); if (fullName) set(fullName, 'Fictional QA Patient');
    const phone = form.querySelector('[name=phone]'); if (phone) set(phone, '43991043536');
    for (const field of form.querySelectorAll('textarea[required]')) if (!field.value) set(field, 'Não');
    const valid = form.checkValidity();
    const invalid = [...form.querySelectorAll(':invalid')].slice(0, 12).map((item) => item.name || item.id || item.tagName);
    return { valid, invalid };
  }).then((result) => { assert.deepEqual(result, { valid: true, invalid: [] }, 'fictional complete intake fixture satisfies client validation'); });
  await intakeForm.locator('button[type=submit]').click();
  await page.waitForURL('**/obrigada*');
  assert.ok(intakeRequest, 'completed intake submits to the configured Supabase function');
  const multipart = intakeRequest.postDataBuffer()?.toString('latin1') || '';
  assert.match(multipart, /Fictional QA Patient/);
  assert.match(multipart, /52998224725/);
  await context.close();
  console.log(process.env.PUBLIC_TEST_URL
    ? 'Published full-intake page passed with a fictional request intercepted before reaching Supabase.'
    : 'Public forms passed: deferred Turnstile and fictional full-intake submission through the configured function.');
} finally {
  await browser.close();
  await server?.close();
}
