(() => {
  const form = document.querySelector('#interest-form');
  if (!form) return;
  const result = document.querySelector('#interest-result');
  const submit = document.querySelector('#interest-submit');
  const english = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  let token = '';
  let widgetId = '';
  const key = '0x4AAAAAAE0b8mFSgQqazkH8';
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.onload = () => { widgetId = window.turnstile.render('#challenge', { sitekey: key, action: 'preregister', size: 'compact', callback: value => { token = value; submit.disabled = false; }, 'expired-callback': () => { token = ''; submit.disabled = true; } }); };
  document.head.append(script);
  form.addEventListener('submit', async event => {
    event.preventDefault(); submit.disabled = true; result.textContent = english ? 'Sending…' : 'Enviando…';
    if (!token && widgetId && window.turnstile?.execute) {
      await new Promise(resolve => { const check = () => token ? resolve() : window.setTimeout(check, 50); window.turnstile.execute(widgetId); window.setTimeout(resolve, 10000); });
    }
    const values = Object.fromEntries(new FormData(form)); values.privacy = values.privacy === 'on'; values.token = token; values.language = english ? 'en' : 'pt-BR';
    try {
      const response = await fetch('https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/intake', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_jH3gQ7-Tx8_-B191w3Gr1A_GkGHG9Hf' }, body: JSON.stringify(values) });
      if (response.status !== 202) throw Error('submission');
      const mail = new FormData(form);
      mail.set('_subject', english ? 'New website enquiry — Franciele Sofiati' : 'Novo interesse pelo site — Franciele Sofiati');
      const emailResponse = await fetch('https://formsubmit.co/ajax/suportesofiati@gmail.com', { method: 'POST', headers: { Accept: 'application/json' }, body: mail });
      const emailResult = await emailResponse.json().catch(() => null);
      if (!emailResponse.ok || emailResult?.success === false) throw Error('email_submission');
      form.replaceChildren(); result.textContent = english ? 'Your enquiry has been received. Our team will be in touch.' : 'Recebemos seu interesse. Nossa equipe entrará em contato.';
    } catch { result.textContent = english ? 'We could not send this yet. Please try again or contact us on WhatsApp.' : 'Não foi possível enviar. Tente novamente ou fale conosco pelo WhatsApp.'; token = ''; window.turnstile?.reset(); submit.disabled = false; }
  });
})();
