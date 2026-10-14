# Franciele Sofiati colour system audit

## Scope

The public Portuguese and English page families, shared header/top bar/mobile menu/footer, forms, buttons, cards, notices, dialogs, journal/article templates, 404 pages and responsive interaction states were reviewed from the shared CSS architecture and route inventory. The site contains 192 canonical public URLs, which inherit the shared palette through `css/site.css`.

## Final semantic tokens

The source of truth is `css/src/foundations/tokens.css`; the deployed bundle is kept in sync in `css/site.css`.

| Token | Final role | Value / source |
| --- | --- | --- |
| `--color-bg-page` | page canvas | `--ivory-50` / `#fffdf7` |
| `--color-bg-surface` | cards and controls | `#fff` |
| `--color-bg-soft` | quiet panels and field backgrounds | `--ivory-100` / `#fbf2e7` |
| `--color-bg-inverse` | dark sections and skip link | `--forest-900` / `#1d3026` |
| `--color-text-primary` | headings and body default | `--forest-900` / `#1d3026` |
| `--color-text-secondary` | leads and supporting copy | `--ink-700` / `#46554c` |
| `--color-text-muted` | metadata and low-emphasis copy | `--olive-600` / `#52634b` |
| `--color-text-placeholder` | form hints | `--olive-600` / `#52634b` |
| `--color-action-primary` | links and primary action text | `--forest-800` / `#293b30` |
| `--color-action-hover` | hover/active action text | `--forest-900` / `#1d3026` |
| `--color-accent-text` | readable rose accent text | `--rose-gold-700` / `#7c453e` |
| `--color-on-accent` | text on accent surfaces | `--ivory-50` |
| `--color-border-strong` | essential control borders | `#8b6b38` |
| `--color-focus` | light-surface focus indicator | `#6a451d` |
| `--color-focus-on-dark` | dark-surface focus indicator | `#f2d493` |
| `--color-error` / `--color-success` | status semantics | `#913c38` / `#356244` |
| `--color-disabled` | disabled control text | `#6f786f` |
| `--color-overlay` | modal/backdrop base | `rgb(18 31 23 / .72)` |

The original `rose-gold-500`, `gold-300` and `menu-green` primitives remain available for decorative lines, gradients and brand surfaces. They are no longer treated as general-purpose text colours where their contrast can fall below AA.

## Contrast checks

Ratios below use the WCAG relative-luminance calculation for opaque colour pairs.

| Pair | Ratio | Result |
| --- | ---: | --- |
| primary text `#1d3026` on ivory `#fffdf7` | 13.74:1 | AA/AAA |
| secondary text `#46554c` on ivory | 7.75:1 | AA/AAA |
| muted text `#52634b` on ivory | 6.36:1 | AA |
| readable rose `#7c453e` on ivory | 7.43:1 | AA/AAA |
| readable gold `#735024` on ivory | 7.11:1 | AA/AAA |
| ivory on menu green `#66745f` | 4.88:1 | AA normal text |
| gold `#d2ad69` on forest `#293b30` | 5.63:1 | AA |
| muted text on soft background | 5.84:1 | AA |

The formerly borderline decorative rose `#b96b5d` (3.88:1 on ivory) and gold `#ab7a38` (3.70:1 on ivory) remain brand primitives for non-text decoration and large/display treatment; semantic text selectors use the darker accessible aliases above.

## State and interaction standardisation

- Focus indicators now use a consistent visible outline with a dark-surface variant; keyboard focus remains preserved on controls, links, menus and modal actions.
- Placeholder text is opaque and uses the readable muted token.
- Disabled inputs and buttons use a neutral surface, border and text treatment instead of opacity-only signalling.
- Error and success states retain border/background/icon or text cues, with `accent-color` support; meaning is not carried by colour alone.
- Hover links/actions move to the darker action token while preserving the botanical/rose/gold identity.
- Overlays and dark surfaces retain light text and dedicated focus contrast.

## Remaining exceptions

Some article-specific and legacy inline styles still use decorative colour literals for hero gradients, image overlays, editorial ornament and 404 illustration details. They are intentionally left as visual art direction rather than remapped blindly; text over those surfaces is already assigned light or dark semantic colours in the shared templates. If a future page introduces a new custom component, it should consume semantic tokens above rather than add a page-local colour.
