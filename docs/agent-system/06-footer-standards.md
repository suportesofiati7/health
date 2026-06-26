# 06 Footer Standards

## Purpose
Stop footer regressions and make every footer clean, aligned, premium and easy to scan.

## Applies To
- `concepts/*/partials/footer.html`
- `concepts/*/css/style.css`
- `audit/screenshots/desktop/*.png`
- `audit/screenshots/mobile/*.png`

## Specific Rules
- Footer copyright must be centered everywhere.
- Remove visible boxed footer column styles.
- Do not use colored boxes, rectangles or circles around footer columns or contact groups.
- Do not use visible footer headings `Brand` or `Brand and Trust`; use `About` for the trust/about group.
- Keep `Legal`, `Contact`, main pages and support pages easy to find.
- Footer can use soft glows, gold accents, elegant dividers, botanical details and subtle gradients.
- Footer should remain compact on mobile.

## Current Audit Notes
- All 50 footers contain visible `Brand` and `Brand and Trust` labels in `partials/footer.html`.
- Live DOM check found copyright off-center on 38 desktop concepts because bottom rows use `space-between`.
- Screenshot review confirmed boxed/circle footer treatment issues especially in `03-enhance`, `05-elevate`, `06-refine`, `11-bloom`, `13-poise`, `15-clarity`, `18-lumin`, and `28-pure`.

## Common Failure Patterns
- Replacing boxes with different boxes.
- Centering the disclaimer but leaving the copyright offset.
- Fixing desktop footer while mobile still stacks as cards.
- Removing legal/contact links during visual cleanup.

## How An AI Agent Should Verify The Work
- Search for `Brand and Trust`, `>Brand<`, and `aria-label="Brand"` under `concepts/*/partials/footer.html`.
- Render footer at desktop and mobile widths.
- Measure copyright center delta against the footer shell.
- Inspect screenshots for visible column boxes/circles/rectangles.
- Confirm all footer links remain crawlable.

## Completion Checklist
- [ ] Footer copy uses `About`, not visible `Brand` labels.
- [ ] Copyright is centered.
- [ ] No boxed/circular footer columns remain.
- [ ] Legal and Contact are retained.
- [ ] Desktop and mobile footer screenshots pass visual review.
