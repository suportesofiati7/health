# 11 Responsive Mobile Desktop Checklist

## Purpose
Define responsive checks for every future visual batch.

## Applies To
- All concept pages and partials
- `audit/screenshots/`
- Screenshot capture scripts in `scripts/`

## Specific Rules
- Check at least 1440px desktop and 390px mobile.
- Header must not wrap on desktop.
- Mobile menu must fit, scroll if needed and close clearly.
- Language switcher must fit and stay readable.
- Footer must stack cleanly without boxed-column treatments.
- No horizontal page overflow.
- CTA text must fit inside buttons.

## Current Audit Notes
- Rendered DOM check found no page-level horizontal overflow at 1440px or 390px.
- Desktop nav wraps in `06-refine`, `16-grace`, `30-method`, and `46-curate`.
- Mobile header overflow of 10px was measured in `17-sculpt`.

## Common Failure Patterns
- Checking only a wide desktop viewport.
- Forgetting that `flex-wrap` can hide a failed one-line nav requirement.
- Fixing desktop footer and missing mobile footer stacking.
- Letting cookie bars hide lower-page controls.

## How An AI Agent Should Verify The Work
- Use a local server and wait for partials.
- Measure `document.documentElement.scrollWidth - innerWidth`.
- Measure nav link row count from rendered bounding boxes.
- Review desktop and mobile screenshots after every visual batch.

## Completion Checklist
- [ ] Desktop header one-line check passes.
- [ ] Mobile menu readable and scrollable.
- [ ] No horizontal overflow.
- [ ] Footer is clean on both viewports.
- [ ] Screenshots are refreshed if visual files changed.
