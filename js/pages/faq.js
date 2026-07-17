import { qs, qsa } from '../core/dom.js';

export function initFaqSearch() {
  const search = qs('[data-faq-search]');
  if (!search || search.dataset.sfFaqReady === 'true') return;
  search.dataset.sfFaqReady = 'true';
  const items = qsa('.sf-faq-accordion details, .sf-faq-card');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    items.forEach((item) => {
      const match = !query || item.textContent.toLowerCase().includes(query);
      item.hidden = !match;
      if (match && query && item.tagName.toLowerCase() === 'details') item.open = true;
    });
  });
}
