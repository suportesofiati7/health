import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const origin = process.env.PUBLIC_TEST_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
try {
  for (const scenario of ['app-failure', 'email-retry', 'old-browser', 'attachments', 'english']) {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    let appCalls = 0, emailCalls = 0;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (scenario === 'old-browser') await page.addInitScript(() => { AbortSignal.timeout = undefined; });
    await page.route('**/functions/v1/formulario', async route => {
      appCalls++;
      const body = route.request().postDataBuffer().toString();
      assert.match(body, /Fictional intake fixture/);
      if (scenario === 'attachments') assert.match(body, /fixture attachment content/);
      await route.fulfill({
        status: scenario === 'app-failure' ? 400 : 202,
        contentType: 'application/json',
        body: JSON.stringify(scenario === 'app-failure' ? { error: 'cpf' } : { received: true, email_status: scenario === 'email-retry' ? 'error' : 'sent' })
      });
    });
    await page.route('https://formsubmit.co/**', async route => {
      emailCalls++;
      assert.equal(appCalls, 1, 'email must follow confirmed app save');
      assert.equal(route.request().postDataJSON().full_name, 'Fictional intake fixture');
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: emailCalls === 1 ? 'false' : 'true' }) });
    });
    await page.goto(`${origin}/${scenario === 'english' ? 'en/form.html' : 'formulario.html'}`);
    assert.equal(await page.locator('#marketing_authorization_files').count(), 0, 'image-authorisation upload must not be offered');
    assert.equal(await page.locator('.sf-document-links a[target="_blank"]').count(), 2, 'privacy and complete terms must be readable in a new tab');
    await page.locator('[name="cpf"]').fill('00000000000');
    await page.locator('[name="full_name"]').fill('Fictional intake fixture');
    await page.locator('[name="selected_procedures"]').first().check();
    if (scenario === 'attachments') await page.locator('input[type="file"]').first().setInputFiles({ name: 'fixture.txt', mimeType: 'text/plain', buffer: Buffer.from('fixture attachment content') });
    const submitButtons = page.locator('form[data-public-intake] button[type="submit"]');
    assert.equal(await submitButtons.count(), 2, 'both delivery choices must be shown');
    await page.locator('[data-delivery-trigger="system"]').click();
    if (scenario === 'app-failure') {
      await page.getByText('Informe o CPF completo com 11 dígitos.', { exact: true }).waitFor();
      assert.equal(appCalls, 1);
      assert.equal(emailCalls, 0, 'failed app save must not send email');
      assert.equal(await page.locator('[name="full_name"]').inputValue(), 'Fictional intake fixture');
    } else {
      if (scenario === 'email-retry') {
        await page.getByText('Salvo no aplicativo', { exact: true }).waitFor();
        await page.locator('[data-delivery-trigger="email"]').click();
      }
      await page.waitForURL(scenario === 'english' ? '**/en/thank-you.html' : '**/obrigada.html');
      assert.equal(appCalls, 1, 'email retry must not resave the intake');
      assert.equal(emailCalls, scenario === 'email-retry' ? 2 : 0);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${scenario}`);
    await page.close();
  }
} finally { await browser.close(); }
