export function brazilDay(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}
export function shiftDay(day, offset) {
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}
export function summarizeClicks(report, now = new Date()) {
  const today = brazilDay(now);
  const start = report?.started_at ? brazilDay(report.started_at) : null;
  const days = (report?.days || []).filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.day) && row.day <= today)
    .map(row => ({ ...row, clicks: Number(row.clicks), available: Boolean(start && row.day >= start) }));
  const sum = from => days.filter(row => row.day >= from && row.available).reduce((total, row) => total + row.clicks, 0);
  return { today, start, days, todayClicks: sum(today), weekClicks: sum(shiftDay(today, -6)), monthClicks: sum(today.slice(0, 7) + '-01') };
}
