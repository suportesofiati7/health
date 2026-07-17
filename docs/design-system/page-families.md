# Page families

Page families select compositions; they do not create parallel design systems. Every family uses the same tokens, rails, component anatomy and interaction language.

```text
page opening → orientation → evidence/detail → human/trust pause → next action
```

## Family contracts

| Family | Routes | Opening | Preferred compositions | Ending |
|---|---|---|---|---|
| Home | `index.html` | image-led editorial hero | editorial split, concise route atlas, statement, trust | consultation CTA |
| About | `about`, `mission`, `values` | editorial or split hero | reading intro, portrait/media, values/process, quote pause | contextual route + consultation |
| Treatments | `treatments`, `laser`, `skin` | directory or service hero | treatment directory, filter, evidence, process, care notes | safe next-step CTA |
| Care/results | `care`, `results`, `testimonials` | compact trust-led hero | timeline, reading sections, gallery/testimonial, statement | consultation or relevant care route |
| Editorial | `blog`, `journal` | editorial index hero | article directory/search, reading cards, quote/interlude | editorial route or consultation |
| Conversion | `consultation`, `contact` | compact human hero | expectations, contact/form, reassurance, practical details | confirmation-oriented close |
| FAQ | `faq` | compact searchable hero | grouped native accordions, no-result state | contact escalation |
| Policy | `accessibility`, `cookies`, `legal`, `privacy` | compact hero | narrow reading container, clear heading/list rhythm | legal navigation/contact |
| Utility | `404`, `thank-you` | concise status hero | explanation and primary route | single clear action |

## Composition rules

- A ten-section page normally contains no more than two card grids and two conventional splits.
- Adjacent sections must differ through purpose, density or tone—not decoration alone.
- Secondary visual devices appear at two to four intentional pauses on long pages.
- Signature devices are optional and limited to one moment per page.
- Trust and action follow relevant evidence; they do not interrupt it.
- Approved content is adapted by layout, never shortened to fit a component.

## Responsive behaviour

```text
mobile (single narrative rail)
  hero copy
  essential media
  evidence/detail
  action

desktop (related content may share a rail)
  copy  |  media
  supporting evidence below or alongside when line length remains controlled
```

- At mobile widths, source order is the reading order and decorative overlap is removed.
- At tablet widths, splits use two columns only when both columns retain useful width.
- At desktop and ultrawide widths, rails remain capped; media may grow within `--container-media` but prose remains within the reading measure.
- Portuguese expansion must wrap naturally without reducing the type below the shared scale.

## Correct and incorrect examples

Correct: a treatment page opens with outcome and context, provides a scannable directory, explains process in sequence, pauses for evidence, and closes with consultation guidance.

Incorrect: ten white sections alternating left/right solely by index, with every topic presented as an equal card.

Correct: a policy page uses the same brand typography and header but a narrower, quieter reading composition.

Incorrect: policy pages inherit the homepage hero height and decorative imagery.

## Acceptance criteria

- Each public route is assigned exactly one family in `docs/rebuild/page-migration-map.md`.
- The page has a deliberate opening, progression and ending.
- No appearance depends on section order.
- The equivalent EN/PT route uses the same composition and interaction contract.
- Mobile, tablet, desktop, ultrawide and zoom checks are recorded before migration is complete.
