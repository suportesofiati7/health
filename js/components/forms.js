import { qs, qsa } from '../core/dom.js';
import { currentPage } from '../core/page.js';

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/suportesofiati@gmail.com';
const FORMSUBMIT_AJAX_ENDPOINT = 'https://formsubmit.co/ajax/suportesofiati@gmail.com';

const FORM_ENDPOINTS = Object.freeze({
  consultation: FORMSUBMIT_AJAX_ENDPOINT,
  contact: FORMSUBMIT_AJAX_ENDPOINT,
  quick_contact: FORMSUBMIT_AJAX_ENDPOINT,
  quick_question: FORMSUBMIT_AJAX_ENDPOINT,
  newsletter: FORMSUBMIT_AJAX_ENDPOINT,
  newsletter_signup: FORMSUBMIT_AJAX_ENDPOINT,
  consent_authorisation: FORMSUBMIT_AJAX_ENDPOINT,
  consent_authorization: FORMSUBMIT_AJAX_ENDPOINT,
  accessibility: FORMSUBMIT_AJAX_ENDPOINT,
  accessibility_feedback: FORMSUBMIT_AJAX_ENDPOINT
});

const CAMPAIGN_KEYS = Object.freeze([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_id',
  'utm_content',
  'utm_term',
  'gclid',
  'dclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
  'ttclid',
  'twclid',
  'li_fat_id'
]);

const SESSION_STARTED_AT = Date.now();
let interactionCount = 0;
let lastCtaClicked = '';

document.addEventListener('click', (event) => {
  interactionCount += 1;
  const cta = event.target.closest?.('[data-track="cta"], [data-cta-purpose], a.sf-button, button.sf-button');
  if (!cta) return;
  lastCtaClicked = [
    cta.dataset.ctaPurpose,
    cta.dataset.ctaLocation || cta.dataset.linkLocation,
    cta.textContent?.trim()
  ].filter(Boolean).join(' | ').slice(0, 160);
}, { capture: true, passive: true });

document.addEventListener('input', () => {
  interactionCount += 1;
}, { capture: true, passive: true });

function isPortuguese() {
  const language = (document.documentElement.lang || '').toLowerCase();
  return language === 'pt' || language === 'pt-br' || language.startsWith('pt-');
}

function thankYouPath() {
  return isPortuguese() ? 'obrigada.html' : 'en/thank-you.html';
}

function canonicalUrl() {
  return document.querySelector('link[rel~="canonical"]')?.href || window.location.href;
}

function stableStorageValue(storage, key, factory) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const next = factory();
    storage.setItem(key, next);
    return next;
  } catch {
    return factory();
  }
}

function randomId(prefix) {
  const values = new Uint32Array(3);
  window.crypto?.getRandomValues?.(values);
  const source = values.some(Boolean) ? Array.from(values).join('-') : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${source.replace(/[^a-z0-9-]+/gi, '').toLowerCase()}`;
}

function initialLandingPage() {
  return stableStorageValue(window.sessionStorage, 'sofiati_landing_page', () => window.location.href);
}

function sessionIdentifier() {
  return stableStorageValue(window.sessionStorage, 'sofiati_session_id', () => randomId('session'));
}

function returningVisitor() {
  try {
    const key = 'sofiati_returning_visitor';
    const returning = window.localStorage.getItem(key) === 'true';
    window.localStorage.setItem(key, 'true');
    return returning ? 'yes' : 'no';
  } catch {
    return 'unknown';
  }
}

function firstVisitDate() {
  try {
    return stableStorageValue(window.localStorage, 'sofiati_first_visit', () => new Date().toISOString());
  } catch {
    return '';
  }
}

function anonymousVisitorId() {
  try {
    return stableStorageValue(window.localStorage, 'sofiati_visitor_id', () => randomId('visitor'));
  } catch {
    return randomId('visitor');
  }
}

function pageHistory() {
  try {
    const key = 'sofiati_session_pages';
    const current = `${window.location.pathname}${window.location.search}`;
    const existing = JSON.parse(window.sessionStorage.getItem(key) || '[]').filter(Boolean);
    if (existing[existing.length - 1] !== current) existing.push(current);
    const capped = existing.slice(-12);
    window.sessionStorage.setItem(key, JSON.stringify(capped));
    return capped;
  } catch {
    return [`${window.location.pathname}${window.location.search}`];
  }
}

function fieldValue(form, names) {
  const candidates = Array.isArray(names) ? names : [names];
  for (const name of candidates) {
    const field = form.elements?.[name] || qs(`[name="${CSS.escape(name)}"]`, form);
    if (!field) continue;
    if (field instanceof RadioNodeList) {
      const checked = Array.from(field).find((item) => item.checked);
      if (checked?.value) return checked.value;
      continue;
    }
    if (field.type === 'checkbox') return field.checked ? field.value || 'yes' : '';
    if (field.value) return field.value;
  }
  return '';
}

function selectedText(form, names) {
  const candidates = Array.isArray(names) ? names : [names];
  for (const name of candidates) {
    const field = form.elements?.[name] || qs(`[name="${CSS.escape(name)}"]`, form);
    if (field?.tagName === 'SELECT') return field.selectedOptions?.[0]?.textContent?.trim() || field.value || '';
  }
  return '';
}

function pageCategory() {
  return document.body?.dataset.page || document.body?.className?.match(/sf-family-([a-z-]+)/)?.[1] || currentPage();
}

function consentPreference(name) {
  try {
    const consent = window.SofiatiConsentMode?.get?.();
    if (consent && Object.prototype.hasOwnProperty.call(consent, name)) return consent[name] ? 'granted' : 'denied';
  } catch {
    return 'unknown';
  }
  return 'unknown';
}

function referrerDomain() {
  try {
    return document.referrer ? new URL(document.referrer).hostname : '';
  } catch {
    return '';
  }
}

function searchEngineSource(domain) {
  if (!domain) return '';
  if (/google\./i.test(domain)) return 'Google Search';
  if (/bing\./i.test(domain)) return 'Bing';
  if (/yahoo\./i.test(domain)) return 'Yahoo';
  if (/duckduckgo\./i.test(domain)) return 'DuckDuckGo';
  return '';
}

function socialSource(params, domain) {
  const source = params.get('utm_source') || domain || '';
  if (/instagram/i.test(source)) return 'Instagram';
  if (/facebook|fbclid/i.test(source) || params.get('fbclid')) return 'Facebook';
  if (/linkedin/i.test(source)) return 'LinkedIn';
  if (/tiktok|ttclid/i.test(source) || params.get('ttclid')) return 'TikTok';
  return '';
}

function originalSource(params, domain) {
  if (params.get('utm_source')) return params.get('utm_source');
  const search = searchEngineSource(domain);
  if (search) return search;
  const social = socialSource(params, domain);
  if (social) return social;
  return domain ? 'Referral' : 'Direct visit';
}

function viewedItems(selector, fallbackPageNames = []) {
  const values = qsa(selector)
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .slice(0, 12);
  return values.length ? values.join(' | ') : fallbackPageNames.join(' | ');
}

function scrollDepthPercentage() {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  return String(Math.min(100, Math.round((window.scrollY / maxScroll) * 100)));
}

function leadTemperature(form, serviceInterest, message) {
  const text = `${serviceInterest} ${message}`.toLowerCase();
  if (/agendar|consulta|consultation|appointment|whatsapp|telefone|phone|laser|acne|melasma|co2|ultraformer/.test(text)) return 'Warm';
  if (formType(form).includes('consultation') || formName(form).includes('contact')) return 'Warm';
  return 'Cold';
}

function parseBrowser(userAgent) {
  const rules = [
    ['Edge', /Edg\/([\d.]+)/],
    ['Chrome', /Chrome\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/],
    ['Firefox', /Firefox\/([\d.]+)/]
  ];
  const found = rules.find(([, pattern]) => pattern.test(userAgent));
  return found ? { name: found[0], version: userAgent.match(found[1])?.[1] || '' } : { name: 'Unknown', version: '' };
}

function parseOperatingSystem(userAgent) {
  const rules = [
    ['Windows', /Windows NT ([\d.]+)/],
    ['iOS', /(?:iPhone|iPad).*OS ([\d_]+)/],
    ['Android', /Android ([\d.]+)/],
    ['macOS', /Mac OS X ([\d_]+)/],
    ['Linux', /Linux/]
  ];
  const found = rules.find(([, pattern]) => pattern.test(userAgent));
  return found ? { name: found[0], version: (userAgent.match(found[1])?.[1] || '').replaceAll('_', '.') } : { name: 'Unknown', version: '' };
}

function deviceType() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const touch = navigator.maxTouchPoints > 0;
  if (touch && width < 768) return 'mobile';
  if (touch && width < 1180) return 'tablet';
  return 'desktop';
}

function setupConsentSpecificTerms(form) {
  if (!form.matches('[data-form-type="consent_authorisation"], [data-form-type="consent_authorization"]')) {
    return;
  }

  const procedureInputs = qsa('input[name="selected_procedures"]', form);
  if (!procedureInputs.length) return;

  const copy = isPortuguese()
    ? {
      selectProcedure: 'Selecione pelo menos um procedimento.',
      acceptTerm: 'Abra e aceite o termo específico do procedimento selecionado antes de enviar.'
    }
    : {
      selectProcedure: 'Select at least one procedure.',
      acceptTerm: 'Open and accept the specific term for the selected procedure before submitting.'
    };

  const matchingTermInput = (procedureInput) => {
    const raw = String(procedureInput.value || '');
    return qs(`input[name="accepted_term_${CSS.escape(raw)}"]`, form);
  };

  const procedureCard = (input) => input.closest('.sf-consent-procedure');

  const syncProcedureGroupValidity = () => {
    const selected = procedureInputs.filter((input) => input.checked);
    procedureInputs.forEach((input) => {
      input.required = false;
      input.setCustomValidity('');
    });
    if (!selected.length) {
      procedureInputs[0].required = true;
      procedureInputs[0].setCustomValidity(copy.selectProcedure);
    }
    return selected;
  };

  const syncTermRequirements = () => {
    const selected = syncProcedureGroupValidity();
    procedureInputs.forEach((procedureInput) => {
      const termInput = matchingTermInput(procedureInput);
      if (!termInput) return;
      termInput.required = procedureInput.checked;
      if (!procedureInput.checked || termInput.checked) {
        termInput.setCustomValidity('');
        return;
      }
      termInput.setCustomValidity(copy.acceptTerm);
    });
    return selected;
  };

  const openAndFocusTerm = (procedureInput, focusAcceptance = false) => {
    const card = procedureCard(procedureInput);
    const details = qs('details', card);
    const termInput = matchingTermInput(procedureInput);
    if (details) details.open = true;
    const target = focusAcceptance && termInput ? termInput : details || card || procedureInput;
    window.requestAnimationFrame(() => {
      target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      if (focusAcceptance && termInput) termInput.focus({ preventScroll: true });
    });
  };

  procedureInputs.forEach((procedureInput) => {
    procedureInput.addEventListener('change', () => {
      syncTermRequirements();
      if (procedureInput.checked) openAndFocusTerm(procedureInput);
    });
  });

  qsa('input[name^="accepted_term_"]', form).forEach((termInput) => {
    termInput.addEventListener('change', syncTermRequirements);
  });

  qsa('input[type="file"].sf-consent-file-input', form).forEach((fileInput) => {
    const status = fileInput.nextElementSibling?.querySelector?.('.sf-file-status');
    const emptyText = status?.textContent || '';
    fileInput.addEventListener('change', () => {
      if (!status) return;
      const files = Array.from(fileInput.files || []);
      status.textContent = files.length ? files.map((file) => file.name).join(', ') : emptyText;
    });
  });

  form.addEventListener('submit', () => {
    const selected = syncTermRequirements();
    const missingTerm = selected.find((procedureInput) => {
      const termInput = matchingTermInput(procedureInput);
      return termInput && !termInput.checked;
    });
    if (missingTerm) openAndFocusTerm(missingTerm, true);
  }, { capture: true });

  syncTermRequirements();
}

function upsertHidden(form, name, value) {
  let input = form.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`);
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.dataset.analyticsIgnore = '';
    input.dataset.analyticsSensitive = '';
    form.prepend(input);
  }
  input.value = value == null ? '' : String(value);
  return input;
}

function upsertDeliveryMetadata(form, name, value) {
  let input = form.querySelector(`input[name="${CSS.escape(name)}"]`);
  if (!input) {
    input = document.createElement('input');
    input.name = name;
    form.prepend(input);
  }
  input.type = 'text';
  input.readOnly = true;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.classList.add('sf-visually-hidden', 'sf-form-delivery-metadata');
  input.dataset.analyticsIgnore = '';
  input.dataset.analyticsSensitive = '';
  input.value = value == null ? '' : String(value);
  return input;
}

function formName(form) {
  return form.dataset.formName || form.dataset.analyticsForm || form.id || 'website_form';
}

function formType(form) {
  return form.dataset.formType || form.dataset.leadType || formName(form);
}

function endpointFor(form) {
  const key = formType(form);
  const name = formName(form);
  const endpoint = FORM_ENDPOINTS[key] || FORM_ENDPOINTS[name] || form.getAttribute('action') || '';
  return endpoint === FORMSUBMIT_AJAX_ENDPOINT ? endpoint : '';
}

function privacyConsentGiven(form) {
  return ['privacy_acknowledgement', 'lgpd_personal_data_consent', 'final_acceptance']
    .some((name) => Boolean(fieldValue(form, name)));
}

function populateMetadata(form) {
  const now = new Date();
  const params = new URLSearchParams(window.location.search);
  const analyticsAllowed = consentPreference('analytics') === 'granted';
  const browser = parseBrowser(navigator.userAgent || '');
  const os = parseOperatingSystem(navigator.userAgent || '');
  const privacyNoticeVersion = fieldValue(form, ['versao_aviso_privacidade', 'privacy_notice_version']) || form.dataset.privacyNoticeVersion || '2026-08-24';
  const consentGiven = privacyConsentGiven(form);
  const metadata = {
    nome_formulario: formName(form),
    tipo_formulario: formType(form),
    id_formulario: form.id || '',
    _url: window.location.href,
    pagina_envio: window.location.pathname,
    url_pagina_atual: window.location.href,
    data_hora_envio: now.toISOString(),
    data_hora_local_envio: now.toLocaleString('pt-BR'),
    dominio_referencia: referrerDomain(),
    idioma_navegador: navigator.language || '',
    fuso_horario_visitante: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    categoria_dispositivo: deviceType(),
    nome_navegador: browser.name,
    sistema_operacional: os.name,
    idioma_site: document.documentElement.lang || '',
    versao_aviso_privacidade: privacyNoticeVersion,
    data_hora_consentimento: consentGiven ? now.toISOString() : ''
  };

  if (analyticsAllowed) {
    Object.assign(metadata, {
      primeira_pagina_de_entrada: initialLandingPage(),
      cta_que_abriu_o_formulario: lastCtaClicked,
      origem_utm: params.get('utm_source') || '',
      meio_utm: params.get('utm_medium') || '',
      campanha_utm: params.get('utm_campaign') || '',
      conteudo_utm: params.get('utm_content') || '',
      termo_utm: params.get('utm_term') || '',
      identificador_google_ads: params.get('gclid') || '',
      identificador_facebook_instagram: params.get('fbclid') || ''
    });
  }

  Object.entries(metadata).forEach(([key, value]) => {
    if (key.startsWith('_')) upsertHidden(form, key, value);
    else upsertDeliveryMetadata(form, key, value);
  });
  upsertHidden(form, '_template', 'table');
  const redirect = new URL(thankYouPath(), window.location.origin);
  upsertHidden(form, '_next', redirect.href);
  return redirect.href;
}

export function initForms() {
  qsa('form.sf-form, form[data-enhanced-form], form[data-consultation-form]').forEach((form, formIndex) => {
    if (form.dataset.sfFormReady === 'true') return;
    form.dataset.sfFormReady = 'true';
    form.setAttribute('data-enhanced-form', '');
    form.noValidate = true;
    form.method = 'post';

    const page = currentPage();
    const isConsultation = page === 'consultation' || /consultation|consulta/i.test(qs('button[type="submit"]', form)?.textContent || '');

    const formId = form.id || `sf-form-${formIndex + 1}`;
    if (!form.id) form.id = formId;
    setupConsentSpecificTerms(form);
    const stateNodes = qsa('[data-form-state]', form);
    const renderedStateCopy = Object.fromEntries(
      stateNodes.map((node) => [node.dataset.formState, node.textContent.trim()])
    );
    const copy = {
      required: form.dataset.messageRequired || '',
      email: form.dataset.messageEmail || '',
      review: form.dataset.messageReview || '',
      loading: renderedStateCopy.loading || '',
      success: renderedStateCopy.success || '',
      error: renderedStateCopy.error || ''
    };
    let status = qs('[data-form-status]', form);
    if (!status && !stateNodes.length) {
      status = document.createElement('p');
      status.dataset.formStatus = '';
      status.className = 'sf-form-status';
      status.id = `${formId}-status`;
      status.hidden = true;
      status.tabIndex = -1;
      form.append(status);
    }
    if (status?.id) {
      form.setAttribute('aria-describedby', [form.getAttribute('aria-describedby'), status.id].filter(Boolean).join(' '));
    }

    const clearFieldError = (field) => {
      const errorId = field.dataset.sfErrorId;
      const error = errorId ? document.getElementById(errorId) : null;
      if (error?.dataset.errorFor) {
        error.textContent = '';
        error.hidden = true;
      } else {
        error?.remove();
        const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId);
        if (describedBy.length) field.setAttribute('aria-describedby', describedBy.join(' '));
        else field.removeAttribute('aria-describedby');
      }
      delete field.dataset.sfErrorId;
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
    };

    const showFieldError = (field, message) => {
      clearFieldError(field);
      const safeName = String(field.name || field.id || 'field').replace(/[^a-z0-9_-]+/gi, '-');
      let error = qsa('[data-error-for]', form).find((node) => node.dataset.errorFor === field.id);
      if (!error) {
        error = document.createElement('p');
        error.id = `${formId}-${safeName}-runtime-error`;
        error.className = 'form-error';
        field.insertAdjacentElement('afterend', error);
      }
      error.textContent = message;
      error.hidden = false;
      field.dataset.sfErrorId = error.id;
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      describedBy.add(error.id);
      field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
    };

    const fields = qsa('input, select, textarea', form).filter((field) => !field.classList.contains('sf-honeypot') && field.type !== 'hidden');
    fields.forEach((field) => {
      const clear = () => clearFieldError(field);
      field.addEventListener('input', clear);
      field.addEventListener('change', clear);
    });

    const validate = () => {
      let firstInvalid = null;
      let errorCount = 0;
      fields.forEach(clearFieldError);
      fields.forEach((field) => {
        if (field.disabled || field.checkValidity()) return;
        errorCount += 1;
        const message = field.validity.typeMismatch ? copy.email : copy.required;
        showFieldError(field, message);
        if (!firstInvalid) firstInvalid = field;
      });
      return { firstInvalid, errorCount };
    };

    // Analytics receives lifecycle states, never FormData or field values.
    // A successful event is emitted only after FormSubmit confirms the request.
    const emitLifecycle = (name, detail = {}) => {
      document.dispatchEvent(new CustomEvent(`sofiati:form-${name}`, {
        detail: { form, ...detail }
      }));
    };

    const setState = (nextState, message, role = 'status') => {
      form.dataset.formState = nextState;
      form.toggleAttribute('aria-busy', nextState === 'loading');
      if (stateNodes.length) {
        let active = null;
        stateNodes.forEach((node) => {
          const selected = node.dataset.formState === nextState;
          node.hidden = !selected;
          if (selected) active = node;
        });
        if (active) {
          active.setAttribute('role', role);
          active.setAttribute('aria-live', role === 'alert' ? 'assertive' : 'polite');
          active.tabIndex = -1;
          if (!active.textContent.trim() && message) active.textContent = message;
        }
        return active;
      }
      if (status) {
        status.hidden = !message;
        status.setAttribute('role', role);
        status.setAttribute('aria-live', role === 'alert' ? 'assertive' : 'polite');
        status.textContent = message || '';
      }
      return status;
    };

    const setSubmitting = (submitting) => {
      qsa('button[type="submit"], input[type="submit"]', form).forEach((button) => {
        if (!button.dataset.sfOriginalLabel) button.dataset.sfOriginalLabel = button.value || button.textContent || '';
        button.disabled = submitting;
        if (button.tagName === 'INPUT') button.value = submitting ? copy.loading : button.dataset.sfOriginalLabel;
        else button.textContent = submitting ? copy.loading : button.dataset.sfOriginalLabel;
      });
    };

    const configureEndpoint = () => {
      const endpoint = endpointFor(form);
      return endpoint === FORMSUBMIT_AJAX_ENDPOINT ? endpoint : '';
    };
    configureEndpoint();

    form.addEventListener('submit', async (event) => {
      if (form.dataset.formState === 'loading') return;
      const { firstInvalid, errorCount } = validate();
      if (firstInvalid) {
        event.preventDefault();
        setState('error', copy.review, 'alert');
        emitLifecycle('error', {
          errorType: 'client_validation',
          errorCount
        });
        firstInvalid.focus();
        return;
      }

      const honeypot = qs('input.sf-honeypot, input[name="website"]', form);
      if (honeypot && String(honeypot.value || '').trim()) {
        event.preventDefault();
        form.reset();
        setState('success', copy.success)?.focus({ preventScroll: true });
        return;
      }

      const endpoint = configureEndpoint();
      if (!endpoint) {
        event.preventDefault();
        setState('error', copy.error, 'alert')?.focus({ preventScroll: true });
        emitLifecycle('error', {
          errorType: 'endpoint_unavailable',
          errorCount: 1
        });
        return;
      }

      const redirectUrl = populateMetadata(form, {
        submissionStatus: 'attempted',
        validationStatus: 'passed',
        errorCount: 0
      });
      if (qs('input[type="file"]', form)) {
        form.action = FORMSUBMIT_ENDPOINT;
        emitLifecycle('submit');
        return;
      }
      event.preventDefault();
      emitLifecycle('submit');
      setSubmitting(true);
      setState('loading', copy.loading);
      const payload = Object.fromEntries(new FormData(form).entries());
      if (!payload._subject) {
        payload._subject = isConsultation ? 'Nova solicitação de consulta — Franciele Sofiati' : 'Novo contato pelo site — Franciele Sofiati';
      }
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success === false) throw new Error(`Form submission failed (${response.status})`);
        form.reset();
        fields.forEach(clearFieldError);
        setState('success', copy.success)?.focus({ preventScroll: true });
        emitLifecycle('success');
        window.location.assign(redirectUrl);
      } catch (error) {
        setState('error', copy.error, 'alert')?.focus({ preventScroll: true });
        emitLifecycle('error', {
          errorType: 'server_submission',
          errorCount: 1
        });
      } finally {
        setSubmitting(false);
      }
    });
  });
}
