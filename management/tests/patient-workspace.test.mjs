import test from 'node:test';
import assert from 'node:assert/strict';
import { readPatientRows, clinicalTimeline } from '../src/patientWorkspace.js';
test('clinical sources read beyond the first server page without skipping older records', async () => {
  const source = Array.from({ length: 205 }, (_, id) => ({ id }));
  const ranges = [];
  const rows = await readPatientRows(async (from, to) => { ranges.push([from, to]); return source.slice(from, to + 1); });
  assert.deepEqual(rows, source);
  assert.deepEqual(ranges, [[0, 99], [100, 199], [200, 299]]);
});
test('timeline merges dates across sources before filtering and pagination, tolerating unknown dates', () => {
  const events = [{ id: '1', type: 'entries', at: '2026-01-01' }, { id: '1', type: 'procedures', at: '2026-03-01' }, { id: '2', type: 'entries', at: null }, { id: '3', type: 'consents', at: '2026-02-01' }];
  assert.deepEqual(clinicalTimeline(events).map(e => e.type), ['procedures', 'consents', 'entries', 'entries']);
  assert.deepEqual(clinicalTimeline(events, 'entries').map(e => e.id), ['1', '2']);
  assert.deepEqual(events.map(e => e.type), ['entries', 'procedures', 'entries', 'consents']);
});
test('failed source pages fail visibly instead of returning an incomplete clinical history', async () => {
  await assert.rejects(readPatientRows(async () => { throw new Error('permission denied'); }), /permission denied/);
});
