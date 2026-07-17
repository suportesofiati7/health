import { qsa } from '../core/dom.js';

export function initReveal() {
  const items = qsa('[data-reveal]');
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

  items.forEach((item) => {
    item.classList.add('is-reveal-ready');
    observer.observe(item);
  });
}
