import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

// Exercise the actual HTTP wrapper, without loading the remote database SDK.
const source = (await readFile(new URL('../supabase/functions/_shared/core.ts', import.meta.url), 'utf8'))
  .replace(/^import .*?;\n/, 'const createClient = () => {};\n');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { endpoint } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

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
