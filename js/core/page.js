import { qs } from './dom.js';

export function assetPrefix() {
  // Compiled stylesheets have fingerprinted names. The document owns its
  // relative site root, independently of CSS filenames and clean URL routing.
  if (document.body?.hasAttribute('data-site-root')) return document.body.dataset.siteRoot || '';
  const css = qs('link[href$="css/site.css"], link[href*="/css/site.css"], link[href$="theme.css"], link[href*="/theme.css"]');
  if (css) {
    const href = css.getAttribute('href') || '';
    const match = href.match(/^(.*?)(?:css\/site\.css|theme\.css)(?:[?#].*)?$/);
    if (match) return match[1];
  }
  const path = window.location.pathname || '';
  if (/\/(pt|pt-br|en)\//i.test(path)) return '../';
  return '';
}

export function currentPage() {
  const bodyPage = document.body?.dataset?.page;
  if (bodyPage) return bodyPage === 'index' ? 'home' : bodyPage;
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  return file.replace(/\.html?$/i, '').replace(/^index$/i, 'home') || 'home';
}
