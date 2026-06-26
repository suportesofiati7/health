# 03 Page Type Briefs

## Purpose
Summarize what every page type must accomplish so agents can polish pages without flattening concept variety.

## Applies To
- All `concepts/*/*.html`
- `concepts/*/page-flow-map.md`
- `docs/sofiati-master-brief.md`

## Specific Rules
- `index.html`: strongest first impression; explains evaluation-led laser and skin care.
- `about.html`: introduces Franciele and professional context without inventing credentials.
- `care.html`: explains evaluation, protocol planning, preparation and aftercare.
- `laser.html`: presents technology as guided by professional indication.
- `skin.html`: explains skin quality and education without diagnosis.
- `results.html`: sets realistic expectations and avoids before-and-after claims.
- `consultation.html`: primary conversion page; form must be accessible and privacy-aware.
- `contact.html`: practical contact route with Londrina, PR only.
- `mission.html` and `values.html`: brand principles without using public nav/main headings labeled `Brand`.
- `testimonials.html`: consent-aware placeholder only; no fake feedback.
- `faq.html`, `journal.html`, `blog.html`: educational, internal-link-rich support content.
- `legal.html`, `privacy.html`, `cookies.html`, `accessibility.html`: clear support/legal content.
- `sitemap.html`: functional page index.

## Common Failure Patterns
- Reusing identical section order across concepts.
- Repeating the same hero headline, CTA pair and image rhythm.
- Using service copy that implies guaranteed suitability.
- Making legal/support pages visually neglected.
- Mounting a consultation form everywhere without checking whether it overwhelms legal/support pages.

## How An AI Agent Should Verify The Work
- Check one H1 per page with `python3 scripts/audit_static_site.py`.
- Compare page-level `data-layout-signature` sequences.
- Review desktop and mobile screenshots for Home, Care, Laser, Skin and Results after visual edits.
- Confirm every service page mentions evaluation and individual suitability.

## Completion Checklist
- [ ] Each page type has the right visitor purpose.
- [ ] H1/H2 structure is logical.
- [ ] Service pages are ethical and evaluation-led.
- [ ] Page flow differs by concept.
- [ ] Internal links support the visitor journey.
