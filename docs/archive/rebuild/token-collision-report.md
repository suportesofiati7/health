# Token collision report

Source inspected: `css/src/foundations/tokens.css` at baseline commit `b916ad91d`.

## Summary

| Metric | Count |
|---|---:|
| Declarations | 235 |
| Unique names | 129 |
| Names declared more than once | 53 |
| Names with conflicting values | 38 |
| Maximum definitions for one name | 7 |

The file is not an authoritative token system; it is a historical merge preserving old source order. Components therefore receive values based on whichever generation appears last.

## Highest-risk collisions

| Token | Definitions | Distinct values | Consequence |
|---|---:|---:|---|
| `--sf-section-y` | 7 | 7 | Section rhythm changes by late source order. |
| `--sf-gold` | 6 | 4 | Brand gold varies between champagne, bronze and bright gold. |
| `--sf-ivory` | 5 | 2 | Page/surface backgrounds are nearly but not consistently aligned. |
| `--sf-muted` | 5 | 5 | Body contrast and hierarchy vary across layers. |
| `--sf-wide` | 4 | 4 | Wide containers range from 1320px to 2048px. |
| `--sf-radius` | 4 | 2 | Earlier 30px language is silently replaced by 8px. |
| `--sf-shadow` | 4 | 4 | Component elevation varies without semantic intent. |
| `--sf-shadow-soft` | 4 | 4 | Equivalent cards use different shadows by source order. |
| `--sf-line` | 4 | 4 | Borders change hue/opacity across theme generations. |
| `--sf-max` | 4 | 3 | Main content rail changes from 1180px to 2048px. |

## Target mapping

Legacy tokens are not carried forward as aliases indefinitely. New tokens use three explicit levels:

```text
primitive:  --palette-ivory-50, --palette-forest-800, --size-4
semantic:   --color-bg-page, --color-text-primary, --space-section
component:  --button-primary-background, --hero-copy-width
```

The approved values will be documented in `docs/design-system/tokens.md` and implemented once in `css/src/foundations/tokens.css`. Temporary compatibility aliases may exist only during representative-page migration and must be listed in the legacy removal log with a removal condition.

## Automated acceptance criteria

- Zero duplicate base-level global definitions.
- Zero raw brand hex/rgb/hsl values outside the approved token source.
- Zero undefined custom-property references.
- Zero unused semantic/component tokens, excluding documented public extension hooks.
- Zero component files redefining primitive or semantic global tokens.
- Any theme scope changes semantic aliases only and is tied to an explicit `data-tone`/component state.
