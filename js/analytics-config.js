/*
 * Franciele Sofiati analytics configuration
 *
 * GTM is the only Google-tag delivery path. It is requested only after the
 * visitor grants analytics consent; individual pages must not add gtag.js or
 * a second GTM bootstrap.
 *
 * Set debug to true only for local/preview validation. Consent remains required
 * in debug mode. Basic consent mode means GTM is not requested until the visitor
 * grants analytics consent.
 */
(function configureFrancieleAnalytics(window) {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  const config = {
    siteName: "Franciele Sofiati Biomedic | Esthetician | Cosmetologist",
    productionDomain: "francielesofiati.com",
    streamName: "FrancieleStream",
    streamId: "15290697519",
    gtmContainerId: "GTM-P9PF3SV4",
    consentMode: "basic",
    consentStorageKey: "sofiati_cookie_preferences_v3",
    leadStorageKey: "sofiati_analytics_pending_lead_v1",
    leadLifetimeMinutes: 30,
    debug: false,
    scrollThresholds: [25, 50, 75, 90],
    engagementThresholds: [30, 60, 120],
    sectionMinimumVisibleMs: 800,
    pageGroups: {
      home: "Core",
      "not-found": "Core",
      about: "Trust",
      mission: "Trust",
      values: "Trust",
      testimonials: "Trust",
      treatments: "Treatments",
      skin: "Treatments",
      laser: "Treatments",
      results: "Treatments",
      care: "Patient Care",
      faq: "Patient Care",
      blog: "Journal",
      journal: "Journal",
      consultation: "Conversion",
      contact: "Conversion",
      "thank-you": "Conversion",
      accessibility: "Legal",
      cookies: "Legal",
      legal: "Legal",
      privacy: "Legal"
    },
    pageTypes: {
      home: "HomePage",
      "not-found": "ErrorPage",
      about: "ProfilePage",
      mission: "AboutPage",
      values: "AboutPage",
      testimonials: "TrustPage",
      treatments: "TreatmentCollection",
      skin: "TreatmentGuide",
      laser: "TreatmentGuide",
      results: "ResultsGuide",
      care: "PatientCareGuide",
      faq: "FAQPage",
      blog: "BlogIndex",
      journal: "JournalIndex",
      consultation: "ConsultationPage",
      contact: "ContactPage",
      "thank-you": "ConfirmationPage",
      accessibility: "PolicyPage",
      cookies: "PolicyPage",
      legal: "PolicyPage",
      privacy: "PolicyPage"
    }
  };

  window.FRANCIELE_ANALYTICS_CONFIG = Object.freeze(config);
})(window);
