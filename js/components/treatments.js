import { qs, qsa } from '../core/dom.js';

const FACETS = ['concern', 'area', 'technology', 'recovery'];

function tokensFor(entry, facet) {
  return (entry.getAttribute(`data-treatment-${facet}`) || '')
    .split(/\s+/)
    .filter(Boolean);
}

export function initTreatmentDirectory() {
  const finder = qs('[data-treatment-filter][role="search"]');
  const categoryNav = qs('[data-treatment-category-nav]');
  if ((!finder && !categoryNav) || document.body.dataset.page !== 'treatments') return;
  if (finder?.dataset.sfDirectoryReady === 'true') return;
  if (finder) finder.dataset.sfDirectoryReady = 'true';

  const controls = finder ? qsa('[data-treatment-facet]', finder) : [];
  const reset = finder ? qs('[data-treatment-reset]', finder) : null;
  const status = finder ? qs('[data-treatment-filter-status]', finder) : null;
  const entries = qsa('[data-treatment-entry]');
  const groups = qsa('.sf-treatment-menu[data-treatment-layout]');
  const sections = qsa('[data-treatment-filterable]');
  const categoryLinks = categoryNav ? qsa('[data-treatment-category-link]', categoryNav) : [];

  const selected = () => Object.fromEntries(
    controls.map((control) => [control.dataset.treatmentFacet, control.value]),
  );

  const apply = () => {
    const values = selected();
    const active = Object.values(values).some(Boolean);
    let visible = 0;

    entries.forEach((entry) => {
      const match = FACETS.every((facet) => {
        const value = values[facet] || '';
        return !value || tokensFor(entry, facet).includes(value);
      });
      entry.hidden = !match;
      if (match) visible += 1;
    });

    groups.forEach((group) => {
      const groupEntries = qsa('[data-treatment-entry]', group);
      group.hidden = groupEntries.length > 0 && groupEntries.every((entry) => entry.hidden);
    });

    sections.forEach((section) => {
      const sectionEntries = qsa('[data-treatment-entry]', section);
      section.hidden = sectionEntries.length > 0 && sectionEntries.every((entry) => entry.hidden);
    });

    finder?.classList.toggle('is-filtering', active);
    reset?.setAttribute('aria-pressed', String(!active));
    if (status) {
      const template = visible === 0
        ? status.dataset.labelEmpty
        : visible === 1
          ? status.dataset.labelSingular
          : status.dataset.labelPlural;
      status.textContent = (template || '{count}').replace('{count}', String(visible));
    }
  };

  const clear = () => {
    controls.forEach((control) => { control.value = ''; });
    apply();
  };

  controls.forEach((control) => control.addEventListener('change', apply));
  reset?.addEventListener('click', clear);

  const markCategory = (id) => {
    categoryLinks.forEach((link) => {
      const current = link.getAttribute('href') === `#${id}`;
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  categoryLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const id = (link.getAttribute('href') || '').replace(/^#/, '');
      const target = id ? document.getElementById(id) : null;
      if (target?.hidden) clear();
      if (id) markCategory(id);
    });
  });

  if ('IntersectionObserver' in window && categoryLinks.length) {
    const observer = new IntersectionObserver((observations) => {
      const visibleSections = observations
        .filter((observation) => observation.isIntersecting && !observation.target.hidden)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visibleSections[0]) markCategory(visibleSections[0].target.id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.01, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  apply();
}
