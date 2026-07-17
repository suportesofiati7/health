import { qsa } from '../core/dom.js';
import { subscribeToScroll } from '../core/scroll-state.js';

let ready = false;

export function initHeaderScroll() {
  if (ready) return;
  ready = true;
  subscribeToScroll(({ y }) => {
    qsa('#sf-header-inline').forEach((header) => {
      header.classList.toggle('is-scrolled', y > 14);
    });
  });
}
