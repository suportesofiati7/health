# Colour system

The visual foundation is intentionally luminous. Warm ivory carries most pages; sage and blush create narrative rhythm; medium olive is reserved for contained authority and conversion panels. Rose-gold and antique gold are details, not paragraph colours or large metallic fields.

## Primitive palette

| Token | Value | Primary use |
|---|---|---|
| `--ivory-50` | `#fffdf9` | brightest page and elevated surface |
| `--ivory-100` | `#fbf6ee` | warm paper field |
| `--sage-50` | `#f4f6ef` | soft clinical wash |
| `--sage-100` | `#e9eee1` | botanical support section |
| `--sage-200` | `#dbe4d1` | illuminated sage detail |
| `--olive-400` | `#8f997d` | scrollbar and quiet visual detail |
| `--olive-600` | `#5d6954` | lighter authority gradient |
| `--olive-700` | `#485440` | primary authority/action colour |
| `--forest-700/800/900` | `#3d4a3d` / `#303d33` / `#243129` | high-contrast text and hover depth |
| `--blush-50/100/200` | `#fff6f2` / `#f8e8e2` / `#efd2ca` | human warmth and soft fields |
| `--pink-gold-300` | `#dca69a` | illuminated CTA detail |
| `--rose-gold-500/600/700` | `#bd796b` / `#a9675b` / `#8f574d` | rules, labels and accessible accent copy |
| `--champagne-100` | `#f4e8d2` | luminous warm surface |
| `--gold-200/300/500/700` | `#ead5ad` / `#d5b57e` / `#b48950` / `#896738` | borders, focus and restrained trust details |
| `--ink-700` | `#596159` | secondary body copy |

## Semantic tones

| HTML tone | Visual result | Intended role |
|---|---|---|
| `data-tone="paper"` | warm ivory | open editorial chapter |
| `data-tone="mist"` | soft cream with blush light | quiet information field |
| `data-tone="sage"` | muted botanical sage | process, trust or practical guidance |
| `data-tone="blush"` | illuminated blush/champagne | human or reassuring emphasis |
| `data-tone="forest"` | light surrounding field with a contained olive panel | authority, evidence or final action |

`forest` does not create a page-width dark slab. Its direct content panel receives the olive surface while the surrounding section remains light. A long page normally contains one or two such moments; testimonials deliberately converts two nominal forest chapters back to light blush/sage to avoid a dark-heavy rhythm.

## Contrast rules

- Primary text is `--forest-900`; secondary text is `--ink-700`.
- Ivory text is used only on `--olive-700`, `--olive-600` or darker fields.
- Gold is a border/focus/detail colour and never normal paragraph copy.
- Rose-gold body accents use `--rose-gold-700`, not pale pink-gold.
- Focus uses a two-part `--focus-ring` that remains visible on light and olive surfaces.
- Error and success states use text, borders and messages; colour is never the only signal.

Implementation authority: `css/src/foundations/tokens.css` and `css/src/layout/sections.css`.
