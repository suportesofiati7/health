# 14 Translation Language Switcher Checklist

## Purpose
Prevent language switcher overflow, low contrast and spacing regressions.

## Applies To
- `concepts/*/partials/status-banner.html`
- `concepts/*/partials/mobile-menu.html`
- `concepts/*/css/style.css`
- `concepts/*/js/main.js`

## Specific Rules
- Keep EN/PT switcher visible, compact and readable.
- It must not push desktop nav onto two lines.
- It must not overflow on mobile or desktop.
- It needs enough spacing from CTA, nav and close controls.
- Active/inactive states both need readable contrast.
- Do not hide the language switcher as a way to solve layout pressure unless explicitly approved.

## Current Audit Notes
- Live DOM bounds did not find viewport overflow for language switchers at 1440px or 390px.
- Visual screenshot review found Concept 3 mobile inactive `PT` state too faint and the control visually squeezed.
- Concept 28 fits better, but the mobile close button/upper menu controls need readability confirmation.

## Common Failure Patterns
- Treating physical fit as the only pass condition.
- Making inactive language labels almost invisible.
- Placing the switcher in a cramped menu top row.
- Fixing Concept 3 and forgetting Concept 28.

## How An AI Agent Should Verify The Work
- Measure switcher bounding boxes in desktop and mobile.
- Inspect screenshots for contrast and spacing.
- Open mobile menu and verify the switcher does not collide with logo or close button.
- Test both active language button states.

## Completion Checklist
- [ ] EN/PT fits in desktop utility/header area.
- [ ] EN/PT fits in mobile menu.
- [ ] Active and inactive labels are readable.
- [ ] Header nav remains one line.
- [ ] Concepts 3 and 28 are explicitly rechecked.
