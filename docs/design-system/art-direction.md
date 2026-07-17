# Art direction

The final visual language translates the reference mockups into a lighter original system: illuminated ivory, sage and olive foundations; blush/champagne light; rose-gold rules; editorial serif hierarchy; rounded panels; and warm, consultation-led photography. The site deliberately avoids the references' heaviest dark treatment.

## Hero system

Every route receives a distinct opening composition through an explicit page module:

- unique portrait source across all 21 route types;
- unique clinic-room background and crop;
- one continuous vertical botanical background image per route, with a light readability wash and an olive lower fade into the footer;
- left/right, compact, wide and asymmetric column variants;
- page-specific arch geometry and portrait positioning;
- contained monogram in the clinic scene; hero border-flower decoration is intentionally removed so image edges remain clean;
- copy on a separate readable surface, never over a busy photograph.

Mobile converts each opening to a copy-first stacked narrative. Tablet uses a full-width image stage. Desktop and ultrawide retain bounded editorial relationships.

## Supporting photography

The source renderer and authored EN/PT output use a 21-image environment sequence rather than rotating four rooms. Every route has a distinct supporting clinic image. Treatment supporting imagery is reused no more than twice across English—including its appearance in the treatment directory.

| Role | Treatment |
|---|---|
| portrait hero | transparent portrait integrated with a warm clinic room; `contain` crop |
| environment | `16 / 10`, architectural lines held level |
| treatment moment | `16 / 10` or context-specific card crop; hands/device retained |
| treatment directory | consistent card anatomy with content-specific images |

All meaningful images retain dimensions and localized alt text. Botanical and monogram imagery is decorative and excluded from the accessibility tree.

## Page rhythm

```text
luminous opening
  ↓
orientation / route choice
  ↓
editorial teaching and evidence
  ↓
contained olive trust moment
  ↓
practical next step
```

- Most sections remain ivory, mist, sage or blush.
- Dark olive is an emphasis scene, normally used once per long page. It may become a full-width composition when the chapter needs technical or ethical gravity; it is not a default floating panel.
- Testimonials keeps two of its nominal forest chapters light to protect its human, reassuring character.
- Cards are not the only grouping device: ledgers, reading columns, timelines, evidence boards, statements, native disclosures and editorial media splits create pacing.
- Decorative flower/monogram assets frame composition; they are not repeated in every corner.

The canonical chapter-by-chapter decisions live in the [sitewide section art map](../sitewide-art-map.md); Treatments has a dedicated [treatment atlas map](../treatments-art-map.md). Implementation: `scripts/render-english-site.py`, `css/src/compositions/heroes.css`, `media-sections.css`, `statements.css`, `directory-sections.css`, and `css/src/pages/*.css`.
