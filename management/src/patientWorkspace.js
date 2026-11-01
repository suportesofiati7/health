// Read each source completely before merging: independent source pages cannot
// produce a globally chronological timeline or a complete library search.
export async function readPatientRows(readPage, pageSize = 100) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const batch = await readPage(offset, offset + pageSize - 1);
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
}
export function clinicalTimeline(events, filter = 'all') {
  const timestamp = (value) => Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
  return events.filter((event) => filter === 'all' || event.type === filter)
    .sort((a, b) => timestamp(b.at) - timestamp(a.at) || `${a.type}-${a.id}`.localeCompare(`${b.type}-${b.id}`));
}
