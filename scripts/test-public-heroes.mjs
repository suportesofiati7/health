#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { startStaticServer } from './lib/static-server.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const routes = [];
for (const name of await readdir(root)) {
  if (name.endsWith('.html') && (await readFile(resolve(root, name), 'utf8')).includes('data-pattern="hero"')) routes.push(name);
}
const server = process.env.PUBLIC_TEST_URL ? null : await startStaticServer(root);
const origin = (process.env.PUBLIC_TEST_URL || server.baseUrl).replace(/\/$/, '');
const screenshots = process.env.HERO_SCREENSHOT_DIR;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  const page = await browser.newPage();
  for (const route of routes) {
    await page.goto(`${origin}/${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.SofiatiSite.init());
    if (!await page.locator('.sf-main > [data-pattern="hero"]').count()) {
      console.log(`${route}: no rendered hero (existing page behavior)`);
      continue;
    }
    await page.waitForSelector('.sf-hero-underlay');
    await page.evaluate(() => document.querySelector('#sf-cookie-inline')?.remove());
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: width === 1024 ? 600 : 900 });
      await page.waitForTimeout(350); // Allow ResizeObserver to update the menu footprint.
      const state = await page.evaluate(async () => {
        const hero = document.querySelector('.sf-main > [data-pattern="hero"]');
        const rect = hero.getBoundingClientRect();
        const bar = document.querySelector('#sf-topbar-inline').getBoundingClientRect();
        const header = document.querySelector('#sf-header-inline').getBoundingClientRect();
        const copy = hero.querySelector('.sf-hero-copy').getBoundingClientRect();
        const photo = getComputedStyle(hero, innerWidth < 1024 ? '::before' : null);
        const url = photo.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
        const image = new Image();
        if (url) { image.src = url; await image.decode(); }
        return {
          top: rect.top, barBottom: bar.bottom, headerTop: header.top, headerBottom: header.bottom,
          copyTop: copy.top, copyWidth: copy.width, photoHeight: parseFloat(photo.height), photoWidth: parseFloat(photo.width), imageWidth: image.naturalWidth, heroWidth: rect.width,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      const context = `${route}, ${width}px`;
      assert.ok(Math.abs(state.top - state.barBottom) <= 1, `${context}: hero meets utility bars without a background gap`);
      assert.ok(state.headerTop >= state.top && state.headerBottom < state.copyTop, `${context}: menu overlays the hero without blocking copy`);
      assert.ok(state.imageWidth > 0, `${context}: portrait loads`);
      assert.ok(!state.overflow, `${context}: no horizontal overflow`);
      if (width < 1024) {
        assert.ok(state.copyWidth <= state.heroWidth * .6, `${context}: text remains on the left of the portrait`);
        assert.ok(Math.abs(state.photoWidth - state.heroWidth) < 1, `${context}: portrait fills the hero width`);
      }
      if (screenshots && [390, 1440].includes(width)) await page.screenshot({ path: resolve(screenshots, `${route}-${width}.png`) });
    }
    console.log(`${route}: six responsive hero layouts passed`);
  }
} finally {
  await browser.close();
  await server?.close();
}
