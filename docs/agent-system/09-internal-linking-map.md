# 09 Internal Linking Map

## Purpose
Keep navigation and contextual internal links natural, crawlable and useful.

## Applies To
- All `concepts/*/*.html`
- `concepts/*/partials/navigation.html`
- `concepts/*/partials/footer.html`
- `concepts/*/internal-link-map.md`
- `audit/reports/internal-link-validation.md`

## Specific Rules
- Do not dump all internal links at the bottom of pages.
- Use descriptive anchor text, not `click here`.
- Home should route to About, Care, Laser, Skin, Results, Values/Mission, FAQ, Journal/Blog, Consultation and Contact.
- Service pages should link to consultation, related care pages, results, FAQ and education.
- Legal pages should cross-link privacy, cookies, accessibility and contact.
- Sitemaps should list all main/trust/legal/support pages clearly.
- Footer links must remain crawlable after visual cleanup.

## Current Audit Notes
- `audit/reports/internal-link-validation.md`: PASS.
- All concept footers currently include required link groups, but labels need public-copy cleanup.

## Common Failure Patterns
- Removing links while simplifying header/footer.
- Hiding required links in JS-only widgets without fallback.
- Using duplicate anchor text everywhere.
- Forgetting sitemap pages after label changes.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_internal_links.py`.
- Click-check changed pages through a local server.
- Search changed pages for generic anchors.
- Confirm footer and sitemap labels match the current naming rules.

## Completion Checklist
- [ ] Required links are present.
- [ ] Anchor text is descriptive.
- [ ] Footer and sitemap remain complete.
- [ ] Internal link audit passes.
