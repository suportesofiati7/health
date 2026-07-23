import { assetPrefix } from '../core/page.js';

const WHATSAPP = 'https://wa.me/5543991043536';
const AVATAR = 'assets/chatbot/ChatGPT Image 23 de jul. de 2026, 08_22_35.png';
const INVITE_KEY = 'sofiati_virtual_assistant_invite_seen';
const LEAD_KEY = 'sofiati_virtual_assistant_lead_seen';

let ready = false;

function isPortuguese() {
  const lang = (document.documentElement.lang || '').toLowerCase();
  return lang === 'pt' || lang === 'pt-br' || lang.startsWith('pt-');
}

function pathFor(pt, en) {
  return isPortuguese() ? `/${pt}` : `/en/${en}`;
}

function copy() {
  const pt = isPortuguese();
  return {
    pt,
    name: pt ? 'Assistente virtual' : 'Virtual assistant',
    subtitle: pt ? 'Navegação e contato' : 'Navigation and contact',
    avatarAlt: pt ? 'Ilustração da assistente virtual da clínica' : 'Illustration of the clinic virtual assistant',
    invite: pt ? 'Olá! Posso te ajudar?' : 'Hello! Can I help you?',
    restart: pt ? 'Reiniciar conversa' : 'Restart conversation',
    minimize: pt ? 'Minimizar assistente' : 'Minimise assistant',
    close: pt ? 'Fechar assistente' : 'Close assistant',
    input: pt ? 'Digite uma dúvida ou página...' : 'Type a question or page...',
    send: pt ? 'Enviar' : 'Send',
    start: pt
      ? 'Olá! Sou a assistente virtual do site da Franciele. Posso ajudar você a encontrar uma página, conhecer os tratamentos ou entrar em contato com a clínica. Como posso ajudar?'
      : 'Hello! I am Franciele’s website assistant. I can help you find a page, explore treatments or contact the clinic. How can I help?',
    main: pt
      ? ['Quero conhecer os tratamentos', 'Quero agendar uma consulta', 'Tenho uma dúvida', 'Quero falar com a clínica', 'Preciso encontrar uma página']
      : ['Explore treatments', 'Book a consultation', 'I have a question', 'Contact the clinic', 'Find a page'],
    treatments: pt
      ? 'Claro. Você pode explorar todos os tratamentos ou escolher uma área de interesse.'
      : 'Of course. You can explore all treatments or choose an area of interest.',
    unsure: pt
      ? 'Não tem problema. Você não precisa escolher um tratamento antes da consulta. Franciele poderá avaliar suas necessidades, objetivos e características individuais antes de orientar você.'
      : 'That is completely fine. You do not need to choose a treatment before your consultation. Franciele can assess your needs, goals and individual characteristics before guiding you.',
    consultation: pt
      ? 'Será um prazer ajudar você a dar o próximo passo. O formulário permite enviar seus dados e explicar brevemente o que você procura.'
      : 'We will be happy to help you take the next step. The form lets you send your details and briefly explain what you are looking for.',
    contact: pt
      ? 'Você pode enviar seus dados pelo formulário para que a equipe entenda melhor sua necessidade e responda com mais contexto.'
      : 'You can send your details through the form so the team can better understand your needs and reply with the right context.',
    questions: pt
      ? 'Posso ajudar com informações gerais sobre o site, consultas, preparação e cuidados. Para uma orientação individual, envie sua dúvida pelo formulário.'
      : 'I can help with general information about the website, consultations, preparation and aftercare. For individual guidance, please send your question through the form.',
    navigation: pt ? 'O que você gostaria de encontrar?' : 'What would you like to find?',
    lead: pt
      ? 'Para receber uma orientação mais adequada, você pode enviar uma mensagem pelo formulário. Leva apenas alguns minutos.'
      : 'For more appropriate guidance, you can send a message through the form. It only takes a few minutes.',
    unknown: pt
      ? 'Não encontrei uma resposta específica para isso, mas a equipe pode ajudar. Você gostaria de enviar sua dúvida pelo formulário?'
      : 'I could not find a specific answer for that, but the team can help. Would you like to send your question through the form?',
    medical: pt
      ? 'Não consigo avaliar sintomas ou situações médicas por aqui. Entre em contato diretamente com a clínica. Em caso de urgência, procure atendimento médico imediato.'
      : 'I cannot assess symptoms or medical situations here. Please contact the clinic directly. In an emergency, seek immediate medical care.'
  };
}

function links() {
  return {
    treatments: pathFor('tratamentos.html', 'treatments.html'),
    skin: pathFor('pele.html', 'skin.html'),
    laser: pathFor('laser.html', 'laser.html'),
    rejuvenation: pathFor('tratamentos.html', 'treatments.html'),
    hair: pathFor('tratamentos.html', 'treatments.html'),
    form: pathFor('formulario.html', 'form.html'),
    consultation: pathFor('consulta.html', 'consultation.html'),
    contact: pathFor('contato.html', 'contact.html'),
    faq: pathFor('perguntas.html', 'faq.html'),
    care: pathFor('cuidados.html', 'care.html'),
    journal: pathFor('blog.html', 'journal.html'),
    about: pathFor('sobre.html', 'about.html'),
    sitemap: '/sitemap.xml',
    whatsapp: WHATSAPP
  };
}

function button(label, action, primary = false) {
  return { label, action, primary };
}

function optionSets(t, l) {
  return {
    main: [
      button(t.main[0], 'treatments'),
      button(t.main[1], 'consultation', true),
      button(t.main[2], 'questions'),
      button(t.main[3], 'contact'),
      button(t.main[4], 'navigation')
    ],
    treatments: t.pt
      ? [
          button('Ver todos os tratamentos', l.treatments, true),
          button('Cuidados com a pele', l.skin),
          button('Tratamentos a laser', l.laser),
          button('Rejuvenescimento', l.rejuvenation),
          button('Tratamentos capilares', l.hair),
          button('Não sei qual escolher', 'unsure')
        ]
      : [
          button('View all treatments', l.treatments, true),
          button('Skin care', l.skin),
          button('Laser treatments', l.laser),
          button('Rejuvenation', l.rejuvenation),
          button('Hair treatments', l.hair),
          button('I am not sure', 'unsure')
        ],
    unsure: t.pt
      ? [button('Agendar uma consulta', l.form, true), button('Enviar uma mensagem', l.contact), button('Voltar', 'main')]
      : [button('Book a consultation', l.form, true), button('Send a message', l.contact), button('Back', 'main')],
    consultation: t.pt
      ? [button('Preencher o formulário', l.form, true), button('Como funciona a consulta?', l.consultation), button('Voltar', 'main')]
      : [button('Complete the form', l.form, true), button('How does the consultation work?', l.consultation), button('Back', 'main')],
    contact: t.pt
      ? [button('Abrir formulário de contato', l.contact, true), button('Falar pelo WhatsApp', l.whatsapp), button('Voltar', 'main')]
      : [button('Open contact form', l.contact, true), button('Chat on WhatsApp', l.whatsapp), button('Back', 'main')],
    questions: t.pt
      ? [button('Perguntas frequentes', l.faq), button('Antes e depois do tratamento', l.care), button('Enviar minha dúvida', l.contact, true), button('Voltar', 'main')]
      : [button('Frequently asked questions', l.faq), button('Before and after treatment', l.care), button('Send my question', l.contact, true), button('Back', 'main')],
    navigation: t.pt
      ? [
          button('Sobre Franciele', l.about),
          button('Tratamentos', l.treatments),
          button('Journal', l.journal),
          button('Perguntas frequentes', l.faq),
          button('Contato', l.contact),
          button('Mapa do site', l.sitemap)
        ]
      : [
          button('About Franciele', l.about),
          button('Treatments', l.treatments),
          button('Journal', l.journal),
          button('Frequently asked questions', l.faq),
          button('Contact', l.contact),
          button('Sitemap', l.sitemap)
        ],
    unknown: t.pt
      ? [button('Sim, abrir o formulário', l.contact, true), button('Voltar ao início', 'main')]
      : [button('Yes, open the form', l.contact, true), button('Return to the beginning', 'main')],
    medical: t.pt
      ? [button('Abrir formulário de contato', l.contact, true), button('Falar pelo WhatsApp', l.whatsapp), button('Voltar', 'main')]
      : [button('Open contact form', l.contact, true), button('Chat on WhatsApp', l.whatsapp), button('Back', 'main')]
  };
}

function isUrlAction(action) {
  return /^(?:https?:)?\/\//.test(action) || /\.html(?:#.*)?$|sitemap\.xml$/.test(action);
}

function topicAction(value) {
  const text = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/(dor|infecc|alerg|complic|sintoma|emerg|urgenc|pain|infection|allerg|complication|symptom|emergency)/.test(text)) return 'medical';
  if (/(trat|treatment|laser|pele|skin|rejuven|hair|capilar|cabelo)/.test(text)) return 'treatments';
  if (/(consulta|agend|appointment|book|form|price|preco|valor)/.test(text)) return 'consultation';
  if (/(contato|contact|whatsapp|local|location)/.test(text)) return 'contact';
  if (/(faq|pergunta|question|duvida|doubt|care|cuidado|prepar|aftercare|journal|blog|privacy|privacidade|sobre|about|mapa|sitemap)/.test(text)) return 'navigation';
  return 'unknown';
}

function buildWidget(t) {
  const root = document.createElement('section');
  root.className = 'sf-va';
  root.setAttribute('aria-label', t.name);
  root.innerHTML = `
    <div class="sf-va-invite" role="status" hidden>${t.invite}</div>
    <button class="sff-tool sf-va-trigger" type="button" aria-expanded="false" aria-controls="sf-va-panel" aria-label="${t.name}">
      <img src="${assetPrefix()}${AVATAR}" alt="${t.avatarAlt}" width="96" height="96" decoding="async">
      <span class="sf-va-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
    <div class="sf-va-panel" id="sf-va-panel" role="dialog" aria-modal="false" aria-labelledby="sf-va-title" hidden>
      <header class="sf-va-header">
        <img src="${assetPrefix()}${AVATAR}" alt="${t.avatarAlt}" width="96" height="96" decoding="async">
        <div>
          <h2 id="sf-va-title">${t.name}</h2>
          <p><span class="sf-va-status" aria-hidden="true"></span>${t.subtitle}</p>
        </div>
        <button type="button" class="sf-va-icon" data-va-minimize aria-label="${t.minimize}">−</button>
        <button type="button" class="sf-va-icon" data-va-close aria-label="${t.close}">×</button>
      </header>
      <div class="sf-va-body" data-va-body></div>
      <form class="sf-va-form" data-va-form>
        <input type="text" name="question" maxlength="90" placeholder="${t.input}" aria-label="${t.input}">
        <button type="submit">${t.send}</button>
      </form>
      <button type="button" class="sf-va-restart" data-va-restart>${t.restart}</button>
    </div>`;
  return root;
}

export function initVirtualAssistant() {
  if (ready) return;
  const floating = document.getElementById('sf-floating-inline');
  if (!floating) return;
  ready = true;

  const t = copy();
  const l = links();
  const sets = optionSets(t, l);
  const widget = buildWidget(t);
  floating.prepend(widget);

  const trigger = widget.querySelector('.sf-va-trigger');
  const panel = widget.querySelector('.sf-va-panel');
  const body = widget.querySelector('[data-va-body]');
  const form = widget.querySelector('[data-va-form]');
  const invite = widget.querySelector('.sf-va-invite');
  let interactions = 0;

  function render(message, options) {
    body.innerHTML = `<p class="sf-va-message">${message}</p><div class="sf-va-options"></div>`;
    const list = body.querySelector('.sf-va-options');
    options.forEach((item) => {
      const control = document.createElement('button');
      control.type = 'button';
      control.className = item.primary ? 'sf-va-option is-primary' : 'sf-va-option';
      control.textContent = item.label;
      control.addEventListener('click', () => handleAction(item.action));
      list.append(control);
    });
  }

  function leadMaybe() {
    interactions += 1;
    if (interactions < 4) return false;
    try {
      if (sessionStorage.getItem(LEAD_KEY) === '1') return false;
      sessionStorage.setItem(LEAD_KEY, '1');
    } catch (_) {
      return false;
    }
    render(t.lead, [button(t.pt ? 'Enviar meus dados' : 'Send my details', l.contact, true), button(t.pt ? 'Voltar' : 'Back', 'main')]);
    return true;
  }

  function handleAction(action) {
    if (isUrlAction(action)) {
      window.location.href = action;
      return;
    }
    if (!['main', 'medical', 'unknown'].includes(action) && leadMaybe()) return;
    const messages = {
      main: t.start,
      treatments: t.treatments,
      unsure: t.unsure,
      consultation: t.consultation,
      contact: t.contact,
      questions: t.questions,
      navigation: t.navigation,
      unknown: t.unknown,
      medical: t.medical
    };
    render(messages[action] || t.start, sets[action] || sets.main);
  }

  function open() {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    invite.hidden = true;
    handleAction('main');
    panel.querySelector('.sf-va-option')?.focus({ preventScroll: true });
  }

  function close() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  widget.querySelector('[data-va-minimize]').addEventListener('click', close);
  widget.querySelector('[data-va-close]').addEventListener('click', close);
  widget.querySelector('[data-va-restart]').addEventListener('click', () => {
    interactions = 0;
    handleAction('main');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.elements.question;
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    handleAction(topicAction(value));
  });
  widget.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });

  try {
    if (sessionStorage.getItem(INVITE_KEY) !== '1') {
      window.setTimeout(() => {
        if (panel.hidden) invite.hidden = false;
        sessionStorage.setItem(INVITE_KEY, '1');
      }, 3600);
    }
  } catch (_) {}
}
