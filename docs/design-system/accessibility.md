# Accessibility system

The rebuilt site targets WCAG 2.2 AA. Accessibility requirements belong to component acceptance criteria and the build checks, not a late corrective stylesheet.

## Global contract

- One `main` landmark and one descriptive `h1` per page.
- A visible-on-focus skip link precedes shared navigation.
- Heading levels describe structure; visual classes do not change semantics.
- English outputs use `lang="en"`; Brazilian Portuguese outputs use `lang="pt-BR"`.
- Every page pair has reciprocal `hreflang="en"`, `hreflang="pt-BR"` and `x-default` links.
- Text contrast is at least 4.5:1; large text and interface boundaries meet their applicable AA thresholds.
- Focus-visible uses a two-colour ring that survives light, rose, sage and inverse surfaces.
- Tap/click targets are at least `2.75rem`; adjacent targets remain distinguishable.

## Navigation and overlays

```text
trigger (aria-expanded + aria-controls)
  → open menu
  → place focus inside
  → constrain Tab within open overlay
  → Escape or close control
  → restore focus to trigger
```

Essential navigation is present in rendered HTML. JavaScript enhances state and focus behaviour; it does not fetch or reconstruct the only navigation.

## Forms

- Every control has a programmatic label and suitable `autocomplete`.
- Instructions appear before the relevant controls.
- Errors identify the field, describe the correction and are connected with `aria-describedby`.
- The first invalid field receives focus after failed submission.
- Form status uses an existing rendered live region; JavaScript does not invent English-only messages.
- Busy state does not disable cancellation or strand focus.

## Content and media

- Informative images have useful localized alternative text; decorative images use empty alt text or CSS.
- Captions and testimonial attribution remain associated with their content.
- Native `details`/`summary` is preferred for simple accordions.
- Tables retain headers and remain readable without two-dimensional page scrolling where practicable.
- Meaning does not depend on colour, motion, hover or spatial position alone.

## Zoom, reflow and motion

- At 200% zoom, content reflows without loss or horizontal page scrolling at the equivalent 1280px viewport.
- Fixed/sticky chrome does not obscure focused elements or anchor targets.
- Text containers use content measures, not fixed heights.
- `prefers-reduced-motion` removes non-essential movement while preserving state feedback.

## Correct and incorrect examples

Correct: a language switcher is a normal link to the explicit equivalent route and has a concise accessible name.

Incorrect: JavaScript infers the filename after load and updates an empty control.

Correct: a decorative botanical SVG is ignored by assistive technology.

Incorrect: adding `role="button"` to a link instead of using a native button for an action.

## Validation and acceptance

- Automated checks cover language, landmarks, headings, duplicate IDs, labels, alt text, pair links and console errors.
- Manual keyboard QA covers header, menu, filters/search, accordions, forms, cookie controls and floating tools.
- Focus order follows the visual and reading order in both languages.
- Every migrated page is recorded in `docs/rebuild/page-migration-map.md` only after mobile, desktop, keyboard and language QA.
- Known exceptions include a reason, owner and remediation path in the final QA report.
