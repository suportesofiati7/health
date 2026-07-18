# Grid and containers

The site has one alignment spine with deliberate wide, standard, reading and compact rails. Full-bleed backgrounds may span the viewport; their content still resolves to one of these rails.

| Rail | Canonical token | Maximum | Use |
|---|---|---:|---|
| viewport | none | none | section colour and atmospheric light only |
| site canvas | `--site-canvas-max` | `104rem` | outer composition shared by hero, body artwork and CTA |
| editorial wide | `--editorial-wide` | `92rem` | broad scenes and large media relationships |
| editorial standard | `--editorial-standard` | `84rem` | shared chrome, chapter headers and common content |
| reading | `--reading-measure` | `68ch` | prose measure, never a section wrapper |
| compact | `--editorial-compact` | `50rem` | focused forms and utility content |
| media | `--media-wide` | `72rem` | standalone editorial photography |

```css
inline-size: min(calc(100% - 2 * var(--edge-gutter)), var(--editorial-*));
margin-inline: auto;
```

`--edge-gutter: clamp(1rem, 4vw, 3rem)` preserves a 16px floor on narrow screens and a controlled 48px edge on large displays. The previous `--container-*` and `--page-gutter` names are compatibility aliases only; new composition work uses the canonical tokens above.

## Alignment anchors

Every section chooses from the site-canvas edge, standard edge, reading measure or media edge. Internal grids subdivide one selected rail; they do not centre another arbitrary max-width container. Artwork may bleed beyond the selected rail when it remains decorative and cannot compromise reading.

Visible vertical guides are permitted only when they coincide with a real anchor used by the section content. A generic pair of decorative viewport lines is not part of the system.

## Composition thresholds

- Below `36rem`: one content rail; buttons can become full width; arches simplify.
- From `48rem`: process layouts can use a considered two-column tablet grid.
- From `64rem`: editorial splits and route-specific hero relationships may use two columns.
- At desktop: five- and six-step journeys use intrinsic auto-fit columns instead of wrapping four-plus-one.
- At ultrawide: the hero expands to the wide rail while prose remains on standard/reading rails.

## Responsive contracts

- Mobile source order is the reading order.
- Tablet is not forced into either the phone or desktop arrangement.
- Grid children use `minmax(0, 1fr)` and intrinsic minimums to prevent overflow.
- Hero, header, sections and footer share the same gutter logic.
- Zoom reflow can move a desktop composition into its tablet/mobile form without hiding content.

Current evidence covers 320, 390, 768, 1440 and 1920px at 80%, 100%, 125%, 150% and 200% zoom equivalents, plus representative 3440px captures.
