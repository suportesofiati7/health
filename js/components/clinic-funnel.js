const TURNSTILE_SITE_KEY = '0x4AAAAAAE0b8mFSgQqazkH8';

function eligibleForms() {
  return [...document.querySelectorAll('form[data-analytics-form], form[action*="formsubmit.co/"]')].filter((form) => {
    const type = form.dataset.formType || '';
    const leadType = form.dataset.leadType || '';
    const articleContact = form.matches('form[action*="formsubmit.co/"]')
      && form.querySelector('input[name="email"]')
      && form.querySelector('input[name="name"], input[name="nome"]')
      && form.querySelector('textarea[name="message"], textarea[name="mensagem"]');
    return (
      ['contact', 'contact_form', 'consultation', 'consultation_request', 'quick_contact', 'quick_question'].includes(type)
      || ['contact_enquiry', 'consultation_request', 'quick_question'].includes(leadType)
      || articleContact
    ) && !form.querySelector('input[name="token"]');
  });
}

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (window.__sofiatiTurnstilePromise) return window.__sofiatiTurnstilePromise;
  window.__sofiatiTurnstilePromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-sofiati-turnstile]');
    const done = () => resolve(window.turnstile || null);
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.sofiatiTurnstile = 'true';
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', () => resolve(null), { once: true });
    window.setTimeout(() => resolve(null), 10000);
    document.head.append(script);
  });
  return window.__sofiatiTurnstilePromise;
}

export function initClinicFunnel() {
  const forms = eligibleForms();
  if (!forms.length) return;
  forms.forEach((form, index) => {
    const token = document.createElement('input');
    token.type = 'hidden';
    token.name = 'token';
    token.dataset.funnelToken = 'true';
    form.append(token);
    const challenge = document.createElement('div');
    challenge.className = 'sf-funnel-challenge';
    challenge.dataset.funnelChallenge = 'true';
    form.querySelector('.sf-form-submit')?.before(challenge);
    let widgetPromise;
    const ensureWidget = () => {
      if (form.dataset.funnelWidget) return Promise.resolve(window.turnstile || null);
      if (widgetPromise) return widgetPromise;
      widgetPromise = loadTurnstile().then((turnstile) => {
        if (!turnstile?.render) return null;
        const widgetId = turnstile.render(challenge, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'preregister',
          size: 'compact',
          callback: (value) => { token.value = value; },
          'expired-callback': () => { token.value = ''; },
          'error-callback': () => { token.value = ''; }
        });
        form.dataset.funnelWidget = String(widgetId ?? '');
        return turnstile;
      }).catch(() => null);
      return widgetPromise;
    };
    form.__sofiatiEnsureTurnstile = ensureWidget;
    form.addEventListener('focusin', ensureWidget, { once: true });
    form.addEventListener('pointerdown', ensureWidget, { once: true });
    form.dataset.funnelReady = String(index);
  });
}

window.SofiatiFunnelToken = async (form) => {
  const input = form?.querySelector('input[name="token"]');
  if (input?.value) return input.value;
  const turnstile = await form?.__sofiatiEnsureTurnstile?.();
  const widgetId = form?.dataset.funnelWidget;
  if (!widgetId || !turnstile?.execute) return '';
  await new Promise((resolve) => {
    let timer;
    const finish = () => { window.clearTimeout(timer); window.clearTimeout(deadline); resolve(); };
    const check = () => input?.value ? finish() : (timer = window.setTimeout(check, 50));
    const deadline = window.setTimeout(finish, 10000);
    try { turnstile.execute(widgetId); check(); } catch { finish(); }
  });
  return input?.value || '';
};
