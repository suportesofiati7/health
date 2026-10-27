import { deliveryTracker, formSignature, sendEmail } from './js/core/form-delivery.js';

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
      const [app, email] = await Promise.allSettled([
        deliver('app', async () => {
          if (!token) throw Error('challenge');
          const response = await fetch('https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_jH3gQ7-Tx8_-B191w3Gr1A_GkGHG9Hf' },
            body: JSON.stringify({ ...values, token }),
            signal: AbortSignal.timeout(20000)
          });
          const data = await response.json().catch(() => null);
          if (!response.ok || data?.received !== true) throw Error('app_delivery_failed');
        }),
        deliver('email', () => sendEmail({ ...values,
          _subject: english ? 'New website enquiry — Franciele Sofiati' : 'Novo interesse pelo site — Franciele Sofiati',
          _template: 'table', pagina: window.location.href
        }))
      ]);
      if (app.status === 'rejected' || email.status === 'rejected') {
        result.textContent = app.status === 'rejected' && email.status === 'rejected'
          ? (english ? 'Delivery failed. Please try again.' : 'O envio falhou. Tente novamente.')
          : app.status === 'rejected'
            ? (english ? 'Sent by email. The app could not save it. Please retry to also save in the app.' : 'Enviado por e-mail. Não foi possível salvar no aplicativo. Tente novamente para salvar também no aplicativo.')
            : (english ? 'Saved in the app. Email is pending. Please retry; the saved enquiry will not be duplicated.' : 'Salvo no aplicativo. O e-mail está pendente. Tente novamente; o cadastro salvo não será duplicado.');
        if (app.status === 'rejected') { token = ''; window.turnstile?.reset(); }
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
