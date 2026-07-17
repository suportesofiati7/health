/** Footer enhancements: current-page state, copyright, secure external links,
 * and a progressive entrance animation. */
const FOOTER_SELECTOR = '.sf-footer';
const INITIALIZED_ATTRIBUTE = 'data-sffo-initialized';

function getPageFilename(urlValue) {
  try {
    const url = new URL(urlValue, window.location.href);
    return url.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
  } catch (_) {
    return '';
  }
}

function setCurrentPageLink(footer) {
  const currentFilename = getPageFilename(window.location.href);
  footer.querySelectorAll('.sffo-link[href]').forEach((link) => {
    link.removeAttribute('aria-current');
    const rawHref = link.getAttribute('href');
    if (!rawHref || /^(?:tel:|mailto:|#|javascript:)/.test(rawHref)) return;
    try {
      const linkUrl = new URL(rawHref, window.location.href);
      if (linkUrl.origin === window.location.origin && getPageFilename(linkUrl.href) === currentFilename) {
        link.setAttribute('aria-current', 'page');
      }
    } catch (_) {}
  });
}

function updateCopyrightYear(footer) {
  const copyright = footer.querySelector('.sffo-copy');
  if (!copyright) return;
  const currentYear = new Date().getFullYear();
  const text = copyright.textContent || '';
  copyright.textContent = /©\s*\d{4}/.test(text)
    ? text.replace(/©\s*\d{4}/, `© ${currentYear}`)
    : `© ${currentYear} ${text.trim()}`;
}

function secureExternalLinks(footer) {
  footer.querySelectorAll('a[target="_blank"][href]').forEach((link) => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });
}

function initialiseFooterReveal(footer) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    footer.classList.add('sffo-is-visible');
    return;
  }
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sffo-is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  observer.observe(footer);
}

function initialiseFooter(footer) {
  if (!(footer instanceof HTMLElement) || footer.hasAttribute(INITIALIZED_ATTRIBUTE)) return;
  footer.setAttribute(INITIALIZED_ATTRIBUTE, 'true');
  setCurrentPageLink(footer);
  updateCopyrightYear(footer);
  secureExternalLinks(footer);
  initialiseFooterReveal(footer);
}

export function initFooter() {
  document.querySelectorAll(FOOTER_SELECTOR).forEach(initialiseFooter);
}
