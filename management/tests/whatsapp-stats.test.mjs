import test from 'node:test';
import assert from 'node:assert/strict';
import { brazilDay, shiftDay, summarizeClicks } from '../src/whatsappStats.js';

test('Brazil midnight and month boundaries are used for the three counters', () => {
  const now = '2026-11-05T02:30:00Z';
  assert.equal(brazilDay(now), '2026-11-04');
  assert.equal(shiftDay('2026-11-01', -1), '2026-10-31');
  const report = { started_at: '2026-10-01T12:00:00Z', days: [
    { day: '2026-10-28', clicks: 100 }, { day: '2026-10-29', clicks: 3 },
    { day: '2026-10-31', clicks: 4 }, { day: '2026-11-01', clicks: 5 },
    { day: '2026-11-04', clicks: 6 }, { day: '2026-11-05', clicks: 200 },
  ] };
  const result = summarizeClicks(report, now);
  assert.equal(result.todayClicks, 6);
  assert.equal(result.weekClicks, 18);
  assert.equal(result.monthClicks, 11);
});
test('missing history stays unavailable, separate from a measured zero', () => {
  const result = summarizeClicks({ started_at: '2026-11-05T14:00:00Z', days: [
    { day: '2026-11-04', clicks: 0 }, { day: '2026-11-05', clicks: 0 },
  ] }, '2026-11-05T15:00:00Z');
  assert.equal(result.days[0].available, false);
  assert.equal(result.days[1].available, true);
  assert.equal(result.todayClicks, 0);
  assert.equal(summarizeClicks(null).start, null);
});
