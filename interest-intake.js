import { deliveryTracker, formSignature, fetchWithTimeout } from './js/core/form-delivery.js';

(() => {
  const form = document.querySelector('#interest-form');
  if (!form) return;
  const result = document.querySelector('#interest-result');
  const submit = document.querySelector('#interest-submit');
  const english = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const trackDelivery = deliveryTracker();
  let token = '';
  let submitting = false;
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.onload = () => {
    window.turnstile.render('#challenge', {
      sitekey: '0x4AAAAAAE0b8mFSgQqazkH8', action: 'preregister', size: 'compact',
      callback: value => { token = value; },
      'expired-callback': () => { token = ''; },
      'error-callback': () => { token = ''; }
    });
  };
  document.head.append(script);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.website) return;
    values.privacy = values.privacy === 'on';
    values.language = english ? 'en' : 'pt-BR';
    submitting = true;
    submit.disabled = true;
    result.textContent = english ? 'Sending…' : 'Enviando…';
    const deliver = trackDelivery(formSignature(form));
    try {
      try {
        await deliver('app', async () => {
          if (!token) throw Error('challenge');
          const response = await fetchWithTimeout('https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_jH3gQ7-Tx8_-B191w3Gr1A_GkGHG9Hf' },
            body: JSON.stringify({ ...values, token })
          });
          const data = await response.json().catch(() => null);
          if (!response.ok || data?.received !== true) throw Error('app_delivery_failed');

        });
      } catch {
        result.textContent = english ? 'Could not save your enquiry. Please try again.' : 'Não foi possível salvar seu cadastro. Tente novamente.';
        token = ''; window.turnstile?.reset();
        return;
      }
      form.reset();
      result.textContent = english ? 'Your enquiry has been received.' : 'Recebemos seu interesse.';
      window.location.assign(new URL(english ? 'en/thank-you.html' : 'obrigada.html', window.location.origin).href);
    } finally {
      submitting = false;
      submit.disabled = false;
    }
  });
})();
