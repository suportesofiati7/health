import { promptAction } from "../core/dialog.js";
const icons = {
  facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
  linkedin: '<path d="M5 9v12M5 3v1M10 21V9h4v2c2-4 7-3 7 2v8M14 11v10"/>',
  x: '<path d="m4 3 16 18M20 3 4 21"/>',
  whatsapp: '<path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5a9 9 0 1 1 16-5Z"/><path d="M8 7c-2 3 3 8 6 8l2-2-3-2-1 1-2-2 1-1-2-2Z"/>',
  link: '<path d="m10 13 4-4m-6 2-3 3a4 4 0 0 0 6 6l3-3m-4-10 3-3a4 4 0 0 1 6 6l-3 3"/>',
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;

export function initSocialShare() {
  const article = document.querySelector('.sf-journal-article');
  if (!article || article.querySelector('[data-social-share]')) return;
  const english = document.documentElement.lang.startsWith('en');
  const title = document.querySelector('h1')?.textContent?.trim() || document.title;
  const url = window.location.href;
  const labels = english
    ? { heading: 'Share this article', copy: 'Copy link', copied: 'Link copied', facebook: 'Share on Facebook', linkedin: 'Share on LinkedIn', whatsapp: 'Share on WhatsApp', x: 'Share on X' }
    : { heading: 'Compartilhe este artigo', copy: 'Copiar link', copied: 'Link copiado', facebook: 'Compartilhar no Facebook', linkedin: 'Compartilhar no LinkedIn', whatsapp: 'Compartilhar no WhatsApp', x: 'Compartilhar no X' };
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const logoUrl = new URL('/assets/brand/logotipo-franciele-sofiati-avaliacao-estetica-estetica-avancada-londrina-centro.webp', window.location.origin).href;
  const share = document.createElement('section');
  share.className = 'sja-share';
  share.dataset.socialShare = 'true';
  share.setAttribute('aria-labelledby', 'share-heading');
  share.innerHTML = `<div class="sja-share__brand"><img alt="Franciele Sofiati" height="1183" src="${logoUrl}" width="1134"><p id="share-heading">${labels.heading}</p></div><div class="sja-share__buttons">
    <a aria-label="${labels.facebook}" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" rel="noopener noreferrer" target="_blank">${icon("facebook")}</a>
    <a aria-label="${labels.linkedin}" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" rel="noopener noreferrer" target="_blank">${icon("linkedin")}</a>
    <a aria-label="${labels.x}" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" rel="noopener noreferrer" target="_blank">${icon("x")}</a>
    <a aria-label="${labels.whatsapp}" href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" rel="noopener noreferrer" target="_blank">${icon("whatsapp")}</a>
    <button aria-label="${labels.copy}" type="button">${icon("link")}<span class="sf-visually-hidden">${labels.copy}</span></button>
  </div>`;
  const prose = article.querySelector('.sja-prose');
  const conversion = prose?.querySelector('.sja-conversion');
  if (conversion) conversion.before(share);
  else prose?.append(share);
  share.querySelector('button')?.addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(url);
      event.currentTarget.setAttribute('aria-label', labels.copied);
      event.currentTarget.querySelector('.sf-visually-hidden').textContent = labels.copied;
      setTimeout(() => {
        event.currentTarget.setAttribute('aria-label', labels.copy);
        event.currentTarget.querySelector('.sf-visually-hidden').textContent = labels.copy;
      }, 1800);
    } catch { await promptAction(labels.copy, url); }
  });
}
