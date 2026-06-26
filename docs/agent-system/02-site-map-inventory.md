# 02 Site Map Inventory

## Purpose
Document the current site architecture and expected page inventory.

## Applies To
- `concepts/*/*.html`
- `concepts/*/partials/`
- `sitemap.xml`
- `robots.txt`
- `audit/reports/page-inventory-audit.md`
- `audit/reports/sitemap-audit.md`

## Specific Rules
- The repo contains 50 concept folders.
- Each concept should contain 20 HTML pages: `index`, `about`, `care`, `laser`, `skin`, `results`, `consultation`, `contact`, `mission`, `values`, `testimonials`, `faq`, `journal`, `blog`, `legal`, `privacy`, `cookies`, `accessibility`, `sitemap`, `404`.
- Every concept uses JS-mounted partials for header, mobile menu, footer, floating widgets, forms and contact cards.
- Every concept sitemap page should link to the main, trust, education, legal and contact pages.
- Root `sitemap.xml` should be checked against the current crawlable page decision.

## Current Inventory
- Concept folders: 50/50.
- Concept HTML files: 1000.
- Required per-concept pages: 20/20 for every concept.
- Root `sitemap.xml`: present with 951 URL entries at audit time.
- Root `sitemap.xml` currently does not include concept `sitemap.html` URLs.
- `robots.txt` points to `https://www.sofiati.com/sitemap.xml`.

## Common Failure Patterns
- Updating a page in one concept but not the corresponding sitemap page.
- Treating raw HTML as the final rendered page even though partials are injected.
- Forgetting `404.html` in inventory checks.
- Letting root sitemap drift from the actual concept page set.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_static_site.py`.
- Read `audit/reports/page-inventory-audit.md` and `audit/reports/sitemap-audit.md`.
- Count concept pages with `find concepts -maxdepth 2 -name '*.html' | wc -l`.
- Check whether root `sitemap.xml` intentionally includes or excludes concept `sitemap.html` pages.
- Load a few `sitemap.html` pages through the local server and verify visible labels.

## Completion Checklist
- [ ] 50 concept folders exist.
- [ ] 20 expected HTML pages exist per concept.
- [ ] Per-concept sitemap pages are present.
- [ ] Root sitemap policy is documented and current.
- [ ] Sitemap visible labels use `About`, not `Brand`.
