export const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export const state = {
  menuOpen: false,
  lastFocus: null,
  scrollY: 0,
  delegatedEventsReady: false,
  sharedData: null,
  sharedDataPromise: null
};

export const APPROVED = Object.freeze({
  contactEmail: 'suportesofiati@gmail.com',
  googleReviewsUrl: 'https://share.google/95oyMN4LpnqCR8NWS'
});
