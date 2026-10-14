# SEO Property Audit

Generated from the repository's maintained SEO, sitemap, social-preview and internal-link validators on 2026-10-14.

## Coverage

- Public HTML pages parsed: 199.
- Canonical, indexable sitemap URLs: 192.
- Language-pair routes covered by the analytics/page-pair contract: 178 across 89 pairs.
- Images audited: 1,721.
- Structured-data and on-page SEO errors: 0.
- Social-preview pages validated: 223.
- Internal-link audit: passed.

The complete page-level metadata matrix is maintained in [`reports/validation/seo.md`](../validation/seo.md), including page, title length, description length, robots directive and page-specific schema.

## Field status

| Field | Status | Evidence or action |
| --- | --- | --- |
| HTML5, language, viewport | Present and validated | SEO implementation validator passed. |
| Titles and descriptions | Present; some editorial lengths need review | 114 non-blocking length warnings remain; no missing indexable metadata errors. |
| Canonicals and hreflang | Present and validated | Canonical/hreflang checks passed. |
| Robots and sitemap | Present and validated | 192 canonical URLs; 20 deliberate exclusions. |
| Open Graph and X cards | Present and validated | Social-preview validator passed for 223 pages. |
| JSON-LD | Present and syntactically/structurally validated | Existing WebSite, WebPage, Person, business, Service, Article, Breadcrumb, Image and FAQ entities retained where applicable. |
| Image dimensions and alternatives | Audited | 1,721 images checked; decorative images use empty alternatives where appropriate. |
| Internal links | Passed | No broken internal-link errors reported. |
| Analytics/privacy metadata | Passed | Analytics validator: 178 pages, 149 forms, 0 errors. |

## Requires confirmation

- Google Search Console still requires an account-side DNS verification or a real HTML token; no placeholder is published.
- The review URL is now normalized to the publicly verified `https://share.google/95oyMN4LpnqCR8NWS`.
- The published map URL, address, opening hours and CRBM 6277 are retained from the maintained repository data and public contact page; re-confirm them if business records change.
- The Portuguese/English parity checker reports existing translation drift in legacy content. No bulk copy rewrite was made without approved translations.

## Validation limitations

- No Google Search Console account or Rich Results Test submission was performed.
- No live indexing, ranking or field performance claim is made.
- Editorial title/description warnings are recommendations, not proof of a ranking defect.
