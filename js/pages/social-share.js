const FONT_AWESOME = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';

function ensureFontAwesome() {
  if (document.querySelector('link[data-sf-font-awesome]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_AWESOME;
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  link.dataset.sfFontAwesome = 'true';
  document.head.append(link);
}

export function initSocialShare() {
  const article = document.querySelector('.sf-journal-article');
  if (!article || article.querySelector('[data-social-share]')) return;
  ensureFontAwesome();
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
    <a aria-label="${labels.facebook}" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" rel="noopener noreferrer" target="_blank"><i aria-hidden="true" class="fa-brands fa-facebook-f"></i></a>
    <a aria-label="${labels.linkedin}" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" rel="noopener noreferrer" target="_blank"><i aria-hidden="true" class="fa-brands fa-linkedin-in"></i></a>
    <a aria-label="${labels.x}" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" rel="noopener noreferrer" target="_blank"><i aria-hidden="true" class="fa-brands fa-x-twitter"></i></a>
    <a aria-label="${labels.whatsapp}" href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" rel="noopener noreferrer" target="_blank"><i aria-hidden="true" class="fa-brands fa-whatsapp"></i></a>
    <button aria-label="${labels.copy}" type="button"><i aria-hidden="true" class="fa-solid fa-link"></i><span class="sf-visually-hidden">${labels.copy}</span></button>
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
    } catch { window.prompt(labels.copy, url); }
  });
}
