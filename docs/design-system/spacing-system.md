# Spacing system

Only repeated rhythm decisions are tokenized. Unused speculative steps were removed during the rebuild.

| Token | Value | Typical relationship |
|---|---:|---|
| `--space-2` | `.65rem` | compact label or metadata gap |
| `--space-3` | `1rem` | paragraph/control relationship |
| `--space-4` | `1.5rem` | heading, field and card group gap |
| `--space-6` | `3.25rem` | major component separation |
| `--grid-gap` | `clamp(1rem, 2.5vw, 2.5rem)` | responsive peer spacing |

Section rhythm is fluid and purpose-led:

| Token | Value |
|---|---|
| `--section-compact` | `clamp(3.25rem, 5vw, 4.75rem)` |
| `--section-standard` | `clamp(4.25rem, 6.5vw, 6.75rem)` |
| `--section-comfortable` | `clamp(5rem, 7.5vw, 7.75rem)` |
| `--section-spacious` | `clamp(6rem, 9vw, 9rem)` |

## Relationship contract

```text
eyebrow → heading → lead/body → action
small       medium       medium     large

field label → control → help/error → next field
small         compact      compact       medium
```

Pages select section density through `data-density`; they do not manufacture arbitrary top/bottom padding. Mobile reduces standard sections to the compact interval while retaining clear chapter boundaries.
