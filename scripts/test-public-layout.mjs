#!/usr/bin/env node

import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './lib/static-server.mjs';

const server = process.env.PUBLIC_TEST_URL ? null : await startStaticServer(fileURLToPath(new URL('../', import.meta.url)));
const origin = (process.env.PUBLIC_TEST_URL || server.baseUrl).replace(/\/$/, '');
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36',
  });
  await page.addInitScript(() => {
    window.__qaCLS = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__qaCLS += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`${origin}/tratamentos.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => ({ scrollY: window.scrollY, cls: window.__qaCLS }));
  assert.equal(state.scrollY, 0, 'treatment directory opens at the top on mobile');
  assert.ok(state.cls < 0.05, `user-visible CLS stays below 0.05 (actual ${state.cls})`);
  console.log(`Treatment directory mobile layout passed: scrollY=${state.scrollY}, CLS=${state.cls.toFixed(3)}.`);
} finally {
  await browser.close();
  await server?.close();
}
