# Page migration map

> Completion update (2026-07-13): the table below is the pre-implementation migration plan retained as an audit record. All 21 EN/PT pairs are now complete. Current per-route QA status is authoritative in `final-page-map.md`.

English HTML remains the structural source for Portuguese generation. Every row represents an EN/PT pair and both URLs must reach the same migration state before completion.

Status vocabulary: `baseline` → `representative` → `markup migrated` → `visual QA` → `complete`.

| URL / source | Family | Current components | Confirmed visual/architecture issue | Planned composition | Status |
|---|---|---|---|---|---|
| `/` · `index.html` | home | split hero, evidence, sequence, quotes, bands, definitions, directory, cards | Ten equal-weight sections; repeated dark quote interruption; no final CTA pattern | image-led editorial hero → care atlas → process → treatment pathways → portrait trust story → results → final CTA | representative |
| `/about.html` | editorial | hero, bands, definitions, sequence, quote, directory, cards | Pattern alternation feels generated rather than biographical | portrait hero → narrow introduction → asymmetric story → decision principles → clinic experience → values → final CTA | baseline |
| `/mission.html` | editorial | hero, evidence, directory, sequence, five quote/card sections | Excessive quote-band repetition | compact editorial hero → mission statement → two editorial splits → promise/process → restrained quote → final CTA | baseline |
| `/values.html` | editorial | hero plus nine unrelated value treatments | Each value receives a different template, weakening coherence | editorial hero → numbered values index → grouped value chapters → final responsibility statement | baseline |
| `/treatments.html` | service/directory | hero, search/filter, bands/cards/definitions/evidence/directory/routes | Directory categories use unrelated visual templates and section-number filtering | compact directory hero → persistent accessible filter → consistent treatment groups/details → decision guidance → final CTA | representative |
| `/care.html` | service/editorial | hero, editorial split, sequence, quote, definitions, reading, directory, cards | Long journey has repeated band/card grammar and no strong ending | image-led hero → philosophy split → care journey → before/after reading chapters → safety panel → continuity CTA | representative |
| `/skin.html` | service | hero, bands, definitions, routes, evidence, timeline, cards | Educational content appears as repeated dashboards/cards | editorial hero → skin foundation chapter → concern atlas → myth/knowledge interlude → treatment route → final CTA | baseline |
| `/laser.html` | service | hero, evidence, reading, quotes, cards, bands, sequence, directory | Too many isolated panels; technology hierarchy is weak | image-led hero → suitability statement → technology guide → treatment chapters → recovery timeline → final CTA | baseline |
| `/results.html` | service/trust | hero, definitions, bands, evidence, directory, cards, routes | Trust narrative is fragmented into generic card patterns | restrained hero → context principles → photography integrity → timing story → expectation statement → final CTA | baseline |
| `/testimonials.html` | content/trust | hero, definitions, six consecutive quote panels, routes, CTA | Six visually identical quote sections create monotony | compact hero → review source/transparency → curated testimonial sequence → trust themes → review/consultation CTA | baseline |
| `/journal.html` | content | hero and generated editorial/content patterns | Editorial index lacks clear issue/article hierarchy | editorial masthead → featured guidance → topic index → reading pathways → final consultation link | baseline |
| `/blog.html` | content | hero, featured split, search, routes/cards/bands | Search and article categories use unrelated pattern templates | editorial masthead → featured article → search/filter → consistent article grid → topic CTA | baseline |
| `/faq.html` | content/FAQ | hero and nine coloured accordion sections | Tone changes per FAQ group; no focused search/results hierarchy | compact hero/search → category nav → one accordion system → unanswered-question CTA | baseline |
| `/consultation.html` | conversion | hero, editorial, quote, sequence, cards, form, timeline, evidence, CTA | Form is visually separated from consultation narrative | conversion hero → what to expect → preparation → contained form + trust aside → next steps → final reassurance | representative |
| `/contact.html` | conversion | hero, route cards, bands, definitions, form, reading/routes | Too many pre-form sections delay the primary task | direct hero → contact routes → form/contact split → aftercare/urgent guidance → privacy note | representative pair |
| `/privacy.html` | policy | hero plus nine mixed patterns | Legal reading is broken into ornamental compositions | compact policy hero → contents nav → narrow reading sections → rights/contact panel | baseline |
| `/cookies.html` | policy | hero, statement, definitions, editorial/evidence/timeline/cards/form | Cookie choices are buried within decorative sections | compact policy hero → summary → category definitions → settings component → contact/update footer | baseline |
| `/legal.html` | policy | hero, statement, evidence, editorial/cards/timeline/quote/gateway/CTA | Policy hierarchy competes with decorative presentation | compact policy hero → contents → reading chapters → limitations callout → contact closing | baseline |
| `/accessibility.html` | policy/form | hero, cards/bands/sequence/comparison/evidence/quote/form | Accessibility content itself uses dense visual switching | compact policy hero → commitment summary → feature list → known limits → feedback form/contact | baseline |
| `/thank-you.html` | utility | hero plus nine additional sections | Confirmation page is unnecessarily long and visually diffuse | compact confirmation hero → three next steps → safety/privacy note → return links | baseline |
| `/404.html` | utility | hero plus nine additional sections | Error recovery is diluted across ten sections | compact recovery hero → three primary routes → direct contact/accessibility links | baseline |

## Pairing and language status

- All 21 pairs pass strict language/structure validation.
- `data/page-pairs.json` now maps equivalent routes explicitly rather than relying on filenames.
- English and PT shared chrome is compiled into both language outputs before delivery.
- A direct Portuguese edit remains protected through `.translation-cache.json` and translation memory.

## Representative migration gate

The first gate covers:

1. `index.html` + `pt/index.html`;
2. `treatments.html` + `pt/treatments.html`;
3. `care.html` + `pt/care.html`;
4. `contact.html` + `pt/contact.html`;
5. shared chrome, language switching, consent, forms, filters and common final CTA.

The representative pairs passed this gate; the remaining pairs were subsequently migrated and reviewed in the full 42-page capture.
