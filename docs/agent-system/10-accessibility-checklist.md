# 10 Accessibility Checklist

## Purpose
Ensure the static site remains usable with keyboard, screen readers and varied viewport sizes.

## Applies To
- All concept HTML, partials, CSS and JS
- Forms, menus, language switchers, floating widgets and cookie notices

## Specific Rules
- Keep skip links functional.
- Menu buttons need `aria-controls`, `aria-expanded` and readable labels.
- Mobile menus need a close control with sufficient contrast.
- Forms need visible labels and required privacy acknowledgement.
- Focus states must be visible.
- Do not use color alone to indicate state.
- Decorative images should be `aria-hidden="true"` or have empty alt text when appropriate.
- Text contrast must remain readable in headers, CTAs, footers and cookie bars.

## Current Audit Notes
- Static alt-text report passes.
- Concept 3 mobile menu language switcher has low inactive-state contrast in screenshot evidence.
- Concept 28 mobile menu close button appears weak against the pale background.

## Common Failure Patterns
- Hiding focus outlines during visual polish.
- Making inactive language buttons too faint.
- Large fixed floating widgets covering footer content.
- Cookie bar covering mobile footer/copyright.

## How An AI Agent Should Verify The Work
- Keyboard-tab through header, menu, form, footer and floating widgets.
- Open and close mobile menu at 390px width.
- Check contrast in screenshots and browser devtools.
- Run static alt text audit.

## Completion Checklist
- [ ] Keyboard access works.
- [ ] Focus states are visible.
- [ ] Language and menu controls are readable.
- [ ] Forms are labelled.
- [ ] Alt-text audit passes.
