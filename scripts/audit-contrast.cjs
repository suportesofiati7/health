#!/usr/bin/env node
/* Audit rendered body text against the effective section/card background. */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const port = 4177;
const base = `http://127.0.0.1:${port}`;
const englishOnly = ['1', 'true', 'yes'].includes((process.env.SOFIATI_ENGLISH_ONLY || '').toLowerCase());
const selectedRoutes = (process.env.SOFIATI_PAGES || '')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

function routes() {
  if (selectedRoutes.length) return [...new Set(selectedRoutes)].sort();
  const english = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name);
  const journalRoot = path.join(root, 'journal');
  const journal = fs.existsSync(journalRoot)
    ? fs.readdirSync(journalRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => `journal/${entry.name}`)
    : [];
  if (englishOnly) return [...english, ...journal].sort();
  const portugueseRoot = path.join(root, 'pt');
  const portuguese = fs.existsSync(portugueseRoot)
    ? fs.readdirSync(portugueseRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => `pt/${entry.name}`)
    : [];
  return [...english, ...journal, ...portuguese].sort();
}

function staticServer() {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, base).pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(`${root}${path.sep}`) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
      response.writeHead(404).end('Not found');
      return;
    }
    const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
    fs.createReadStream(filename).pipe(response);
  });
}

async function auditPage(page) {
  return page.evaluate(() => {
    const sceneBackgrounds = {
      porcelain: [255, 253, 249, 1],
      'paper-line': [252, 249, 243, 1],
      'sage-shadow': [238, 242, 233, 1],
      'blush-silk': [255, 244, 239, 1],
      'rose-metal': [253, 243, 238, 1],
      'architectural-light': [249, 247, 241, 1],
      'clinic-light': [250, 246, 239, 1],
      'technical-light': [241, 243, 237, 1],
      'olive-garden': [31, 50, 38, 1],
    };

    const parseColor = (value) => {
      const srgb = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/i);
      if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] ? Number(srgb[4]) : 1];
      const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*\/\s*|[,\s]+)?([\d.]*)/i);
      if (!match) return [0, 0, 0, 1];
      const channels = match.slice(1, 4).map(Number);
      return [...channels, match[4] ? Number(match[4]) : 1];
    };

    const composite = (foreground, background) => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      if (!alpha) return [0, 0, 0, 0];
      return [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) / alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) / alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) / alpha,
        alpha,
      ];
    };

    const luminance = (color) => {
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(color[0]) + 0.7152 * channel(color[1]) + 0.0722 * channel(color[2]);
    };

    const ratio = (first, second) => {
      const light = Math.max(luminance(first), luminance(second));
      const dark = Math.min(luminance(first), luminance(second));
      return (light + 0.05) / (dark + 0.05);
    };

    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
    };

    const findings = [];
    for (const section of document.querySelectorAll('.sf-main > section[data-chapter]')) {
      if (section.dataset.scene === 'final') continue;
      const scene = section.dataset.scene || '';
      const tone = section.dataset.tone || '';
      if (tone === 'forest' && scene !== 'olive-garden') {
        findings.push({
          section: section.id,
          selector: 'section',
          text: 'forest tone assigned to a non-dark scene',
          scene,
          ratio: 0,
          required: 4.5,
          opacity: 1,
        });
      }

      const baseBackground = sceneBackgrounds[scene] || (tone === 'forest' ? [31, 50, 38, 1] : [255, 253, 249, 1]);
      const elements = section.querySelectorAll('h2, h3, h4, p, li, dt, dd, label, .sf-chapter-number');
      for (const element of elements) {
        if (!visible(element) || !element.textContent.trim()) continue;
        if (element.closest('[aria-hidden="true"]') && !element.classList.contains('sf-chapter-number')) continue;

        const chain = [];
        let current = element;
        while (current && current !== section.parentElement) {
          chain.unshift(current);
          if (current === section) break;
          current = current.parentElement;
        }

        let background = baseBackground;
        let effectiveOpacity = 1;
        for (const node of chain) {
          const style = getComputedStyle(node);
          effectiveOpacity *= Number(style.opacity || 1);
          const layer = parseColor(style.backgroundColor);
          if (layer[3] > 0) background = composite(layer, background);
        }

        const style = getComputedStyle(element);
        const foregroundSource = parseColor(style.color);
        effectiveOpacity *= foregroundSource[3];
        const foreground = composite(
          [foregroundSource[0], foregroundSource[1], foregroundSource[2], effectiveOpacity],
          background,
        );
        const contrast = ratio(foreground, background);
        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
        const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        const required = large ? 3 : 4.5;
        if (contrast + 0.05 < required || effectiveOpacity < 0.7) {
          findings.push({
            section: section.id,
            selector: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''}`,
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
            scene,
            ratio: Number(contrast.toFixed(2)),
            required,
            opacity: Number(effectiveOpacity.toFixed(2)),
            foreground: style.color,
            background: background.slice(0, 3).map((value) => Math.round(value)).join(','),
          });
        }
      }
    }

    /* The Journal is an externally rendered editorial publication rather
       than a data-chapter page. Audit the actual elements that own visible
       text, with explicit bases for its dark image-led and forest sections. */
    const journal = document.querySelector('.sj-main, .sja-main');
    if (journal) {
      const textElements = new Set();
      const walker = document.createTreeWalker(journal, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.textContent.trim() && node.parentElement) textElements.add(node.parentElement);
      }

      for (const element of textElements) {
        if (!visible(element) || element.closest('[aria-hidden="true"]')) continue;

        let baseBackground = [255, 253, 249, 1];
        if (element.closest('.sj-full-feature__copy, .sj-overlay-story__copy')) {
          baseBackground = [48, 61, 51, 1];
        } else if (element.closest('.sja-faqs')) {
          baseBackground = [72, 84, 64, 1];
        } else if (element.closest('.sja-consultation')) {
          baseBackground = [48, 61, 51, 1];
        }

        const chain = [];
        let current = element;
        while (current && current !== journal.parentElement) {
          chain.unshift(current);
          if (current === journal) break;
          current = current.parentElement;
        }

        let background = baseBackground;
        let effectiveOpacity = 1;
        for (const node of chain) {
          const style = getComputedStyle(node);
          effectiveOpacity *= Number(style.opacity || 1);
          const layer = parseColor(style.backgroundColor);
          if (layer[3] > 0) background = composite(layer, background);
        }

        const style = getComputedStyle(element);
        const foregroundSource = parseColor(style.color);
        effectiveOpacity *= foregroundSource[3];
        const foreground = composite(
          [foregroundSource[0], foregroundSource[1], foregroundSource[2], effectiveOpacity],
          background,
        );
        const contrast = ratio(foreground, background);
        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
        const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        const required = large ? 3 : 4.5;
        if (contrast + 0.05 < required || effectiveOpacity < 0.7) {
          const owner = element.closest('[id]');
          findings.push({
            section: owner?.id || 'journal',
            selector: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''}`,
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
            scene: 'journal',
            ratio: Number(contrast.toFixed(2)),
            required,
            opacity: Number(effectiveOpacity.toFixed(2)),
            foreground: style.color,
            background: background.slice(0, 3).map((value) => Math.round(value)).join(','),
          });
        }
      }
    }
    return findings;
  });
}

(async () => {
  const server = staticServer();
  let browser;
  const report = { generatedAt: new Date().toISOString(), englishOnly, findings: [] };
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => localStorage.setItem(
        'sofiati_cookie_preferences_v3',
        JSON.stringify({ essential: true, preferences: false, analytics: false, externalMedia: false }),
      ));
      for (const route of routes()) {
        const page = await context.newPage();
        await page.goto(`${base}/${route}`, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => document.fonts?.ready || Promise.resolve());
        const findings = await auditPage(page);
        findings.forEach((finding) => report.findings.push({ route, width, ...finding }));
        await page.close();
      }
      await context.close();
    }
    fs.mkdirSync(path.join(root, 'qa'), { recursive: true });
    fs.writeFileSync(path.join(root, 'qa', 'contrast-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Contrast audit: ${routes().length} routes × 2 widths, ${report.findings.length} findings.`);
    report.findings.slice(0, 80).forEach((finding) => {
      console.log(`- ${finding.route} @ ${finding.width}px #${finding.section} ${finding.selector}: ${finding.ratio}:1 (needs ${finding.required}:1) “${finding.text}”`);
    });
    process.exitCode = report.findings.length ? 1 : 0;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
