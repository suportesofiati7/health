import { closeMenu, initDelegatedEvents, markCurrentLinks, openMenu, prepareMenuInitialState } from './components/navigation.js';
import { initScrollState } from './core/scroll-state.js';
import { initHeaderScroll } from './components/header.js';
import { initFloatingTools } from './components/floating-tools.js';
import { initVirtualAssistant } from './components/virtual-assistant.js';
import { initCookies } from './components/cookie-controls.js';
import { initForms } from './components/forms.js';
import { initTreatmentDirectory } from './components/treatments.js';
import { initFaqCategories, initFaqSearch } from './pages/faq.js';
import { initBlogSearch } from './pages/blog.js';
import { initSocialShare } from './pages/social-share.js';
import { initFrugalChic } from './pages/frugal-chic.js';
import { initFooter } from './components/footer.js';
import { initIcons } from './components/icons.js';
import { loadPartials } from './partials.js';
import { applyWhatsAppLinks } from './core/whatsapp.js';

let sitePromise = null;

export function initSite() {
  if (sitePromise) return sitePromise;
  sitePromise = loadPartials().then(() => {
    applyWhatsAppLinks();
    markCurrentLinks();
    prepareMenuInitialState();
    initDelegatedEvents();
    initScrollState();
    initHeaderScroll();
    initFloatingTools();
    initVirtualAssistant();
    initCookies();
    initFooter();
    initForms();
    initFaqSearch();
    initFaqCategories();
    initBlogSearch();
    initSocialShare();
    initFrugalChic();
    initTreatmentDirectory();
    initIcons();
  });
  return sitePromise;
}

function start() {
  initSite().catch((error) => {
    console.error('[Sofiati] Site initialisation failed.', error);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

window.SofiatiSite = Object.freeze({
  init: initSite,
  openMenu,
  closeMenu,
  version: 'rebuild-foundation-2026-07-13'
});
