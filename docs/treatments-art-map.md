# Treatments page art map

Status: approved implementation brief for the rebuild below the existing hero.

The hero and final CTA remain the established visual bookends. The body is a treatment atlas: an orientation tool first, an editorial explanation second, and a catalogue only where comparison genuinely helps.

## Shared composition contract

All body chapters resolve to the same site canvas. Background colour, light, botanical material and foreground artwork may bleed to the viewport edge, but headings and functional content use one of the following related rails.

| Token | Maximum | Role |
|---|---:|---|
| `--site-canvas-max` | `104rem` | Outer composition shared by hero, body artwork and CTA |
| `--editorial-wide` | `92rem` | Broad treatment scenes and large media relationships |
| `--editorial-standard` | `84rem` | Chapter headers, navigation and normal compositions |
| `--reading-measure` | `68ch` | Long prose; never used as a section wrapper |
| `--media-wide` | `72rem` | Standalone or dominant photography |
| `--edge-gutter` | `clamp(1rem, 4vw, 3rem)` | Shared responsive edge |

Anchors are the site-canvas left edge, the standard left edge, the standard right edge, the reading measure and the media edge. A nested component may use an internal grid, but it may not introduce another arbitrary centred max-width. Decorative artwork can leave the content grid. No visible vertical guide is used unless it coincides with a real content anchor.

The mandatory desktop chapter header is:

```text
01
SMALL SECTION LABEL
Main heading
```

The number belongs to the chapter boundary and never to a card or media column. Chapter headers use the same top-left standard anchor. On mobile the three elements remain together in source order.

## Page rhythm

```text
approved luminous hero
  → 01 compact concierge finder
  → sticky category index / mobile horizontal index
  → 02 major featured treatment
  → 03 image-led cleansing chapter
  → 04 horizontal mechanical comparison
  → 05 luminous chemical-renewal composition
  → 06 dark-to-light technical laser scene
  → 07 restrained clinical injectable chapter
  → 08 split scalp process
  → 09 focused microneedling plate + compact secondary routes
  → approved luminous CTA
```

The sequence deliberately alternates compact, immersive and standard chapters. Dark olive occurs once as the technical anchor. Ivory, porcelain, sage, blush and pink-gold carry the remaining body.

## Chapter decisions

| Chapter | Communication and hierarchy | Visual asset and silhouette | Difference and transition | Scale, modules and responsive contract |
|---|---|---|---|---|
| 01 — Treatment finder | First: the concierge controls. Second: the promise that suitability is confirmed in consultation. The heading orients without dominating the tool. | Porcelain strip with a warm metallic rule and a small botanical line motif; no photograph. Low horizontal silhouette. | Compresses the hero’s scale, then hands into a sticky category rail. | Compact, about 260–360px desktop depending on wrapping. One composed control surface, no cards. Four useful filters plus “Explore all”. At 390px fields stack and the category index scrolls horizontally. Portuguese labels wrap without shrinking. |
| 02 — Featured treatment | First: one large Ultraformer MPT treatment image. Second: the treatment name and key firmness/contour benefit. Intro, suitable-for labels, technology, recovery note and detail action follow. | `Treatments12.png` at large authority, with a rose-gold illuminated edge and soft leaf shadow entering behind the heading. Asymmetric editorial split. | Expands sharply after the compact finder. A thin gold metadata rail becomes the opening line of the next chapter. | Immersive, about 700–900px only because the image and content justify it. One feature plate, not a card grid. Mobile is copy-first then a 4:3 image; no cropped sliver. |
| 03 — Facial cleansing and preparation | First: the wide treatment moment. Second: “Facial cleansing and skin preparation”. Two service choices sit beneath the introduction. | `Treatments1.png` is the dominant landscape; `Treatments2.png` is a medium supporting crop. Porcelain paper, blush light opening and a fine botanical foreground at one edge. | Calmer and brighter than the feature. The wide photograph overlaps a shallow sage transition into the comparison chapter. | Standard, about 600–760px. Two large editorial modules with an intentional 60/40 hierarchy. At 390px both use full readable width and natural height. |
| 04 — Mechanical exfoliation | First: the side-by-side visual comparison. Second: the chapter heading and the difference between diamond-tip and crystal microdermabrasion. | Strong horizontal crops from `Treatments3.png` and `Treatments4.png`, joined by one continuous gold comparison rule. | Changes from image-led narrative to a precise horizontal comparison. Its rule continues into the chemical intensity scale. | Standard, about 520–700px. One comparison surface with two halves and an internal divider; not two floating tiny cards. At mobile it becomes two full-width rows. |
| 05 — Chemical renewal | First: luminous treatment imagery and the intensity/protocol grouping. Second: “Chemical renewal”. Recovery and pigment cautions remain conspicuous. | `Treatments5.png` is the major image; `Treatments6.png`–`Treatments8.png` are supporting crops. Blush silk, warm pink-gold diffusion and porcelain content surfaces. | Warmer and more luminous than the mechanical chapter. Blush light gradually cools toward the laser scene. | Immersive, about 700–900px. One dominant treatment plus three readable ledger rows inside a single composed surface. At mobile every treatment becomes a generous horizontal/stacked plate. |
| 06 — Laser and light | First: equipment/treatment photography. Second: the technical heading. Three technologies then read from lower-intensity orientation to meaningful recovery. | `Treatments9.png`–`Treatments11.png`, an olive garden shadow, edge illumination, a shared diagonal beam and delicate gold internal structure. The panel and background share the same light direction; it is a full-width scene rather than a rounded green box. | The single dark anchor of the body. It begins with the blush glow from chapter 05 and dissolves into pale sage at the end. | Immersive, about 780–980px. Three integrated treatment plates with a strong first image and readable secondary modules. Ivory text only on reliably dark areas; all card copy sits on opaque surfaces. |
| 07 — Expression and lower face | First: practitioner imagery and facial-planning context. Second: the clinical heading. Anatomy, temporariness and limits precede decorative detail. | `Treatments15.png` and `Treatments16.png`, plus a restrained profile line drawing. Porcelain, soft stone texture and narrow rose-gold anatomical rules. | A quiet clinical reset after laser. A vertical profile rule becomes the split axis of the scalp chapter. | Standard, about 560–740px. Two broad treatment rows in one ledger. No pastel card grid. At mobile the image remains at least 4:3 and text stays above 16px. |
| 08 — Scalp and microinfusion | First: the split treatment image. Second: a short three-part process: assess cause, select substance/route, review response. The two available services are supporting choices. | `Treatments17.png` and `Treatments18.png`, macro hair/scalp crops and a fine follicle line motif. Sage and warm clinic light. | More process-led than chapter 07. The vertical split narrows into the focused line of chapter 09. | Standard, about 620–800px. One split scene with two service ledgers and one compact process, not multiple floating cards. Mobile source order follows the care sequence. |
| 09 — Microneedling | First: one focused treatment plate. Second: what microneedling is and what recovery/suitability planning means. Other assessment-led routes are explicitly secondary. | `Treatments20.png` as the principal image; a macro skin-detail crop and gold micro-dot field. Warm ivory with clay/rose accents. | Concentrated finale after the busier scalp process. A compact secondary ledger for radiofrequency, plasma and PEIM acts as punctuation before the CTA; botanical material then connects into the CTA artwork. | Standard feature, about 600–780px plus a 180–260px compact secondary ledger. One primary plate. Secondary routes are text-led rows with internal dividers. At mobile no region is empty and all routes remain filterable. |

## Treatment inventory and navigation

The rebuild retains all existing services and adds the requested focused microneedling route.

| Location | Treatments |
|---|---|
| Featured | Ultraformer MPT |
| Facial cleansing | Deep Skin Cleansing; Ultrasonic Peel |
| Mechanical exfoliation | Diamond Peel; Crystal Peel — Microdermabrasion |
| Chemical renewal | Retinoic Peel; Jessner Peel; TCA Peel; Professional Depigmentation Protocol |
| Laser and light | Harmony Laser Platform; LightSheer Duet Laser Hair Reduction; AcuPulse CO₂ Laser |
| Expression and lower face | Botulinum Toxin — Upper Face; Botulinum Toxin — Platysma and Lower Face |
| Scalp and microinfusion | MMP; Hair Mesotherapy |
| Focused plate | Microneedling |
| Compact secondary routes | Radiofrequency; Plasma Technology; PEIM |

The desktop category index is sticky below the global header. Mobile uses the same links in a horizontally scrollable navigator. Filters use concern, treatment area, technology and recovery preference; text search is omitted because the curated index and four facets cover the small inventory more clearly. Active navigation and filter states use shape, border and text as well as colour.

## Readability and media rules

- Primary text uses `--forest-900`; secondary text uses `--ink-700` or darker.
- Light text appears only over an opaque dark surface with a minimum audited contrast of 4.5:1 for body copy.
- Gold and pink-gold are rules, focus, numbers and short labels—not body copy.
- Every meaningful image has dimensions, localized alt text and an intentional crop; there are no empty media rectangles.
- Treatment modules never resolve below a practical 20rem text width on desktop. When that width is unavailable, they stack.
- Labels and tags remain at least 14px; body copy remains at least 16px.
- Headings use balanced wrapping and word-aware maximums; no forced word breaks or fixed heading columns.
- Sections are content-sized. No body chapter receives a fixed height or a decorative minimum height.
- EN and PT-BR use identical structure. Portuguese expansion may increase section height; type is never reduced to imitate English line count.

## Verification gates

- 390px and 1920px visual review, plus 320px, 768px and 1440px automated layout checks.
- Keyboard operation for all filter controls and category links.
- Visible focus, selected state and useful live-result status.
- No horizontal overflow at 200% zoom-equivalent reflow.
- No empty image sources, duplicate IDs or missing local assets.
- Contrast review for every olive surface, overlay, label, tag and image-adjacent text.
