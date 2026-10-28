import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
const { code } = await transform(await readFile(new URL('../supabase/functions/_shared/support-notification.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'esm' });
const { notifySupport } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('support notifications use both confirmed inboxes and require relay confirmation', async () => {
  const previousFetch = globalThis.fetch, previousDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: () => undefined } };
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://formsubmit.co/ajax/suportesofiati@gmail.com');
      const body = Object.fromEntries(options.body);
      assert.equal(body._cc, 'sofiatimendonca@gmail.com');
      assert.equal(body.mensagem, 'Fictional diagnostic');
      return Response.json({ success: 'true' });
    };
    assert.equal(await notifySupport({ mensagem: 'Fictional diagnostic' }), true);
    for (const response of [Response.json({ success: false }), new Response('<html>not accepted</html>'), Response.json({ success: true }, { status: 503 })]) {
      globalThis.fetch = async () => response;
      assert.equal(await notifySupport({}), false);
    }
    globalThis.fetch = async () => { throw Error('offline'); };
    assert.equal(await notifySupport({}), false);
  } finally { globalThis.fetch = previousFetch; globalThis.Deno = previousDeno; }
});
