#!/usr/bin/env node

import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const profile = process.argv[2];
if (!['mobile', 'desktop'].includes(profile)) {
  console.error('Usage: node scripts/run-lighthouse-regression.mjs <mobile|desktop>');
  process.exit(2);
}
const runs = Number(process.env.PERF_RUNS || 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 5) throw new Error('PERF_RUNS must be an integer from 1 to 5.');
const budget = JSON.parse(await readFile(resolve(root, 'config/performance/budget.json'), 'utf8'));
const thresholds = budget.laboratory[profile];
const defaultRoutes = [
  '/', '/sobre.html', '/tratamentos.html', '/pele.html', '/laser.html',
  '/consulta.html', '/contato.html', '/perguntas.html', '/blog.html',
  '/blog/depilacao-laser-gravidez-evidencia-e-decidir.html',
];
const routes = (process.env.PERF_ROUTES || defaultRoutes.join(','))
  .split(',').map((route) => route.trim()).filter(Boolean)
  .map((route) => route.startsWith('/') ? route : `/${route}`);
const baseUrl = (process.env.PERF_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outputRoot = resolve(root, 'performance-reports/lighthouse', profile);
const lighthouse = resolve(root, 'node_modules/.bin/lighthouse');
await mkdir(outputRoot, { recursive: true });

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const metric = (report, id) => {
  const value = report.audits?.[id]?.numericValue;
  if (!Number.isFinite(value)) throw new Error(`Lighthouse report is missing numeric audit ${id}.`);
  return value;
};
const failures = [];
const summary = [];

for (const route of routes) {
  const routeThresholds = { ...thresholds, ...(budget.routeOverrides?.[profile]?.[route] || {}) };
  const key = route.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'home';
  const reports = [];
  for (let run = 1; run <= runs; run += 1) {
    const reportPath = resolve(outputRoot, `${key}-run-${run}.json`);
    const result = spawnSync(lighthouse, [
      `${baseUrl}${route}`, '--quiet', '--output=json', `--output-path=${reportPath}`,
      ...(profile === 'desktop' ? ['--preset=desktop'] : ['--form-factor=mobile']), '--only-categories=performance,accessibility,best-practices,seo',
      '--throttling-method=devtools',
      '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
    ], { cwd: root, encoding: 'utf8', env: process.env, maxBuffer: 16 * 1024 * 1024 });
    if (result.status !== 0) {
      throw new Error(`Lighthouse failed for ${route} (${profile}, run ${run}): ${result.stderr || result.stdout}`);
    }
    reports.push(JSON.parse(await readFile(reportPath, 'utf8')));
  }

  const performanceScores = reports.map((report) => report.categories.performance.score * 100);
  const row = {
    route,
    performanceMedian: median(performanceScores),
    performanceMinimum: Math.min(...performanceScores),
    lcpMedian: median(reports.map((report) => metric(report, 'largest-contentful-paint'))),
    fcpMedian: median(reports.map((report) => metric(report, 'first-contentful-paint'))),
    tbtMedian: median(reports.map((report) => metric(report, 'total-blocking-time'))),
    clsMedian: median(reports.map((report) => metric(report, 'cumulative-layout-shift'))),
  };
  for (const [index, report] of reports.entries()) {
    for (const category of ['accessibility', 'best-practices', 'seo']) {
      const score = report.categories[category].score;
      if (score < 0.95) failures.push(`${route} run ${index + 1}: ${category} score ${Math.round(score * 100)}, minimum 95`);
    }
  }
  if (row.performanceMedian < routeThresholds.performanceMedianMinimum) failures.push(`${route}: performance median ${row.performanceMedian.toFixed(1)}, minimum ${routeThresholds.performanceMedianMinimum}`);
  if (row.performanceMinimum < routeThresholds.performanceRunMinimum) failures.push(`${route}: performance minimum ${row.performanceMinimum.toFixed(1)}, minimum ${routeThresholds.performanceRunMinimum}`);
  for (const [name, actual, field] of [
    ['LCP', row.lcpMedian, 'lcpMedianMaximum'], ['FCP', row.fcpMedian, 'fcpMedianMaximum'],
    ['TBT', row.tbtMedian, 'tbtMedianMaximum'], ['CLS', row.clsMedian, 'clsMedianMaximum'],
  ]) if (actual > routeThresholds[field]) failures.push(`${route}: ${name} median ${actual.toFixed(3)}, maximum ${routeThresholds[field]}`);
  summary.push(row);
  console.log(`${profile} ${route}: performance ${row.performanceMedian.toFixed(1)} median / ${row.performanceMinimum.toFixed(1)} min; LCP ${Math.round(row.lcpMedian)} ms; FCP ${Math.round(row.fcpMedian)} ms; TBT ${Math.round(row.tbtMedian)} ms; CLS ${row.clsMedian.toFixed(3)}`);
}

const summaryPath = resolve(outputRoot, 'summary.json');
await (await import('node:fs/promises')).writeFile(summaryPath, `${JSON.stringify({ profile, runs, baseUrl, summary, failures }, null, 2)}\n`);
if (failures.length) {
  console.error(`Lighthouse regression check failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Lighthouse ${profile} regression check passed for ${routes.length} routes × ${runs} runs. Reports: ${outputRoot}`);
}
