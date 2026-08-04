export const WHATSAPP_NUMBER = '5543991043536';

export const whatsappMessage =
  'Olá, Franciele! Vim pelo site francielesofiati.com e gostaria de mais informações.';

export const whatsappUrl =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

export function applyWhatsAppLinks(root = document) {
  root.querySelectorAll(
    'a[href*="wa.me"], a[href*="api.whatsapp.com"], a.whatsapp-link, a[data-contact-method="whatsapp"], a[data-cta-purpose="whatsapp"]'
  ).forEach((link) => {
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}
