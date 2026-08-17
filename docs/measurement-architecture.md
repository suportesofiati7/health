# Measurement architecture

The website has one consent-aware measurement path for every Portuguese and
English route:

`cookie choice → dataLayer → GTM-P9PF3SV4 → GA4`

Do not add `gtag.js`, another GTM snippet, or a GTM `<noscript>` iframe to an
HTML page. `js/consent-manager.js` sets Consent Mode defaults to denied, then
loads the container once only when analytics consent is granted. This is basic
Consent Mode: no Google container request is made before that choice.

## GTM configuration

The GTM container must contain the only Google tag for GA4 measurement ID
`G-S41CQ1303W`. Enable its normal page-view trigger; do not add a second GA4
configuration or a separate Google tag `GT-P8Z9PB5L` on the site.

Create a Custom Event trigger for the following `dataLayer` event names and
send identically named GA4 events:

- `page_context`, `cta_click`, `contact_click`, `social_click`
- `faq_open`, `section_view`, `scroll_depth`, `engagement_time`
- `form_start`, `form_submit`, `form_success`, `generate_lead`
- `language_change`, `outbound_click`, `file_download`, `consent_update`

Register only the parameters needed for reporting: `page_type`,
`page_language`, `content_group`, `cta_location`, `cta_purpose`,
`contact_method`, `form_type`, `lead_type` and `method`. `contact_click` plus
`contact_method=whatsapp` is the canonical WhatsApp intent signal; it avoids
duplicate WhatsApp events. Mark `generate_lead` as the GA4 key event only.

No form value, message, phone number, email address, health information, URL
query string or full error message may be sent to the data layer or GA4.

## Release check

Run `npm run check:analytics` before deployment. It verifies that all paired
PT-BR and English pages use the local consent-aware bootstrap and that legacy
direct Google snippets are absent.
