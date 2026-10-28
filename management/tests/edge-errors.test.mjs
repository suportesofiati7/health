import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

// Exercise the actual HTTP wrapper, without loading the remote database SDK.
const source = (await readFile(new URL('../supabase/functions/_shared/core.ts', import.meta.url), 'utf8'))
  .replace(/^import .*?;\n/, 'const createClient = () => {};\n');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { endpoint, headers } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('Edge HTTP errors preserve actionable Error.message codes without leaking details', async () => {
  const previous = globalThis.Deno;
  globalThis.Deno = { env: { get: key => key === 'MANAGEMENT_ORIGIN' ? 'https://clinic.invalid' : undefined } };
  try {
    for (const [error, expected] of [
      [Error('credentials'), 'credentials'],
      [Error('portal_unavailable'), 'portal_unavailable'],
      [Error('rate_limit'), 'rate_limit'],
      [{ code: '23505', message: 'sensitive database details' }, 'database_constraint'],
      [Error('SQL failed with private data'), 'request_failed']
    ]) {
      const response = await endpoint(async () => { throw error; })(new Request('https://api.invalid/', { method: 'POST', headers: { Origin: 'https://clinic.invalid' } }));
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: expected });
    }
  } finally { globalThis.Deno = previous; }
});


test('preview access is restricted to the configured public project and clinical intake', () => {
  const previous = globalThis.Deno;
  globalThis.Deno = { env: { get: key => key === 'PUBLIC_PAGES_HOST' ? 'health-95k.pages.dev' : undefined } };
  try {
    for (const path of ['/formulario', '/functions/v1/formulario']) {
      const request = new Request(`https://api.invalid${path}`, { headers: { Origin: 'https://df2b7ffd.health-95k.pages.dev' } });
      assert.equal(headers(request)['Access-Control-Allow-Origin'], 'https://df2b7ffd.health-95k.pages.dev');
    }
    for (const [path, origin] of [
      ['/staff', 'https://df2b7ffd.health-95k.pages.dev'],
      ['/staff/formulario', 'https://df2b7ffd.health-95k.pages.dev'],
      ['/portal', 'https://df2b7ffd.health-95k.pages.dev'],
      ['/formulario', 'https://unrelated.pages.dev'],
      ['/formulario', 'https://df2b7ffd.health-95k.pages.dev.attacker.invalid'],
      ['/formulario', 'http://df2b7ffd.health-95k.pages.dev'],
      ['/formulario', 'https://df2b7ffd.health-95k.pages.dev:8443']
    ]) assert.equal(headers(new Request(`https://api.invalid${path}`, { headers: { Origin: origin } }))['Access-Control-Allow-Origin'], 'null');
  } finally { globalThis.Deno = previous; }
});

test('public intake accepts the public www alias only when the apex public origin is configured', () => {
  const previous = globalThis.Deno;
  globalThis.Deno = { env: { get: key => key === 'PUBLIC_ORIGIN' ? 'https://francielesofiati.com' : undefined } };
  try {
    for (const [path, origin] of [
      ['/functions/v1/formulario', 'https://francielesofiati.com'],
      ['/functions/v1/formulario', 'https://www.francielesofiati.com'],
      ['/formulario', 'https://www.francielesofiati.com']
    ]) {
      const request = new Request(`https://api.invalid${path}`, { method: 'OPTIONS', headers: { Origin: origin } });
      assert.equal(headers(request)['Access-Control-Allow-Origin'], origin);
    }
    for (const [path, origin] of [
      ['/functions/v1/formulario', 'https://evilfrancielesofiati.com'],
      ['/functions/v1/formulario', 'https://francielesofiati.com.attacker.invalid'],
      ['/functions/v1/formulario', 'http://www.francielesofiati.com'],
      ['/functions/v1/intake', 'https://www.francielesofiati.com']
    ]) {
      const request = new Request(`https://api.invalid${path}`, { method: 'OPTIONS', headers: { Origin: origin } });
      assert.equal(headers(request)['Access-Control-Allow-Origin'], 'null');
    }
  } finally { globalThis.Deno = previous; }
});
