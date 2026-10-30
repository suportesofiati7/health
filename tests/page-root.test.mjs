import test from 'node:test';
import assert from 'node:assert/strict';
import { assetPrefix } from '../js/core/page.js';
test('runtime assets resolve correctly with fingerprinted CSS on nested public routes', () => {
  const original = globalThis.document;
  try {
    for (const root of ['', '../', '../../']) {
      globalThis.document = { body: { hasAttribute: name => name === 'data-site-root', dataset: { siteRoot: root } } };
      assert.equal(assetPrefix(), root);
    }
  } finally { globalThis.document = original; }
});
