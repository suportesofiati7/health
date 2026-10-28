import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const origin = process.env.MANAGEMENT_TEST_URL || 'http://127.0.0.1:5173';
const publicOrigin = process.env.PUBLIC_TEST_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
try {
  for (const timezoneId of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.route('**/csp-test', route => route.fulfill({ contentType: 'text/html', headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://naypgbhwnlbyqqqfftgn.supabase.co"
    }, body: '<!doctype html><title>CSP regression</title>' }));
    await page.goto(`${origin}/csp-test`);
    const dates = await page.evaluate(async () => {
      const { parseDateInput, localDay, date, formatDateInput, toISO } = await import('/src/lib.js');
      return [parseDateInput('28/10/2026'), parseDateInput('29/02/2024'), parseDateInput('31/02/2026'), localDay('2026-10-29T01:00:00Z'), date('2026-10-28'), formatDateInput('2026-10-28'), formatDateInput('2026-10-29T01:30:00Z', true), date('invalid'), toISO('2026-10-28T12:30'), toISO('2026-10-28T15:30:00.000Z'), toISO('2026-10-28')];
    });
    assert.deepEqual(dates, ['2026-10-28', '2024-02-29', '', '2026-10-28', '28/10/2026', '28/10/2026', '28/10/2026 22:30', '', '2026-10-28T15:30:00.000Z', '2026-10-28T15:30:00.000Z', '2026-10-28T03:00:00.000Z']);
    for (const mode of ['summary', 'integral']) {
      const popupPromise = page.waitForEvent('popup');
      await page.evaluate(async mode => {
        const { openDocument, reportDocumentHTML } = await import('/src/documentSystem.js');
        openDocument(reportDocumentHTML({ title: mode, patient: { full_name: 'Fictional QA' }, body: '<p>Fictional clinical record</p>', documentId: 'QA', generated: '28/10/2026', mode, t: pt => pt }));
      }, mode);
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      await popup.evaluate(() => { window.printCalls = 0; window.print = () => window.printCalls++; });
      await popup.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
      assert.equal(await popup.evaluate(() => window.printCalls), 1, `print handler under CSP in ${timezoneId}`);
      const pdf = await popup.pdf({ format: 'A4' });
      assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
      await popup.close();
    }
    await context.close();
  }
  const context = await browser.newContext();
  await context.route('https://**', route => route.abort());
  const page = await context.newPage();
  await page.goto(`${publicOrigin}/formulario.html`);
  await page.locator('input[name="selected_procedures"][value="enzimas"]').check();
  const accept = page.locator('input[name="accepted_term_enzimas"]');
  assert.equal(await accept.isChecked(), false);
  assert.equal(await accept.getAttribute('required'), '');
  assert.equal(await page.locator('#identity-document').getAttribute('type'), 'text');
  await page.locator('#identity-document').fill('AB-123-X');
  await page.locator('#identity-issuer').fill('SSP PR');
  await page.locator('#identity-letter').fill('X');
  await accept.check();
  await page.reload();
  await page.locator('input[name="selected_procedures"][value="enzimas"]').waitFor();
  assert.equal(await accept.isChecked(), false, 'draft restoration never accepts an agreement');
  assert.equal(await page.locator('input[name="final_acceptance"]').isChecked(), false);
  await context.close();
  console.log('CSP printing/PDF, dates in three timezones, separate identity fields, and explicit consent checks passed.');
} finally { await browser.close(); }
