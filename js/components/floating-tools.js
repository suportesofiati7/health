import { qsa } from '../core/dom.js';
import { subscribeToScroll } from '../core/scroll-state.js';

let ready = false;

function updateReadableState(enabled) {
  document.body.classList.toggle('sf-readable-mode', enabled);
  qsa('[data-accessibility-toggle]').forEach((toggle) => {
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  });
  qsa('#sf-floating-inline').forEach((floating) => {
    floating.setAttribute('data-readable-active', enabled ? 'true' : 'false');
  });
}

export function initFloatingTools() {
  if (ready) return;
  ready = true;

  qsa('[data-scroll-top]').forEach((button) => {
    button.addEventListener('click', () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  subscribeToScroll(({ y }) => {
    qsa('[data-scroll-top]').forEach((button) => {
      button.classList.toggle('is-visible', y > 520);
    });
  });

  qsa('[data-accessibility-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const enabled = !document.body.classList.contains('sf-readable-mode');
      updateReadableState(enabled);
      try { localStorage.setItem('sofiati_readable_mode', enabled ? '1' : '0'); } catch (_) {}
    });
  });

  try { updateReadableState(localStorage.getItem('sofiati_readable_mode') === '1'); } catch (_) {}
}
