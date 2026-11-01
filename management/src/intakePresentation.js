import {procedureNames, procedureSummary} from "./procedureLabels.js";
const categories = { identity_upload: 'Documento de identidade', booking_payment_receipt: 'Comprovante de pagamento', marketing_authorization_files: 'Autorização de uso de imagem', supporting_attachments: 'Anexo do formulário' };
export function intakeDocumentName(file, patient, submittedAt) {
  const category = categories[file.field_name] || ({ identity: categories.identity_upload, payment: categories.booking_payment_receipt, marketing_authorization: categories.marketing_authorization_files })[file.kind];
  if (!category) return file.original_name || 'Anexo';
  const stamp = submittedAt || file.created_at;
  const date = stamp && !Number.isNaN(Date.parse(stamp)) ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(stamp)).replaceAll('/', '-') : '';
  const extension = file.original_name?.match(/\.[a-z0-9]{1,12}$/i)?.[0] || '';
  return [category, patient?.preferred_name || patient?.full_name, date].filter(Boolean).join(' - ') + extension;
}
export function intakeAnswer(value) {
  if (Array.isArray(value)) return value.map(intakeAnswer).join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'string' && value.split(',').every(item=>procedureNames[item.trim()])) return procedureSummary(value);
  return ({ yes: 'Sim', no: 'Não', non_identifiable: 'Autorização para imagens sem identificação', partial_approval: 'Autorização parcial de imagens', full_approval: 'Autorização integral de imagens' })[String(value)] ?? String(value ?? '');
}
