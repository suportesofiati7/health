export const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/suportesofiati@gmail.com';

export function emailAccepted(result) {
  return result?.success === true || result?.success === 'true';
}

// AbortSignal.timeout is absent in older Safari and embedded browsers.
// Use the older AbortController API and release timers after every request.
export async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function intakeErrorMessage(error, english = false) {
  const code = error?.code || error?.name || '';
  if (code === 'signature_required') return 'Informe o nome completo de quem assina o formulário.';
  if (code === 'guardian_required') return 'Informe se é maior de idade e preencha os dados do responsável quando necessário.';
  if (code === 'field_size') return 'Um campo excede o tamanho permitido. Revise os dados antes de enviar.';
  if (code === 'file_type') return 'Use um PDF ou fotografia válida (JPEG, PNG, WebP ou HEIC).';
  if (code === 'file_checksum') return 'Um arquivo não foi recebido integralmente. Selecione-o novamente e tente enviar.';
  if (code === 'phone') return 'Informe um telefone com DDD e, quando necessário, código do país.';
  if (code === 'email') return 'Informe um endereço de email válido.';
  if (code === 'date') return 'Revise as datas e o horário informados.';
  if (code === 'cpf') return english ? 'Enter a complete CPF with 11 digits.' : 'Informe o CPF completo com 11 dígitos.';
  if (code === 'consent_required') return english ? 'Review and explicitly accept the required terms for each selected procedure.' : 'Revise e aceite explicitamente os termos obrigatórios de cada procedimento selecionado.';
  if (code === 'required') return english ? 'Complete the required fields before sending.' : 'Preencha os campos obrigatórios antes de enviar.';
  if (code === 'rate_limit') return english ? 'Too many attempts. Wait before retrying.' : 'Muitas tentativas de envio. Aguarde antes de tentar novamente.';
  if (code === 'request_too_large') return english ? 'The attachments are too large to send together. Reduce their size and retry; your answers are still here.' : 'Os anexos ficaram grandes demais para enviar juntos. Reduza o tamanho e tente novamente; suas respostas continuam aqui.';
  if (code === 'upload_session') return english ? 'The secure upload session expired. Retry to create a fresh session; your answers are still here.' : 'A sessão segura de envio expirou. Tente novamente para iniciar outra sessão; suas respostas continuam aqui.';
  if (['file', 'upload', 'file_record'].includes(code)) return english ? 'The app could not save the attachments. Check the files and retry; keep this page open.' : 'O aplicativo não conseguiu salvar os anexos. Confira os arquivos e tente novamente; mantenha esta página aberta.';
  if (['AbortError', 'TimeoutError'].includes(code)) return english ? 'The app has not confirmed receipt yet. Keep your answers here and retry when the connection is stable.' : 'O aplicativo ainda não confirmou o recebimento. Mantenha suas respostas aqui e tente novamente com uma conexão estável.';
  return english ? 'The app could not confirm receipt. Your answers are still here. Please retry or contact the clinic.' : 'O aplicativo não confirmou o recebimento. Suas respostas continuam aqui. Tente novamente ou entre em contato com a clínica.';
}

export async function sendEmail(payload) {
  const response = await fetchWithTimeout(EMAIL_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, _cc: "sofiatimendonca@gmail.com" })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !emailAccepted(result)) throw new Error('email_delivery_failed');
  return result;
}

// Keep confirmed channels when retrying an unchanged form. A partial failure
// must not resend an email or create a second intake on the next click.
export function deliveryTracker() {
  let signature = '';
  const completed = new Map();
  return (nextSignature) => {
    if (signature !== nextSignature) {
      signature = nextSignature;
      completed.clear();
    }
    const deliver = async (channel, send) => {
      if (completed.has(channel)) return completed.get(channel);
      const result = await send();
      completed.set(channel, result);
      return result;
    };
    deliver.has = (channel) => completed.has(channel);
    return deliver;
  };
}

export function formSignature(form) {
  return JSON.stringify([...form.elements].filter((field) =>
    field.name && field.type !== 'hidden' && !field.disabled &&
    !field.classList.contains('sf-form-delivery-metadata') &&
    (!['checkbox', 'radio'].includes(field.type) || field.checked)
  ).map((field) => [field.name, field.type === 'file'
    ? [...field.files].map((file) => [file.name, file.size, file.lastModified])
    : field.value]));
}


export function newSubmissionId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
