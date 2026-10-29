import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cssForPage } from '../scripts/build/css-scope.mjs';
test('page CSS retains shared, interactive and negative selectors while pruning other routes', () => {
  const source = `@layer components { .button {color:green} .button.is-open{display:block} .sf-page[data-page="home"] h1, .sf-page[data-page="about"] h1{color:red} .sf-page:not([data-page="home"]) a{color:blue} .sja-prose{width:60ch} } @keyframes open{from{opacity:0}to{opacity:1}}`;
  const home = cssForPage(source, 'home');
  assert.match(home, /\.button\.is-open/);
  assert.match(home, /data-page="home"\] h1/);
  assert.doesNotMatch(home, /data-page="about"/);
  assert.match(home, /:not\(/);
  assert.doesNotMatch(home, /\.sja-prose/);
  assert.match(home, /@keyframes open/);
  assert.match(cssForPage(source, 'journal'), /\.sja-prose/);
});
