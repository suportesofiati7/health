#!/usr/bin/env node

/**
 * Add intrinsic dimensions to local raster <img> elements that have neither
 * width nor height.  This is intentionally conservative: it never changes an
 * image file, URL, loading behaviour, existing dimensions, or CSS.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve('.');
const EXCLUDED_DIRECTORIES = new Set(['.git', 'dist', 'node_modules', 'reports', 'performance-reports']);
const RASTER_EXTENSIONS = new Set(['.avif', '.jpeg', '.jpg', '.png', '.webp']);
const APPLY = process.argv.includes('--apply');

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (extname(path).toLowerCase() === '.html') files.push(path);
  }
  return files;
}

function attributes(source) {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? ''])
  );
}

function localAssetPath(pagePath, source) {
  if (!source || /^(?:[a-z][a-z\d+.-]*:|\/\/|data:|#)/i.test(source)) return null;
  const clean = decodeURIComponent(source.split(/[?#]/, 1)[0]);
  const relativePage = relative(ROOT, pagePath).replaceAll('\\', '/');
  if (relativePage.startsWith('partials/') && clean.startsWith('assets/')) {
    return resolve(ROOT, clean);
  }
  if (relativePage.startsWith('partials/pt-BR/') && clean.startsWith('../assets/')) {
    return resolve(ROOT, clean.replace(/^\.\.\//, ''));
  }
  const asset = resolve(dirname(pagePath), clean);
  return asset.startsWith(resolve(ROOT, 'assets')) ? asset : null;
}

async function dimensions(asset) {
  if (!RASTER_EXTENSIONS.has(extname(asset).toLowerCase())) return null;
  try {
    const metadata = await sharp(asset, { animated: false }).metadata();
    return Number.isInteger(metadata.width) && Number.isInteger(metadata.height)
      ? { width: metadata.width, height: metadata.height }
      : null;
  } catch {
    return null;
  }
}

async function inspectPage(page) {
  const source = await readFile(page, 'utf8');
  const changes = [];
  for (const match of source.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = attributes(match[1]);
    // Existing author intent wins. We do not repair partial or conflicting dimensions.
    if (attrs.width || attrs.height) continue;
    const asset = localAssetPath(page, attrs.src);
    if (!asset) continue;
    const size = await dimensions(asset);
    if (!size) continue;
    changes.push({ start: match.index, end: match.index + match[0].length, size, asset });
  }
  if (!changes.length) return [];
  if (APPLY) {
    let updated = source;
    for (const change of [...changes].reverse()) {
      const tag = source.slice(change.start, change.end);
      const replacement = tag.replace(/^<img\b/i, `<img width="${change.size.width}" height="${change.size.height}"`);
      updated = updated.slice(0, change.start) + replacement + updated.slice(change.end);
    }
    await writeFile(page, updated);
  }
  return changes.map((change) => ({
    page: relative(ROOT, page).replaceAll('\\', '/'),
    asset: relative(ROOT, change.asset).replaceAll('\\', '/'),
    ...change.size
  }));
}

const pages = await walk(ROOT);
const changes = (await Promise.all(pages.map(inspectPage))).flat();
for (const change of changes) {
  process.stdout.write(`${APPLY ? 'Added' : 'Would add'} ${change.width}x${change.height}: ${change.page} → ${change.asset}\n`);
}
process.stdout.write(`${APPLY ? 'Applied' : 'Found'} ${changes.length} safe image-dimension fix${changes.length === 1 ? '' : 'es'}.\n`);
