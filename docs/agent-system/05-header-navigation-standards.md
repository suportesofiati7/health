# 05 Header Navigation Standards

## Purpose
Prevent header regressions: wrapping, hidden essentials, weak CTA visibility and inconsistent labels.

## Applies To
- `concepts/*/partials/header.html`
- `concepts/*/partials/navigation.html`
- `concepts/*/partials/mobile-menu.html`
- `concepts/*/partials/status-banner.html`
- `concepts/*/css/style.css`

## Specific Rules
- Desktop header should keep key links on one line unless the concept is explicitly approved as menu-only.
- Required public labels: `Home`, `About`, `Care`, `Laser`, `Skin`, `Results`, `Consultation`, `Contact`.
- Do not use `Brand` or `Brand and Trust` as visible navigation/main-heading labels.
- Keep `Legal` and `Contact` in footer/support navigation.
- Consultation CTA in the header/menu must stand out more than normal links.
- Do not use two solid block-color menu bars on desktop.
- Header styles may vary, but they must remain compact, premium and readable.

## Current Audit Notes
- Live DOM check found desktop nav wrapping in `06-refine`, `16-grace`, `30-method`, and `46-curate`.
- `10-essence` has a menu-only desktop header with no measured visible desktop nav links and no header consultation CTA.
- `05-elevate` has a visible split two-color header block treatment.
- `27-form` has a CSS selector that boxes the logo: `.public-header-27.public-header-layout-form .public-brand-mark`.

## Common Failure Patterns
- Letting `flex-wrap: wrap` hide a header crowding problem.
- Making the CTA a plain text link.
- Placing language switcher, CTA and nav too close together.
- Styling the logo as a boxed card when the brief requires a clean premium header.

## How An AI Agent Should Verify The Work
- Run a rendered desktop check at 1440px and at one narrower desktop width such as 1180px.
- Count nav rows from link bounding boxes.
- Confirm the CTA is visible and visually distinct.
- Test mobile menu open/close, focus and scroll behavior.
- Inspect screenshots for visual balance.

## Completion Checklist
- [ ] Desktop nav stays on one line.
- [ ] CTA stands out.
- [ ] `About` replaces any visible `Brand` label.
- [ ] Mobile menu opens and closes cleanly.
- [ ] Header has no page-width overflow.
