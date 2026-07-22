const ICONS = Object.freeze({
  arrowRight: '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
  arrowUpRight: '<path d="M7 17 17 7"></path><path d="M8 7h9v9"></path>',
  calendar: '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path>',
  check: '<path d="m5 12 4 4L19 6"></path>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M8 12h8"></path><path d="M8 16h5"></path>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  droplet: '<path d="M12 2.5S6 9 6 14a6 6 0 0 0 12 0c0-5-6-11.5-6-11.5Z"></path>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h5"></path>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9Z"></path><path d="M11 3 8 9l4 12 4-12-3-6"></path><path d="M2 9h20"></path>',
  heart: '<path d="M20 8.5c0 5.3-8 10-8 10s-8-4.7-8-10A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 2.5Z"></path>',
  help: '<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.7 2.7 0 1 1 3.7 2.5c-.8.4-1.2 1-1.2 1.8"></path><path d="M12 17h.01"></path>',
  leaf: '<path d="M5 21c8-1 14-7 14-18C10 3 4 9 5 21Z"></path><path d="M5 21c0-6 4-10 10-12"></path>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path>',
  mapPin: '<path d="M12 21s7-5.7 7-12A7 7 0 1 0 5 9c0 6.3 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.5"></circle>',
  microscope: '<path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 0 0 7-7h-4a3 3 0 0 1-3 3"></path><path d="m9 14 6-6"></path><path d="m7 12 4 4"></path><path d="m12 3 5 5"></path><path d="M10 5 8 7"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1A19.3 19.3 0 0 1 5.2 13 19.7 19.7 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.8 9.7a16 16 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 1.9Z"></path>',
  scan: '<path d="M7 3H5a2 2 0 0 0-2 2v2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M7 12h10"></path>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-5"></path>',
  sparkle: '<path d="M12 3 10.3 9.3 4 11l6.3 1.7L12 19l1.7-6.3L20 11l-6.3-1.7Z"></path><path d="M19 3v4"></path><path d="M21 5h-4"></path>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"></path>',
  sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.9 4.9 1.4 1.4"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path>',
  target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M5 21a7 7 0 0 1 14 0"></path>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="3.5"></circle><path d="M17.5 6.5h.01"></path>'
});

const RULES = [
  [/whatsapp|wa\.me/i, 'message'],
  [/instagram/i, 'instagram'],
  [/mail|email|e-mail|@/i, 'mail'],
  [/tel:|telefone|phone|contact|contato/i, 'phone'],
  [/local|londrina|map|address|endereco|endereço/i, 'mapPin'],
  [/hour|hora|opening|horário|horario|tempo|duration|dura/i, 'clock'],
  [/consulta|consult|agendar|book|appointment|calendar/i, 'calendar'],
  [/faq|pergunta|question|dúvida|duvida/i, 'help'],
  [/privacy|privacidade|cookie|cookies|consent|dados|data|terms|termos/i, 'lock'],
  [/accessibility|acessibilidade|screen|keyboard|reduced motion/i, 'eye'],
  [/journal|blog|article|artigo|read|leia|guide|guia/i, 'fileText'],
  [/review|testimonial|depoimento|google/i, 'star'],
  [/safe|segur|contraindica|risk|risco|cuidado/i, 'shield'],
  [/qualification|credential|crbm|certif|profission|biom[eé]dic|expertise/i, 'shield'],
  [/laser|co2|lightsheer|harmony|luz|pigment|melasma|vermelhid/i, 'scan'],
  [/ultraformer|ultrassom|ultrasound|radiofrequ|plasma|technology|tecnologia/i, 'microscope'],
  [/skin|pele|barrier|barreira|acne|poros|facial|limpeza/i, 'droplet'],
  [/peel|peeling|renew|renova|texture|textura|collagen|col[aá]geno|firm/i, 'sparkle'],
  [/natural|resultado|result|confidence|confian|valor|value/i, 'leaf'],
  [/plan|planej|process|step|etapa|prepare|prepara|aftercare|recovery|recupera/i, 'clipboard'],
  [/target|precision|precis|individual|personal/i, 'target']
];

function iconNameFor(text, fallback = 'leaf') {
  const value = (text || '').replace(/\s+/g, ' ').trim();
  const rule = RULES.find(([pattern]) => pattern.test(value));
  return rule ? rule[1] : fallback;
}

function makeIcon(name, presentation = 'standalone') {
  const span = document.createElement('span');
  span.className = `sf-icon sf-icon--${presentation}`;
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${ICONS[name] || ICONS.leaf}</svg>`;
  return span;
}

function hasIcon(element) {
  return Boolean(element.querySelector(':scope > .sf-icon, :scope > .sffo-icon, :scope > .sfi-contact-icon'));
}

function enhanceEyebrows(root) {
  root.querySelectorAll('.sf-eyebrow').forEach((eyebrow) => {
    if (hasIcon(eyebrow) || !eyebrow.textContent.trim()) return;
    const section = eyebrow.closest('section');
    const source = `${section?.id || ''} ${section?.dataset.sectionName || ''} ${eyebrow.textContent}`;
    eyebrow.prepend(makeIcon(iconNameFor(source), 'standalone'));
  });
}

function enhanceCards(root) {
  root.querySelectorAll('.sf-content-card, .sf-treatment-menu-card, .sf-consent-card').forEach((card) => {
    if (hasIcon(card) || card.querySelector(':scope > figure, :scope > img')) return;
    const heading = card.querySelector('h2, h3, h4, dt, strong');
    if (!heading) return;
    card.prepend(makeIcon(iconNameFor(`${heading.textContent} ${card.textContent}`), 'soft'));
  });
}

function enhanceButtons(root) {
  root.querySelectorAll('a.sf-button, button.sf-button, .sffo-button, .sfc-button, .sfi-contact, .sf-text-link, .sf-treatment-back, .sf-treatment-finder__reset').forEach((button) => {
    if (hasIcon(button)) return;
    const source = `${button.getAttribute('href') || ''} ${button.textContent}`;
    const external = button.matches('[target="_blank"]') || /^https?:/i.test(button.getAttribute('href') || '');
    button.prepend(makeIcon(external ? 'arrowUpRight' : iconNameFor(source, 'arrowRight'), 'inline'));
  });
}

function enhanceListsAndMeta(root) {
  root.querySelectorAll('.sf-botanical-list li, .sf-treatment-menu-tags li, .sf-treatment-meta div, .sf-consent-meta li, .sf-article-meta li, .sf-post-meta li, .sja-publication span:not([aria-hidden]), .sja-publication a').forEach((item) => {
    if (hasIcon(item)) return;
    item.prepend(makeIcon(iconNameFor(item.textContent, 'check'), 'micro'));
  });
}

function enhanceDisclosures(root) {
  root.querySelectorAll('details summary').forEach((summary) => {
    if (hasIcon(summary)) return;
    const existing = summary.querySelector('[aria-hidden="true"]:last-child');
    if (existing && /^[+−-]$/.test(existing.textContent.trim())) {
      existing.classList.add('sf-faq-toggle-icon');
      existing.textContent = '';
      existing.append(makeIcon('arrowRight', 'inline'));
      return;
    }
    summary.prepend(makeIcon(iconNameFor(summary.textContent, 'help'), 'inline'));
  });
}

function enhanceFooterAndSocial(root) {
  root.querySelectorAll('.sffo-link, .sffo-meta, .sfi-contact').forEach((link) => {
    const existing = link.querySelector(':scope > .sffo-icon, :scope > .sfi-contact-icon');
    if (existing) existing.classList.add('sf-icon', 'sf-icon--inline');
  });
}

export function initIcons() {
  const root = document.body;
  if (!root || root.dataset.iconsEnhanced === 'true') return;
  root.dataset.iconsEnhanced = 'true';
  enhanceEyebrows(root);
  enhanceCards(root);
  enhanceButtons(root);
  enhanceListsAndMeta(root);
  enhanceDisclosures(root);
  enhanceFooterAndSocial(root);
}
