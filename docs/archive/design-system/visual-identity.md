# Visual identity

## Brand expression

The rebuilt site is luminous, editorial and clinically responsible. Warm ivory is the principal field; sage and blush shape the page rhythm; medium olive conveys authority; champagne, pink-gold and rose-gold provide fine illuminated detail. Authority does not require page-wide near-black surfaces.

```text
calm clinical authority ─────────────── warm personal care
olive + clear grid             ivory + blush + portrait photography
```

Primary identity comes from typography, proportion, rails, whitespace and photography. Decoration cannot compensate for weak hierarchy.

## Device hierarchy and frequency

| Level | Devices | Use |
|---|---|---|
| Primary | type, colour, spacing, grid, photography, links/buttons | present throughout; consistent on all pages |
| Secondary | sage/blush field, gold rule, botanical line, soft panel/frame | two to four purposeful moments on a long page; not adjacent by default |
| Signature | framed portrait, route medallion, large botanical or atmospheric wash | at most once per page; selected by the route composition |

Correct: a deliberately cropped portrait hero, several typographically led chapters, a sage editorial pause and one contained olive trust panel.

Incorrect: a flower, metallic gradient, gold rule, rounded card, shadow and animation applied to every section.

## Reference translation

The mockups influence editorial pacing, rounded architecture, layered photography, delicate botanical framing and polished CTA composition. Their darker visual weight is not copied. Light space remains dominant and metallic colours are restrained to borders, rules, focus details and small accents.

Each route opens with a different portrait/environment pair and crop. Supporting imagery is selected by page purpose rather than reused as a generic decoration. Botanical assets guide an edge, transition or focal point; they are never repeated in every corner.

## Implementation

- Colour authority: `css/src/foundations/tokens.css`
- Typography: `css/src/foundations/typography.css`
- Containers/rhythm: `css/src/layout/`
- Shared components/compositions: `css/src/components/`, `css/src/compositions/`
- Route art direction: `css/src/pages/`
- Tone contract: `data-tone="paper|mist|sage|blush|forest"`

`forest` is the semantic authority tone. Its implementation is a contained medium-olive panel on a light section, not a full-bleed dark chapter.

## Acceptance criteria

- The page still reads as Sofiati when decorative pseudo-elements are disabled.
- No more than one signature device dominates a viewport.
- Photography is not obscured by text or botanical assets.
- Gold is reserved for details and high-contrast interactive accents, never paragraph copy.
- Blush and sage never reduce text contrast below the system threshold.
- English and Portuguese have equal visual authority.
