import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { startStaticServer } from './lib/static-server.mjs';
import { fileURLToPath } from 'node:url';
const server = await startStaticServer(fileURLToPath(new URL('../', import.meta.url)));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.route('https://**', route => route.abort());
  await page.goto(`${server.baseUrl}/formulario.html`);
  await page.locator('[name=selected_procedures][value=peeling_cristal]').waitFor();
  await page.locator('[data-cookie-banner]').waitFor();
  assert.equal(await page.locator('[data-cookie-save]').isVisible(), false, 'advanced cookie actions start hidden');
  await page.locator('[data-cookie-customize]').click();
  assert.equal(await page.locator('[data-cookie-save]').isVisible(), true);
  await page.locator('[data-cookie-reject]').click();
  assert.equal(await page.locator('[data-cookie-banner]').isVisible(), false, 'reject closes the banner');

  for (const [value, name] of [['peeling_ultrassonico', 'Peeling Ultrassônico'], ['peeling_cristal', 'Peeling de Cristal'], ['peeling_diamante', 'Peeling de Diamante'], ['limpeza_pele', 'Limpeza de Pele']]) {
    const option = page.locator('.sf-consent-procedure').filter({ has: page.locator(`[name=selected_procedures][value=${value}]`) });
    assert.equal(await option.locator('strong').innerText(), name);
    assert.ok((await option.locator('small').innerText()).length > 15);
    await option.locator('[name=selected_procedures]').check();
    assert.equal(await option.locator('[name^=accepted_term_]').isChecked(), false);
    assert.equal(await option.locator('[name^=accepted_term_]').getAttribute('required'), '');
  }
  assert.equal(await page.locator('.sf-document-links a').last().getAttribute('href'), 'https://francielesofiati.com/termos');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const details = await page.locator('#sf-topbar-inline').evaluate(node => {
      const selectors = ['.sft-motto', '.sft-link', '.sft-location'];
      return selectors.map(selector => { const el = node.querySelector(selector); return { visible: el.getBoundingClientRect().width > 0, left: el.getBoundingClientRect().left }; });
    });
    if (width < 768) {
      assert.ok(details.every(item => item.visible), `all clinic details visible at ${width}`);
      assert.ok(Math.max(...details.map(item => item.left)) - Math.min(...details.map(item => item.left)) < 2, `left alignment at ${width}`);
    }
  }
  await page.evaluate(async () => {
    const { confirmAction } = await import('/js/core/dialog.js');
    window.confirmed = null; confirmAction('Excluir registro fictício?').then(value => window.confirmed = value);
  });
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.waitForFunction(() => window.confirmed === false);
  assert.equal(await page.evaluate(() => window.confirmed), false);
  await page.evaluate(async () => {
    const { confirmAction } = await import('/js/core/dialog.js');
    confirmAction('Excluir registro fictício?').then(value => window.confirmed = value);
  });
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await page.waitForFunction(() => window.confirmed === true);
  assert.equal(await page.evaluate(() => window.confirmed), true);
  await page.evaluate(async () => {
    const { promptAction } = await import('/js/core/dialog.js');
    promptAction('Nome do modelo', '<modelo>').then(value => window.prompted = value);
  });
  await page.getByRole('textbox', { name: 'Nome do modelo' }).fill('Modelo revisado');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.waitForFunction(() => window.prompted === 'Modelo revisado');
  assert.equal(await page.evaluate(() => window.prompted), 'Modelo revisado');
  await page.evaluate(async () => {
    const { confirmAction } = await import('/js/core/dialog.js');
    confirmAction('Cancelar pelo teclado?').then(value => window.escaped = value);
  });
  await page.getByRole('dialog', { name: 'Confirmar ação' }).waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.escaped === false);
  assert.equal(await page.evaluate(() => window.escaped), false);
  console.log('PASS: mobile alignment, four explicit procedure consents, terms URL, dialog confirmation/cancellation/text/Escape.');
} finally { await browser.close(); await server.close(); }
