export const WHATSAPP_NUMBER = '5543991043536';

export const whatsappMessage =
  'Olá! Vim pelo site e gostaria de falar com Franciele Sofiati.';

export const whatsappUrl =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

export function applyWhatsAppLinks(root = document) {
  root.querySelectorAll(
    'a[href*="wa.me"], a[href*="api.whatsapp.com"], a.whatsapp-link, a[data-contact-method="whatsapp"], a[data-cta-purpose="whatsapp"]'
  ).forEach((link) => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}
