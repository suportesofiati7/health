// Every view subscribes to committed mutations, including changes in another
// browser tab. Reads and access-log RPCs never trigger a reload loop.
export const DATA_CHANGED = 'sofiati:data-changed';
const mutationRPCs = new Set(['record_clinical_procedure', 'save_treatment_plan', 'set_treatment_plan_item_archived', 'schedule_treatment_plan', 'set_follow_up_status', 'save_appointment_series', 'convert_public_intake', 'save_master_intake', 'delete_patient', 'delete_public_intake', 'delete_clinical_photo']);
export function isDataMutation(query) {
  if (!query?.method || ['GET', 'HEAD'].includes(query.method)) return false;
  const path = query.url?.pathname || '';
  return !path.includes('/rpc/') || mutationRPCs.has(path.split('/').at(-1));
}
export function publishDataChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(DATA_CHANGED));
  // BroadcastChannel conveys no patient details or credentials.
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(DATA_CHANGED);
    channel.postMessage('committed'); channel.close();
  }
}
