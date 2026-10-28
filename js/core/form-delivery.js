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
  if (code === 'cpf') return english ? 'Enter a complete CPF with 11 digits.' : 'Informe o CPF completo com 11 dígitos.';
  if (code === 'consent_required') return english ? 'Review and explicitly accept the required terms for each selected procedure.' : 'Revise e aceite explicitamente os termos obrigatórios de cada procedimento selecionado.';
  if (code === 'required') return english ? 'Complete the required fields before sending.' : 'Preencha os campos obrigatórios antes de enviar.';
  if (code === 'rate_limit') return english ? 'Too many attempts. Wait before retrying.' : 'Muitas tentativas de envio. Aguarde antes de tentar novamente.';
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
