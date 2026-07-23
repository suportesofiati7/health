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

export function initFaqCategories() {
  const nav = qs('[data-faq-categories]');
  if (!nav || nav.dataset.sfFaqCategoriesReady === 'true') return;
  nav.dataset.sfFaqCategoriesReady = 'true';

  const tabs = qsa('[data-faq-tab]', nav);
  const panels = qsa('[data-faq-panel]');
  if (!tabs.length || !panels.length) return;

  function activate(tab) {
    const target = tab.getAttribute('aria-controls');
    tabs.forEach((item) => {
      item.setAttribute('aria-selected', String(item === tab));
      item.setAttribute('tabindex', item === tab ? '0' : '-1');
    });
    panels.forEach((panel) => {
      const active = panel.id === target;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const lastIndex = tabs.length - 1;
      const nextIndex = {
        ArrowRight: index === lastIndex ? 0 : index + 1,
        ArrowLeft: index === 0 ? lastIndex : index - 1,
        Home: 0,
        End: lastIndex
      }[event.key];
      tabs[nextIndex].focus();
      activate(tabs[nextIndex]);
    });
  });

  activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
}
