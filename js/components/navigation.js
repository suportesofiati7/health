import { qs, qsa } from '../core/dom.js';
import { currentPage } from '../core/page.js';
import { focusableSelector, state } from '../core/state.js';

export function markCurrentLinks() {
  const page = currentPage();
  qsa('a[data-page]').forEach((link) => {
    if (link.getAttribute('data-page') === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function getMenu() {
  return qs('#sf-mobile-menu-inline') || qs('#sf-mobile-menu') || qs('.sf-mobile-menu');
}

function getMenuPanel(menu = getMenu()) {
  if (!menu) return null;
  return qs('[role="dialog"]', menu) || qs('aside', menu) || qs('.sfm-panel', menu) || qs('.sf-mobile-panel', menu) || menu;
}

function getOpenButtons() {
  return qsa('[data-sf-mobile-open], [data-mobile-open], [data-menu-open], .sfi-menu-button, .sf-menu-button, .sf-menu-toggle, [aria-controls="sf-mobile-menu-inline"], [aria-controls="sf-mobile-menu"]');
}

function setOpenButtonState(isOpen) {
  const menu = getMenu();
  const id = menu?.id || 'sf-mobile-menu-inline';
  getOpenButtons().forEach((button) => {
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!button.hasAttribute('aria-controls')) button.setAttribute('aria-controls', id);
    const label = isOpen ? button.dataset.labelClose : button.dataset.labelOpen;
    if (label) button.setAttribute('aria-label', label);
  });
}

export function prepareMenuInitialState() {
  const menu = getMenu();
  if (!menu) return;
  if (!menu.hasAttribute('data-state')) menu.setAttribute('data-state', 'closed');
  if (menu.getAttribute('data-state') !== 'open' && !menu.classList.contains('is-open')) {
    menu.hidden = true;
    menu.setAttribute('aria-hidden', 'true');
  }
  setOpenButtonState(false);
}

function lockBody() {
  if (document.body.dataset.sfMenuScrollLock === 'true') return;
  state.scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.sfMenuScrollLock = 'true';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${state.scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}

function unlockBody() {
  if (document.body.dataset.sfMenuScrollLock !== 'true') return;
  delete document.body.dataset.sfMenuScrollLock;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, state.scrollY || 0);
}

export function openMenu(trigger) {
  const menu = getMenu();
  if (!menu) {
    console.warn('[Sofiati] Mobile menu not found. Add data-partial="mobile-menu" or include the mobile-menu partial.');
    return;
  }
  state.menuOpen = true;
  state.lastFocus = trigger || document.activeElement;
  menu.hidden = false;
  menu.setAttribute('aria-hidden', 'false');
  menu.setAttribute('data-state', 'open');
  menu.classList.add('is-open');
  document.documentElement.setAttribute('data-sf-menu-open', 'true');
  setOpenButtonState(true);
  lockBody();

  const focusMenu = () => {
    const panel = getMenuPanel(menu);
    const first = qs(focusableSelector, panel || menu) || panel || menu;
    if (first && typeof first.focus === 'function') first.focus({ preventScroll: true });
  };
  focusMenu();
  window.requestAnimationFrame(() => {
    if (!menu.contains(document.activeElement)) focusMenu();
  });
}

export function closeMenu({ restoreFocus = true } = {}) {
  const menu = getMenu();
  if (!menu) return;
  state.menuOpen = false;
  menu.setAttribute('aria-hidden', 'true');
  menu.setAttribute('data-state', 'closed');
  menu.classList.remove('is-open');
  document.documentElement.removeAttribute('data-sf-menu-open');
  setOpenButtonState(false);
  unlockBody();

  const hideAfterTransition = () => {
    if (menu.getAttribute('data-state') !== 'open') menu.hidden = true;
    menu.removeEventListener('transitionend', hideAfterTransition);
  };
  menu.addEventListener('transitionend', hideAfterTransition);
  window.setTimeout(hideAfterTransition, 420);

  if (restoreFocus && state.lastFocus && typeof state.lastFocus.focus === 'function') {
    window.setTimeout(() => state.lastFocus.focus({ preventScroll: true }), 20);
  }
}

function trapMenuFocus(event) {
  const menu = getMenu();
  if (!menu || menu.getAttribute('data-state') !== 'open') return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
    return;
  }
  if (event.key !== 'Tab') return;

  const panel = getMenuPanel(menu) || menu;
  const focusables = qsa(focusableSelector, panel).filter((el) => !el.hasAttribute('disabled') && (el.offsetParent !== null || el === document.activeElement));
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initDelegatedEvents() {
  if (state.delegatedEventsReady) return;
  state.delegatedEventsReady = true;

  document.addEventListener('click', (event) => {
    const openButton = event.target.closest?.('[data-sf-mobile-open], [data-mobile-open], [data-menu-open], .sfi-menu-button, .sf-menu-button, .sf-menu-toggle, [aria-controls="sf-mobile-menu-inline"], [aria-controls="sf-mobile-menu"]');
    if (openButton) {
      event.preventDefault();
      const menu = getMenu();
      if (menu && menu.getAttribute('data-state') === 'open') closeMenu();
      else openMenu(openButton);
      return;
    }

    const closeButton = event.target.closest?.('[data-sf-mobile-close], [data-mobile-close], .sfm-backdrop, .sfm-close, .sf-mobile-backdrop, .sf-mobile-close');
    if (closeButton && closeButton.closest('#sf-mobile-menu-inline, #sf-mobile-menu, .sf-mobile-menu')) {
      event.preventDefault();
      closeMenu();
      return;
    }

    const menuLink = event.target.closest?.('[data-sf-mobile-link], .sfm-link, .sf-mobile-link');
    if (menuLink && menuLink.closest('#sf-mobile-menu-inline, #sf-mobile-menu, .sf-mobile-menu')) {
      closeMenu({ restoreFocus: false });
    }
  });

  document.addEventListener('keydown', trapMenuFocus);
}
