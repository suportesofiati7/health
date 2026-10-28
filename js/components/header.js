import { qsa } from '../core/dom.js';
import { subscribeToScroll } from '../core/scroll-state.js';

let ready = false;

export function initHeaderScroll() {
  if (ready) return;
  ready = true;
  const header = document.querySelector('#sf-header-inline');
  const hero = document.querySelector('.sf-main > [data-pattern="hero"]');
  if (header && hero) {
    // Keep the header in flow; let the hero begin behind its measured footprint.
    const measure = () => {
      const style = getComputedStyle(header);
      const footprint = header.getBoundingClientRect().height
        + parseFloat(style.marginBlockStart || 0)
        + parseFloat(style.marginBlockEnd || 0);
      document.body.style.setProperty('--hero-menu-space', `${footprint}px`);
    };
    measure();
    document.body.classList.add('sf-hero-underlay');
    new ResizeObserver(measure).observe(header);
  }
  subscribeToScroll(({ y }) => {
    qsa('#sf-header-inline').forEach((header) => {
      header.classList.toggle('is-scrolled', y > 14);
    });
  });
}
