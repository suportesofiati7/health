export const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/suportesofiati@gmail.com';

export function emailAccepted(result) {
  return result?.success === true || result?.success === 'true';
}

export async function sendEmail(payload) {
  const response = await fetch(EMAIL_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000)
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
