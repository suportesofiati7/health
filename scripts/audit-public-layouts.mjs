import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './lib/static-server.mjs';
const root = process.env.LAYOUT_ROOT || fileURLToPath(new URL('../', import.meta.url));
const output = process.env.LAYOUT_OUTPUT || `${root}/reports/goals/visual`;
await mkdir(output, { recursive: true });
const server = await startStaticServer(root);
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const articles = (await readdir(`${root}/blog`)).filter(name => name.endsWith('.html')).sort().map(name => `blog/${name}`);
const publicPages = (await readdir(root)).filter(name => name.endsWith('.html') && name !== 'typography-plan.html');
const services = (await readdir(`${root}/servicos`)).filter(name => name.endsWith('.html')).map(name => `servicos/${name}`);
const routes = [...publicPages, ...services, ...articles];
const results = [];
try {
  await Promise.all([390, 768, 1440].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.route('https://**', route => route.abort());
    const page = await context.newPage();
    const thumbnails = [];
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(server.baseUrl) && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`); });
    for (const route of routes) {
      errors = [];
      await page.goto(`${server.baseUrl}/${route}`, { waitUntil: 'load' });
      await page.locator('#sf-header-inline').waitFor({ timeout: 5000 });
      if (await page.locator('[data-cookie-reject]').isVisible()) await page.locator('[data-cookie-reject]').click();
      const isArticle = route.startsWith('blog/');
      await page.locator('img').evaluateAll(async images => {
        for (const image of images) image.loading = 'eager';
        await Promise.all(images.map(image => image.decode().catch(() => {})));
      });
      const state = await page.evaluate(isArticle => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        h1: document.querySelectorAll('h1').length,
        cta: !isArticle || !!document.querySelector('.sja-conversion a[data-contact-method="whatsapp"]'),
        broken: [...document.querySelectorAll('img')].filter(img => img.complete && !img.naturalWidth).map(img => img.getAttribute('src')),
      }), isArticle);
      const row = { route, width, ...state, errors: [...errors] };
      results.push(row);
      if (isArticle) {
        await page.locator('h1').scrollIntoViewIfNeeded();
        const screenshot = await page.screenshot();
        const thumb = await sharp(screenshot).resize(195, 450, { fit: 'contain', background: '#fffdf7' }).png().toBuffer();
        const caption = Buffer.from(`<svg width="195" height="38"><rect width="195" height="38" fill="#fffdf7"/><text x="6" y="15" font-size="10" fill="#1d3026">${articles.indexOf(route) + 1}. ${route.slice(5, 31)}</text><text x="6" y="29" font-size="10" fill="#1d3026">${width}px</text></svg>`);
        thumbnails.push(await sharp({ create: { width: 195, height: 488, channels: 3, background: '#fffdf7' } }).composite([{ input: caption, top: 0, left: 0 }, { input: thumb, top: 38, left: 0 }]).png().toBuffer());
        // Check that the bottom contact section is readable and within the viewport.
        await page.locator('.sja-contact-actions').scrollIntoViewIfNeeded();
        const clipped = await page.locator('.sja-contact-actions').evaluate(node => [...node.querySelectorAll('a')].some(a => a.getBoundingClientRect().right > innerWidth + 1 || a.getBoundingClientRect().left < -1));
        row.ctaClipped = clipped;
      }
      if (results.length % 80 === 0) console.log(`Audited ${results.length} page/viewport combinations`);
    }
    for (let start = 0; start < thumbnails.length; start += 25) {
      const batch = thumbnails.slice(start, start + 25);
      await sharp({ create: { width: 195 * 5, height: 488 * Math.ceil(batch.length / 5), channels: 3, background: '#fffdf7' } }).composite(batch.map((input, index) => ({ input, left: (index % 5) * 195, top: Math.floor(index / 5) * 488 }))).jpeg({ quality: 80 }).toFile(`${output}/articles-${width}-${Math.floor(start / 25) + 1}.jpg`);
    }
    await context.close();
  }));
  const defects = results.filter(row => row.overflow || row.h1 !== 1 || !row.cta || row.broken.length || row.errors.length || row.ctaClipped);
  await writeFile(`${output}/results.json`, JSON.stringify({ pages: routes.length, articles: articles.length, viewports: [390, 768, 1440], checked: results.length, defects, results }, null, 2));
  console.log(JSON.stringify({ checked: results.length, defects }, null, 2));
  if (defects.length) process.exitCode = 1;
} finally { await browser.close(); await server.close(); }
