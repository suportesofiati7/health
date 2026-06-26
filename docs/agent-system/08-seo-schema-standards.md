# 08 SEO Schema Standards

## Purpose
Protect metadata, headings, schema and crawlability while visual work continues.

## Applies To
- All `concepts/*/*.html`
- `concepts/*/partials/head.html`
- `concepts/*/partials/schema.html`
- `concepts/*/js/partials.js`
- `sitemap.xml`

## Specific Rules
- Every page needs one unique title, one unique meta description and one H1.
- Heading outline must be logical: H1 once, H2 for main sections, H3 for cards/subsections.
- JSON-LD should be present where appropriate.
- Use WebSite, Person, ProfessionalService, WebPage and BreadcrumbList globally.
- FAQPage, Article/BlogPosting, PrivacyPolicy or related schema may be used where appropriate.
- Do not add fake ratings, fake reviews or full street address schema.
- Use `Londrina, PR` only.

## Current Audit Notes
- `audit/reports/seo-validation.md`: PASS.
- `audit/reports/schema-validation.md`: PASS.
- `audit/reports/alt-text-validation.md`: PASS.
- `js/partials.js` dynamically injects richer schema/head partials after load.

## Common Failure Patterns
- Editing static head markup but forgetting dynamic head/schema partials.
- Duplicating titles after bulk copy changes.
- Adding review/rating schema to support conversion.
- Skipping H1 checks after hero rewrites.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_static_site.py`.
- Inspect `audit/reports/seo-validation.md` and `audit/reports/schema-validation.md`.
- Check rendered head output if partial behavior changed.
- Validate root sitemap counts after page inventory changes.

## Completion Checklist
- [ ] Title and meta descriptions are unique.
- [ ] One H1 per page.
- [ ] Schema is present and ethical.
- [ ] Sitemap policy is documented.
- [ ] SEO reports pass.
