import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const luminance = colour => {
  const channels = colour.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels.reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
};
const sheet = await readFile(new URL('../css/site.css', import.meta.url), 'utf8');
const token = name => sheet.match(new RegExp(`${name}:\\s*(#[a-fA-F0-9]{6})`))[1];
for (const [foreground, background] of [
  ['--forest-900', '--ivory-50'], ['--rose-gold-700', '--ivory-50'],
  ['--gold-600', '--ivory-50'], ['--ivory-50', '--menu-green'],
  ['--olive-600', '--ivory-50'], ['--champagne-100', '--menu-green'],
]) {
  const values = [luminance(token(foreground)), luminance(token(background))].sort((a, b) => a - b);
  const contrast = (values[1] + .05) / (values[0] + .05);
  assert.ok(contrast >= 4.5, `${foreground} on ${background}: ${contrast.toFixed(2)}`);
  console.log(`PASS ${foreground} on ${background}: ${contrast.toFixed(2)}:1`);
}
