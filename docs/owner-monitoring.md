# Owner monitoring guide

This site is instrumented for measurement, but Google account configuration and
ongoing review must be completed by an account owner. Use this small routine;
do not add another Analytics property, GTM container or SEO plugin.

## What to review

| Question | Tool | Report or event |
| --- | --- | --- |
| How many people arrived and where from? | GA4 | Reports → Acquisition → Traffic acquisition; review source/medium and campaign. |
| Which searches produced visibility? | Search Console | Performance → Search results; review queries, pages, impressions, clicks, CTR and position. |
| Which pages and services attract interest? | GA4 + Search Console | Pages and screens plus Search Console page filters. |
| How many people contact the business? | GA4 | Mark `generate_lead` as the single lead key event; inspect `contact_click` by `contact_method`. |
| Is Google indexing important pages? | Search Console | Page indexing, Sitemaps and URL inspection. Submit `https://francielesofiati.com/sitemap.xml`. |
| Has performance deteriorated? | Search Console + PageSpeed Insights | Core Web Vitals and mobile/desktop tests for home, treatments, consultation and contact. |

## Campaign naming

Use lowercase UTM values and keep them stable:

```text
utm_source=instagram|facebook|whatsapp|email|google_business_profile|google
utm_medium=social|referral|email|organic|paid_social|cpc
utm_campaign=2026_consultation|2026_laser|2026_skin
utm_content=profile_link|story|reel|bio|newsletter|cta
utm_term=only_for_paid_search
```

Never put names, phone numbers, email addresses, health information or free
text in UTM values. The form captures campaign fields without sending form
contents to Analytics.

## Monthly checks

1. Accept analytics consent and test one WhatsApp click, phone click, form
   success and lead. Confirm each event appears once in GA4 Realtime.
2. In Tag Assistant, reject optional cookies and confirm neither GA4 nor GTM
   requests occur; grant analytics consent and confirm each loader once.
3. Inspect `/`, `/consulta`, `/tratamentos`, `/laser`, `/pele`, and `/contato`
   in Search Console; confirm indexability and canonical URLs.
4. Review Core Web Vitals and mobile PageSpeed Insights against the committed
   performance budget.
5. Check the Google Business Profile for matching name, address, phone,
   website, hours and review destination.

## Account actions still required

The repository cannot verify external Google accounts. An owner must verify the
`francielesofiati.com` Domain property in Search Console, submit the sitemap,
confirm GA4 uses `G-S41CQ1303W`, configure and publish GTM `GTM-P9PF3SV4`, and
confirm the Business Profile is claimed and verified. Bing Webmaster Tools can
be connected by importing the verified Search Console property.
