# Final CSS architecture

Production CSS is a deterministic 48-module build. `scripts/build-css.py` declares the single loading manifest and generates `css/site.css`; every public route makes one stylesheet request.

```text
css/src/
├── foundations/   reset, 101-token authority, base elements, typography
├── layout/        rails, intrinsic grids, section tones, responsive reflow
├── components/    chrome, controls, forms, cards, disclosures and system primitives
├── compositions/  heroes, media, statements, journeys and editorial patterns
├── pages/         shared families, explicit art direction, hero scenes and editorial typography for all 21 route types
└── utilities/     accessibility, opt-in reveal and print
```

## Cascade contract

```css
@layer reset, tokens, base, layout, components, compositions, pages, utilities;
```

There is no late override layer. The active build has no duplicate/unused tokens, raw brand colours outside the token source, positional design selectors or undocumented `!important` declarations.

## Current build

| Metric | Result |
|---|---:|
| authored modules | 48 |
| unique active tokens | 120 |
| compiled `css/site.css` | 158,697 bytes |
| CSS architecture errors/warnings | 0 / 0 |
| route art-direction modules | 20 files covering 21 route identities |

`policies.css` and `utilities.css` contain separate explicit selectors for each related route; they do not apply one generic template.

## Layout and composition

- `.sf-container` owns the standard 84rem rail; wide, reading and compact variants constrain content by purpose.
- The hero alone may expand to the 104rem cinematic rail.
- `.sf-section` owns vertical rhythm; `data-density` selects deliberate density.
- `data-tone="paper|mist|sage|blush|forest"` owns surface and contrast.
- Forest is a light section with a contained olive authority panel, not a page-width dark slab.
- The main content uses one continuous WebP vertical background per route; section tones are transparent so the botanical composition does not restart as horizontal bands.
- Background PNG sources remain in `assets/backgrounds/` for archival quality; the 40 WebP delivery copies are the referenced runtime assets.
- All route heroes share the homepage composition: full-width clinic scene, left copy, right portrait, consistent eye-level framing and no mismatched border-flower ornament.
- `data-pattern` identifies semantic composition; appearance never depends on section number.
- Route modules change hero geometry, section emphasis and page storytelling without forking components.

## Build and validation

```bash
python3 scripts/build-css.py
python3 scripts/build-css.py --check
python3 scripts/check-css-architecture.py
```

When adding styles: use an existing token, place the rule in the smallest responsible layer, add a module only for a meaningful responsibility, rebuild, then review EN/PT text expansion and zoom reflow.
