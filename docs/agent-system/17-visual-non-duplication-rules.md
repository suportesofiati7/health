# 17 Visual Non Duplication Rules

## Purpose
Preserve visible concept uniqueness and stop agents from solving issues by standardizing everything.

## Applies To
- All concept HTML, CSS, partials, assets and screenshots
- `concepts/*/design-dna.md`
- `audit/reports/global-duplicate-layout-audit.md`
- `audit/reports/screenshot-design-qa.md`

## Specific Rules
- Each concept must remain visibly unique in header, mobile menu, hero, section order, cards, image treatment, footer, CTA, typography, spacing and animation.
- Do not clone one successful concept into another.
- Same content purpose is allowed; same visual silhouette is not.
- Static layout signatures must remain unique by page sequence.
- Screenshot QA matters because static signatures cannot catch all perceived similarity.

## Current Audit Notes
- `audit/reports/global-duplicate-layout-audit.md`: PASS for exact signature sequences.
- `audit/reports/screenshot-design-qa.md`: PASS for first-viewport differentiation of Home, Care, Laser, Skin and Results.
- The current footer system still repeats a visible boxed-column rhythm across many concepts.

## Common Failure Patterns
- Fixing footer labels by applying one identical footer layout everywhere.
- Making all CTAs the same high-contrast pill.
- Reusing the same mobile menu after a language-switcher fix.
- Over-relying on exact signature audits.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_layout_signatures.py`.
- Compare screenshot contact sheets before and after visual changes.
- Document which concept-specific traits were preserved.
- Review any systemic patch for unintended visual sameness.

## Completion Checklist
- [ ] Layout signature audit passes.
- [ ] Screenshots show meaningful concept variety.
- [ ] Header/footer/CTA fixes remain concept-specific.
- [ ] Repeated boxed footer rhythm is reduced.
