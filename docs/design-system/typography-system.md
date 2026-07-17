# Typography system

The site uses a privacy-friendly editorial system stack: a high-contrast serif for display moments and a quiet humanist sans-serif for reading and controls. No remote font request is required.

```css
--font-heading: "Iowan Old Style", Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif;
--font-body: Inter, "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-italic: var(--font-heading);
--font-accent: "Segoe Print", "Bradley Hand", "Apple Chancery", cursive;
```

| Role | Active size | Line height | Use |
|---|---|---:|---|
| display XL | `clamp(3.25rem, 7vw, 7.75rem)` | `.91` | homepage and emotional hero thesis |
| display large / medium | `clamp(2.9rem, 5.5vw, 6rem)` / `clamp(2.4rem, 4.25vw, 4.7rem)` | `.91` | editorial openings and feature moments |
| page title | `clamp(2.75rem, 5.1vw, 5.75rem)` | `.91` | route-opening hierarchy |
| section title | `clamp(2.15rem, 3.8vw, 4.15rem)` | `1.0` | chapter hierarchy |
| editorial statement | `clamp(2.8rem, 5.2vw, 5.8rem)` | `.99` | selected oversized moments |
| subsection | `clamp(1.4rem, 1.8vw, 1.95rem)` | `1.08` | cards and local groups |
| intro | `clamp(1.13rem, .85vw + .9rem, 1.42rem)` | `1.72` | explanatory opening copy |
| body | `clamp(1rem, .2vw + .96rem, 1.1rem)` | `1.72` | standard reading |
| small / labels | `.875rem` minimum | `1.5+` | metadata, labels and support copy |
| caption | `.78rem` | `1.5` | captions only; not instructions or labels |
| eyebrow | `.69rem–.78rem` | `1.5` | uppercase editorial orientation, excluded from body-copy minimum |
| pull quote | `var(--type-quotation)` → `clamp(1.3rem, 1.12rem + .62vw, 1.72rem)` italic serif | `1.38` | all quotation treatments |
| chapter | `clamp(2.8rem, 5vw, 5.5rem)` serif | `.9` | architectural 01–09 section marker |
| signature | `1.15rem–1.65rem` accent script | natural | one-to-three-word human accent only |

## Hierarchy rules

- Every route has one `h1`; page chapters use `h2`; local groups use `h3`.
- Headings are balanced and capped by character measure, never fixed height.
- Serif italic is reserved for quotes, brand voice and selective emphasis—not every heading. Page templates never swap headline typefaces; they vary scale, colour and italic emphasis instead.
- Body prose is capped at `68ch`; typography does not grow with ultrawide rails.
- Form labels, treatment labels and treatment tags remain at least 14px in computed CSS pixels.
- Portuguese expansion wraps naturally; font size is never reduced to preserve the English line count.
- Chapter numbers are generated from semantic `data-section` blocks and are decorative hierarchy, not step indicators.
- Vertical labels are hidden below tablet width and do not carry essential information.
- Script/accent type is restricted to short accents such as “with care”; it is never used for navigation, controls or body copy.
- Display type uses the existing ivory, botanical green, blush, rose-gold and warm-gold palette; long copy remains dark and high contrast.

The responsive audit verifies small copy across 42 routes, five widths and five zoom-equivalent states.
