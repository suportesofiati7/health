# Prompt 03 Fix Footer

## Purpose
Guide a footer repair pass for labels, alignment, copyright centering and unwanted decorative boxes.

## Applies To
- `concepts/*/partials/footer.html`
- `concepts/*/css/styles.css`
- `docs/agent-system/06-footer-standards.md`
- `docs/agent-system/16-legal-compliance-disclaimers.md`
- `docs/agent-system/19-known-errors-and-regressions.md`

## Specific Rules
- Footer copyright must be centered on desktop and mobile.
- Remove colored boxes, rectangles, squares and circles around footer columns or footer contact groups.
- Keep the footer premium, calm and concept-specific.
- Use `About`, not `Brand` or `Brand and Trust`.
- Keep Legal and Contact.
- Do not remove required disclaimers, privacy links, legal links or contact access.

## Common Failure Patterns
- Removing decorative boxes by flattening every footer into the same layout.
- Centering the copyright visually in one viewport while offsetting it in another.
- Leaving `aria-label="Brand"` or sitemap labels unchanged.
- Fixing footer partial markup without removing CSS rules that still draw boxes or circles.

## How An AI Agent Should Verify The Work
- Search for forbidden visible labels with `rg -n "Brand|Brand and Trust" concepts/*/partials/footer.html concepts/*/sitemap.html`.
- Render desktop and mobile screenshots for affected concepts.
- Measure or visually confirm copyright centering.
- Inspect Concepts `03`, `05`, `06`, `11`, `13`, `15`, `18`, `28` first, then sample the rest.

## Completion Checklist
- [ ] Footer label cleanup is complete.
- [ ] Copyright is centered in affected concepts.
- [ ] Box/circle/rectangle treatments are removed.
- [ ] Legal and Contact remain accessible.
- [ ] Concept-specific footer styling remains varied.
- [ ] Known-errors and ledger docs are updated.

## Agent Prompt
Fix footer issues only. Start from the known footer regressions and preserve each concept's design language. Replace Brand/Brand and Trust labels with About, center the copyright, remove boxed/circular footer column treatments, keep Legal and Contact, and verify desktop/mobile screenshots before updating the agent-system docs.
