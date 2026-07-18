# Tokens

Implementation authority: `css/src/foundations/tokens.css`. The active build contains 101 unique, used tokens and the strict architecture audit reports no duplicates, unused tokens or raw brand colours outside the token source.

## Model

```text
primitive palette and measurements
              ↓
semantic surface / text / action decisions
              ↓
shared component decisions
```

## Active groups

| Group | Examples |
|---|---|
| Palette | `--ivory-50`, `--sage-100`, `--olive-700`, `--blush-100`, `--rose-gold-600`, `--gold-300` |
| Semantic surfaces | `--color-bg-page`, `--color-bg-surface`, `--color-bg-sage`, `--color-bg-rose`, `--color-bg-olive` |
| Text and action | `--color-text-primary`, `--color-text-secondary`, `--color-text-inverse`, `--color-action-primary`, `--color-focus` |
| Typography | `--font-heading`, `--font-body`, `--font-display`, `--font-section-title`, `--line-body` |
| Rhythm | `--space-2/3/4/6`, `--section-compact/standard/comfortable/spacious`, `--grid-gap` |
| Rails | `--container-wide: 104rem`, `--container-standard: 84rem`, `--container-reading: 68ch`, `--page-gutter` |
| Shape/depth | `--radius-sm/md/lg/xl/arch`, `--shadow-soft`, `--shadow-raised`, `--shadow-glow` |
| Motion | `--duration-instant/fast/standard/slow`, `--ease-standard`, `--ease-emphasized` |
| Controls/layers | `--control-height`, `--header-height`, `--focus-ring`, `--z-header/menu/cookie/floating` |

## Rules

- Components consume semantic or shared component tokens.
- Page modules may choose an existing tone, radius or rail; they may not redefine primitive tokens.
- A new token represents a repeated design decision, not a convenient alias for one declaration.
- Local component variables are avoided when a normal property in the responsible module is clearer.
- Tokens unused after a refactor are removed.
- Raw hex colours are permitted only in `foundations/tokens.css` for palette or state primitives.

Validation:

```bash
python3 scripts/build-css.py --check
python3 scripts/check-css-architecture.py
```
