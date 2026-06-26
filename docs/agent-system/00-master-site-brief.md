# 00 Master Site Brief

## Purpose
Give future AI agents the stable project context before they audit or edit any Sofiati concept.

## Applies To
- `concepts/01-inspire/` through `concepts/50-sovereign/`
- Root assets in `assets/`
- Root `sitemap.xml` and `robots.txt`
- Audit scripts and reports in `scripts/` and `audit/reports/`
- Agent documentation in `docs/agent-system/`

## Specific Rules
- This is one professional brand expressed as 50 distinct static website concepts.
- Content meaning may repeat; visual systems must not repeat.
- Permanent ethical rules apply everywhere: no guaranteed results, fake testimonials, fake reviews, fake before-and-after imagery, diagnosis through website copy, fake full clinic details, or full street address.
- Public location is `Londrina, PR` only.
- Contact facts are fixed: Franciele Sofiati, Advanced Aesthetic Biomedicine, CRBM 6277, WhatsApp `(43) 9 9104-3536`, email `sofiatimendonca@gmail.com`, Instagram `@fransofiati_biomedica`.
- Use `About`, not visible navigation/main-heading labels containing `Brand` or `Brand and Trust`.
- Keep `Legal` and `Contact` visible.
- Consultation is the primary conversion action and must be more visually prominent than normal nav links.
- Header, menu, CTA, footer, section rhythm, card style, typography, spacing, animation, image treatment and mobile layout should stay concept-specific.

## Common Failure Patterns
- Treating the 50 concepts as recolors of the same template.
- Fixing one concept by copying another concept's header, footer or CTA.
- Hiding important links behind a desktop menu without a visible consultation path.
- Allowing desktop nav to wrap.
- Leaving boxed footer columns, footer circles or visible `Brand` labels after a footer cleanup.
- Trusting static validation alone when the issue is visual spacing or rendered JS partial behavior.

## How An AI Agent Should Verify The Work
- Read `docs/sofiati-task-ledger.md`, `docs/sofiati-master-brief.md` and `docs/current-task-brief.md` before editing.
- Inspect the target concept folder, partials, CSS and JS before changing anything.
- Run static audits after technical edits: `python3 scripts/audit_static_site.py`, `python3 scripts/audit_internal_links.py`, `python3 scripts/audit_layout_signatures.py`, `python3 scripts/audit_ethics.py`.
- Use rendered screenshots or a browser pass for header, menu, footer, language switcher, CTA and responsive issues.
- Update `docs/agent-system/19-known-errors-and-regressions.md` and `docs/agent-system/20-implementation-task-ledger.md` after every fix batch.

## Completion Checklist
- [ ] All 50 concepts preserve unique visual identity.
- [ ] No visible nav/main heading uses `Brand` or `Brand and Trust`.
- [ ] Headers are one line on desktop unless a concept is intentionally menu-only and approved.
- [ ] Footer copyright is centered.
- [ ] Footer columns are not boxed or circled.
- [ ] Language switchers fit and remain readable.
- [ ] Static audits pass.
- [ ] Screenshot or browser QA confirms desktop and mobile behavior.
