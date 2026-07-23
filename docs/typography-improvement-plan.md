# Franciele Sofiati website typography improvement plan

Status: planning only. This document does not authorize a redesign, structural change, route change, image replacement, form change, navigation change, or change in written meaning.

## 1. Audit scope and method

The audit covered all 42 public URLs listed in `sitemap.xml`: 16 Portuguese/English page pairs and 10 English Journal articles. It also covered the shared header, mobile menu, footer, cookie controls, forms, FAQ, buttons, breadcrumbs, floating contact tools, and virtual assistant.

The review combined:

- source review of every public HTML document and all typography-related CSS;
- computed-style checks at 360px, 390px, 430px, and 1440px;
- checks for small text, horizontal overflow, excessive heading depth, long italic passages, and unconstrained copy;
- review of Portuguese/English heading style, professional information, and number presentation;
- the existing contrast report (`qa/contrast-audit.json`), which currently records no automated failures;
- the Portuguese consistency check, which currently fails because `perguntas.html` no longer matches the English source and `tratamentos.html` has a structural mismatch. Those are existing localization/markup issues, not changes proposed by this plan.

### Current foundation

The site has the right broad idea: an editorial serif for headings and a sans serif for practical copy. The implementation is not yet controlled enough to feel consistently premium.

- `--font-heading` uses an operating-system stack, so the brand voice changes between Iowan Old Style, Baskerville, Palatino, Book Antiqua, and Georgia.
- `--font-body` names Inter but does not establish a bundled font in the audited CSS; visitors may instead see Avenir Next, Segoe UI, or a system sans.
- `--font-accent` introduces a third cursive family. Even when used sparingly, this works against the two-family limit and can push the identity toward decorative or bridal.
- There are overlapping type tokens (`--font-*` and `--type-*`) with multiple display scales. The largest reaches 7.75rem.
- Page-specific CSS frequently bypasses the tokens with one-off values and `!important`, creating inconsistent sizes and line heights.

### Principal findings

1. **The site overuses one section-heading formula.** Skin, Laser, Care, Mission, Results, Treatments, About, Values, Consultation, and Testimonials repeatedly use an uppercase eyebrow, a large serif heading, and explanatory copy. The repetition flattens meaning even though individual elements are visually large.
2. **The display scale is too wide and too aggressive.** Numerous page overrides place section headings between roughly 5rem and 6.7rem on desktop. Mobile rules still allow values near 3.35rem with line heights below 1.0.
3. **Important headings wrap awkwardly.** At 360–430px, the featured Journal title occupies five to six lines. About headings including “UMA EXPERIÊNCIA TRANQUILA E HUMANA” reach four lines and show measurable overflow in the current composition. A homepage English CTA question reaches five lines.
4. **Some desktop copy is not constrained.** Rendered paragraphs and labels reach roughly 800–1,325px on Contact, FAQ, Laser, Results, Values, and Journal surfaces. Desktop should become more spacious through layout rhythm, not through longer lines.
5. **Small typography is widespread.** Current examples include 0.6rem brand-role text, 0.66–0.7rem labels, 0.7rem scroll cues, 0.75rem breadcrumbs/captions, 0.76rem buttons, and form helper or legal copy near 0.58–0.78rem. On mobile, many rendered practical elements fall below 14px.
6. **Buttons do not match the requested voice.** The shared button is a 0.76rem uppercase serif with 0.13em tracking. It feels ornamental, reduces legibility, and makes longer actions visually noisy.
7. **Italics are overused as a premium signal.** Italics appear in the brand name, headings, oversized decorative initials, values statements, quotations, and supporting notes. Every English Journal article contains a large italic pull quote; on mobile these run approximately 6–13 lines.
8. **Quotation treatment is too dominant.** Pull quotes combine italics with large decorative quote marks, sometimes 5.8–9rem. The decoration competes with the human voice it is meant to support.
9. **Heading levels do not reliably represent visual roles.** The About page uses many H2 elements for what are visually cards or steps. The consent form uses very long H4 headings. Journal articles use H2 for article sections, author information, CTA text, and related-content headings, giving unrelated content equal weight.
10. **Cards often compress hierarchy.** Small uppercase labels, serif card headings, body copy, and metadata can sit close in scale; conversely, some card headings inherit an unnecessarily large global H3.
11. **Contact cards overflow.** The WhatsApp, Instagram, and email cards show horizontal overflow at all tested widths. Their label, description, and value need separate typographic roles and robust wrapping.
12. **Form typography is inconsistent.** The main consent form mixes oversized serif headings, uppercase section markers, labels, helper copy, privacy copy, and long consent titles across many independent sizes. Some utility copy is too small, and visible-label rules are not consistently expressed as a single component contract.
13. **Navigation is readable in its main links but weak in secondary text.** Desktop links are compact; language controls and role text are too small. Mobile links are tappable, but the two-column menu and 0.82–0.88rem type can become dense, while the mobile role line drops as low as 0.4rem at the narrowest breakpoint.
14. **Contrast needs manual confirmation despite the clean automated report.** Muted text on translucent sage, blush, image, and forest surfaces is implemented through `color-mix()` and opacity. Several inverse paragraphs use white at about 68–72% opacity. These combinations must be tested in their rendered context, not accepted solely from the token pair.
15. **Portuguese editorial quality is uneven.** Visible examples include “Analise” instead of “Análise” on Cookies and “calvíce” instead of “calvície” in the form. Source/metadata also contains unaccented forms such as “orientacao” and “maximo.” Portuguese headings sometimes retain all-caps source text, while English informational headings inconsistently mix title case and sentence case.
16. **Professional details vary by context and language.** “CRBM 6277” is generally correct, but the professional title shifts between “Biomédica,” “Biomedic,” “Esthetician,” and “Cosmetologist,” and punctuation varies among middots, vertical bars, and line breaks.
17. **The homepage contains repeated content blocks.** “Famílias de tratamentos / Áreas de cuidado” and “Nosso padrão de cuidado / Cuidado clínico com humanidade” appear more than once in the source. This is a content/implementation issue that amplifies typography repetition; resolving it is outside this typography-only scope unless the duplicate is confirmed to be unintended markup.

## 2. Typography direction

The desired voice is **quiet editorial authority**: warm enough to feel personal, precise enough to support clinical trust, and restrained enough to feel premium.

Use the serif only when the text benefits from reflection or identity: page titles, selected major section headings, short first-person statements, occasional quotations, and Franciele’s name in intentional brand moments. Use the sans for all reading, navigation, actions, forms, data, safety guidance, FAQs, captions, metadata, and legal copy.

Premium character should come from proportion, spacing, line breaks, and controlled contrast. Remove typographic signals that imitate luxury—scripts, ultra-thin weights, extreme tracking, enormous display text, decorative quotation marks, and repeated italics.

## 3. Typeface decision

Adopt exactly two self-hosted families so rendering is stable across devices:

1. **Source Serif 4** for editorial roles. Use regular 400 and medium 500, plus italic 400 only for short quotations. It is refined without feeling bridal, supports Portuguese diacritics well, and remains credible in clinical contexts.
2. **Inter** for functional roles. Use 400, 500, 600, and 700 only. It is familiar, highly readable at small sizes, and suitable for data, forms, and long articles.

If licensing or asset policy prevents these exact files, select one metrically comparable serif and one humanist sans, self-host both, and preserve the same role assignments. Do not retain `--font-accent`; map any existing accent usage to the serif.

Recommended loading:

- WOFF2 only, subset for Latin/Latin Extended;
- `font-display: swap`;
- preload only the regular body face and regular serif face;
- use real italic files rather than browser synthesis;
- set `font-synthesis: none`;
- verify ã, õ, ç, ê, é, í, ó, ú, CO₂, en/em dashes, curly quotation marks, and tabular figures.

## 4. Canonical type system

Replace the overlapping size sets with one semantic scale. Values below are targets, not permission to change layout structure.

| Role | Family / weight | Mobile 360–430px | Desktop | Line height | Measure and behavior |
|---|---|---:|---:|---:|---|
| Page title | Serif 400 | `clamp(2.35rem, 9.5vw, 3.15rem)` | `clamp(3.6rem, 5vw, 5.25rem)` | 0.98–1.04 | 12–16ch; generally no more than 3 mobile lines |
| Major section heading | Serif 400/500 | `clamp(1.9rem, 7.2vw, 2.55rem)` | `clamp(2.6rem, 3.6vw, 3.9rem)` | 1.02–1.08 | 16–22ch; 2–4 mobile lines |
| Smaller section heading | Sans 600, or serif 500 selectively | 1.35–1.6rem | 1.55–2rem | 1.15–1.25 | 24–32ch |
| Card title | Sans 600 | 1.05–1.2rem | 1.1–1.3rem | 1.25–1.35 | No forced uppercase |
| Supporting label | Sans 650/700 | 0.78–0.84rem | 0.8–0.88rem | 1.35–1.5 | Uppercase only when categorical; tracking 0.06–0.09em |
| Editorial statement | Serif 400 | 1.65–2.1rem | 2.25–3.2rem | 1.15–1.28 | 22–32ch; never routine section copy |
| Quotation | Serif 400, optional italic | 1.2–1.45rem | 1.45–1.85rem | 1.35–1.5 | 30–42ch; one emphasis device only |
| Intro / lede | Sans 400 | 1.08–1.2rem | 1.15–1.35rem | 1.55–1.68 | 45–55ch |
| Body | Sans 400 | 1rem minimum | 1.02–1.1rem | 1.6–1.75 | 58–68ch; Journal target 62–66ch |
| Caption / metadata | Sans 400/500 | 0.875rem minimum | 0.875–0.95rem | 1.45–1.6 | 45–70ch where prose |
| Button | Sans 600 | 0.95–1rem | 0.95–1rem | 1.2 | Sentence case; 2–5 words preferred |
| Form label | Sans 600 | 0.95–1rem | 0.95–1rem | 1.35 | Always visible |
| Field / placeholder | Sans 400 | 1rem minimum | 1rem | 1.4 | Placeholder lower contrast but still readable |
| Helper / privacy / validation | Sans 400/500 | 0.875rem minimum | 0.875–0.95rem | 1.5 | Never uppercase or italic |

Additional rules:

- Limit heading weights to 400/500 serif and 600 sans. Do not use thin weights.
- Use negative letter spacing only for page and major serif headings, between `-0.025em` and `-0.01em`. Remove values near `-0.075em`.
- Use `text-wrap: balance` for short H1/H2 only and `text-wrap: pretty` for longer headings and paragraphs.
- Avoid author-inserted `<br>` elements except Franciele’s intentional two-line name lockup.
- Use lining, tabular figures for durations, dates, percentages, measurements, reading time, phone numbers, and CRBM display.
- Set mobile inline gutters to at least 20px at 360px and 24px at 390–430px.

## 5. Heading and section treatment rules

Every section must have one clear entry point, but it does not need all three conventional elements.

- **Direct information:** heading + body. Default for treatment explanations, preparation, recovery, legal, and FAQ.
- **Category-led:** categorical uppercase label + concise heading. Reserve for page/treatment/article category and practical information.
- **Editorial:** short serif statement + brief supporting copy. Limit to one or two moments per page.
- **Question-led:** natural-language question in sans or restrained serif. Use for decision points and FAQ introductions.
- **First person:** a short statement from Franciele, identified by attribution. Do not italicize an entire paragraph.
- **Card/directory:** sans title + body/metadata. Do not inherit the large global H3 style.

Do not place an eyebrow above a heading when the eyebrow repeats the same noun (“Consulta estética / Consulta estética,” “Perguntas frequentes / Perguntas frequentes”). Remove the visual treatment or reclassify it in CSS/content markup while preserving the text and structure.

Use sentence case in Portuguese. In English, use sentence case for informational headings and title case only for page/article titles if adopted consistently. Brand, device, and treatment names retain their official casing.

## 6. Component plan

### Header, navigation, and footer

- Keep primary nav in sans 500/600 at 0.95rem minimum on mobile and about 0.9–1rem desktop.
- Remove uppercase serif styling from header actions. Use sentence-case labels: “Agendar uma consulta” / “Book a consultation.”
- Raise language controls to at least 0.8rem and provide adequate visible hit area without extreme tracking.
- Raise professional role text to at least 0.75rem mobile and 0.78rem desktop. Never reduce it to 0.4rem.
- On the mobile menu, use one readable link scale and the same labels as desktop. Retain current tap targets, but reduce visual density through weight and spacing rather than tiny type.
- Make footer headings sans 600 and footer links at least 0.875rem.

### Buttons and links

- Change all action typography to sans 600, 0.95–1rem, sentence case, tracking 0–0.015em.
- Standardize the action vocabulary per language. Preferred Portuguese set: “Agendar uma consulta,” “Conhecer os tratamentos,” “Falar com a clínica,” “Ver detalhes,” “Saiba como funciona,” “Ler o artigo,” “Voltar,” “Enviar mensagem.”
- Use the equivalent concise English set consistently; do not translate word for word when the result is long.
- Keep one primary action per decision point. Secondary and quiet actions use the same typography, not a smaller size.
- Allow a button to wrap to two lines only when localization makes this unavoidable; never shrink text to force one line.

### Forms

- Build one contract for label, field, placeholder, helper, validation, consent, and confirmation text.
- Keep visible labels above every field. Placeholder text supplies an example, never the field name.
- Use 1rem inputs to prevent mobile zoom and improve scanning.
- Use 0.875rem minimum for file guidance, privacy, and legal notes.
- Use a clear sans 600 step/section title rather than oversized serif type for operational form sections.
- Convert very long consent H4 text visually into a treatment name plus normal-weight explanatory text without changing its meaning or DOM order.
- Error pattern: “Não foi possível enviar. Revise os campos indicados.” Field errors state what is needed without blame.
- Success and privacy messages remain normal body text, not uppercase labels.

### FAQ

- Questions: sans 600, 1–1.1rem mobile and 1.05–1.2rem desktop, line-height 1.35, with at least a 44px tap target.
- Answers: normal body style, 58–68ch, left aligned, with 1.6–1.7 line height.
- Category headings should be smaller than page/major section headings.
- Remove quotation styling from answers and avoid a decorative hero treatment on this practical page.
- Reconcile `perguntas.html` with the English source before typographic parity testing; do not redesign its structure during that repair.

### Quotations and testimonials

- Use no more than one principal quotation per standard page and no more than two in a long article.
- Use upright serif by default. Italic is optional only for short quotations under roughly 35 words.
- Remove oversized decorative quote marks; a subtle rule or small glyph is sufficient.
- Attribution uses sans 600, sentence case, at least 0.875rem. Do not add tracking and uppercase simultaneously.
- Patient testimonials remain visually distinct from Franciele’s authored statements.

### Image captions and overlays

- Default to text outside the image. Preserve current image and section structure.
- Where overlay text already exists, constrain it to a calm image zone and verify it does not cross Franciele’s face, equipment details, or high-frequency backgrounds at every responsive crop.
- Use one solid/translucent local backing surface when contrast requires it. Do not add global dark overlays or text shadows.
- Captions use 0.875rem minimum and clearly separate description, credit, and professional information.

### Chatbot, cookie controls, and floating tools

- Raise chatbot options, messages, input, invitation, and cookie details to at least 0.875rem; inputs remain 1rem.
- Use sans throughout these utilities. A small serif title is acceptable only for “Franciele” or the assistant name.
- Avoid uppercase microcopy in floating buttons and preserve concise accessible names.

## 7. Page-family actions

### Homepage

Priority: high.

- Keep “Franciele Sofiati” as the primary brand moment, but remove the uppercase subline treatment if it competes with the name.
- Reduce the number of large serif section headings. Use sans titles for treatment families, criteria, principles, results factors, and FAQ.
- Cap major mobile headings at about 2.55rem and 3–4 lines.
- Replace repeated eyebrow treatments with direct headings where the category is already obvious.
- Verify whether the duplicated treatment-family and care-standard blocks are intentionally rendered. Do not remove them as part of typography work without separate approval.
- Keep body/card copy at 1rem mobile; current card copy near 0.9–0.95rem is too subdued.

### About, Mission, Values, and Testimonials

Priority: high.

- About: fix the overflowing “How I make recommendations” and “A calm, human experience / Uma experiência tranquila e humana” compositions by reducing the heading role and removing forced all caps, not by narrowing the column further.
- Use first-person statements selectively so Franciele’s voice is specific rather than slogan-like.
- Reclassify many About H2 card/step titles as the smaller section or card-title visual role.
- Mission and Values: limit oversized serif numerals, initials, and italics to one controlled motif per page.
- Testimonials: create a stable hierarchy of source/platform, quotation, patient context, and transparency note. Remove the duplicate “Respeitosa / Respectful” item if separately approved as content cleanup; typography alone should not hide it.

### Treatments, Laser, Skin, Care, Results, and Consultation

Priority: high.

- Use the serif for the page title and at most selected major section headings.
- Render treatment names, device names, preparation, recovery, limitations, and technology details in sans.
- Establish the repeated treatment information order visually: treatment name → concern → explanation → preparation → recovery → limitations → technology → consultation action.
- Safety and recovery notes use a 1rem sans body, 600 lead-in, a left rule or subtle surface, and sufficient spacing. Do not use red uppercase banners.
- Replace repeated all-caps eyebrows with practical sans labels only where they clarify category or phase.
- Results: reduce giant decorative italic numerals/marks and constrain result-context paragraphs to the body measure.
- Consultation: remove duplicated eyebrow/title pairs and make the practical journey steps scannable in sans.
- Contact method cards: separate channel label, action description, and contact value; apply `overflow-wrap: anywhere` to email/handle values and remove the current internal overflow.

### Journal index

Priority: critical.

- Keep “Journal” as the page title.
- Reduce the featured article title from the current 5–6 mobile lines to a target of 3–4 lines using the major-section scale and a wider usable measure—not a tiny font.
- Use category and reading time as quiet sans metadata, 0.875rem minimum.
- Use sans 600 article-card titles if multiple titles compete in the same view; reserve serif for the feature and selected lead stories.
- Keep summaries at normal body scale and 45–60ch. Do not concatenate title and summary into one heading’s accessible/rendered text.
- Avoid centering summaries and article lists.

### Journal articles

Priority: critical.

- Keep title, dek, category, publication/reading metadata, and body as a distinct article system rather than treatment-landing styles.
- Reading column: 62–66ch, left aligned; body 1.0625–1.125rem desktop and 1rem mobile; line height 1.68–1.76.
- Article H2: serif or sans according to context, 1.65–2.2rem, never the global 3–5rem section scale. Article H3: sans 600, 1.2–1.45rem.
- Restyle “At a glance,” author, questions, CTA, and related articles as distinct functional modules; they should not all be H2-sized.
- Remove the repeated large italic pull quote from every article. Retain only when the quote adds a distinct human insight; otherwise present the passage as normal prose or an upright serif note.
- Captions and reading metadata use 0.875–0.95rem. Related-article titles must remain readable and separate from “Read next.”

### FAQ, Contact, Forms, Cookies, 404, and thank-you

Priority: medium to high.

- FAQ follows the practical accordion contract above.
- Contact uses restrained page-title typography; direct contact values must wrap safely and remain at least 1rem.
- Forms use functional sans hierarchy and readable privacy text; the page title may remain serif.
- Cookies/legal content uses a 68–75ch left-aligned column, sans body, visible H2/H3, and numbered clauses where the existing content already supports them.
- 404 and thank-you pages use concise titles and normal action typography; no oversized decorative display treatment is necessary.

## 8. Language, numbers, and professional style

Create a bilingual editorial checklist and apply it without changing meaning:

- Portuguese headings use sentence case: “Tecnologias utilizadas na prática,” not English-style capitalization.
- English informational headings also use sentence case; reserve title case for article/page titles if the editorial policy adopts it.
- Correct diacritics and spelling in visible copy and metadata, including “Análise,” “calvície,” “orientação,” and “máximo.”
- Use Brazilian curly double quotation marks consistently in Portuguese (`“…”`) and English curly quotation marks in English; avoid mixing straight quotes with decorative CSS marks.
- Keep `Franciele Sofiati · Biomédica · CRBM 6277` as the canonical short professional line in Portuguese. Agree on one accurate English credential line; do not translate a regulated Brazilian title ambiguously.
- Use `CRBM 6277` without punctuation changes or broken line wraps.
- Portuguese decimal comma and thousands point where applicable; English decimal point and thousands comma.
- Durations: `45 min`, `2–3 dias`; English `45 min`, `2–3 days`.
- Dates: `23 de julho de 2026`; English `23 July 2026` (or one agreed English convention).
- Percentages retain a nonbreaking space only if the editorial standard requires it consistently; measurements always keep value and unit together.
- Reading time: `6 min de leitura` / `6 min read`, not multiple competing formats.
- Keep CO₂ with the proper subscript and use nonbreaking joins where a treatment/device name must stay together.

## 9. Implementation sequence

### Phase 1 — Consolidate foundations

1. Self-host the two approved families.
2. Remove the cursive accent family.
3. Replace overlapping size variables with the semantic roles in this plan.
4. Add canonical measures, line heights, tracking, numeric, and wrap rules.
5. Preserve the existing HTML and page structure.

Exit condition: shared sample components render with the same families and roles in both languages.

### Phase 2 — Repair shared components

1. Header, desktop/mobile navigation, footer.
2. Buttons and text links.
3. Form controls, labels, helper/legal text, validation.
4. Eyebrows, cards, quotes, captions, breadcrumbs.
5. Cookie controls, chatbot, floating tools.

Exit condition: no shared practical text below 0.875rem, no uppercase serif buttons, and no third family.

### Phase 3 — Page-family application

1. Journal index and articles.
2. Homepage.
3. About/Mission/Values/Testimonials.
4. Treatments/Laser/Skin/Care/Results/Consultation.
5. FAQ/Contact/Forms/Legal/utility pages.

Apply semantic classes/tokens; do not create new page-specific scales unless a documented role is genuinely missing.

Exit condition: every visible text element maps to one semantic role.

### Phase 4 — Bilingual editorial pass

Review each Portuguese/English pair together for title length, case, punctuation, accents, abbreviations, professional details, and button equivalence. Fix translation validation separately where markup parity is already broken.

Exit condition: neither language is treated as a resized version of the other; both fit naturally without changing meaning.

### Phase 5 — Responsive and accessibility QA

Test at 360, 390, 430, 768, 1024, 1280, and 1440px, plus 200% browser zoom and text-only zoom where available.

Exit condition: all acceptance criteria below pass.

## 10. Acceptance criteria

### Mobile

- No horizontal text overflow at 360–430px, including emails, handles, device names, and professional information.
- H1 is normally 1–3 lines; an exceptional long page/article title may use 4.
- Major H2 is no more than 4 lines in its intended column.
- No heading breaks into repeated one-word lines.
- Body, field, and answer text is at least 16px; captions/helper/legal text is at least 14px.
- Body line height is at least 1.6; headings do not use line height below 0.98.
- Text remains at least 20px from the viewport edge at 360px.
- Buttons remain readable in sentence case and retain a 44px minimum target.
- No long centered paragraph and no italic passage longer than roughly 4 lines.

### Desktop

- Standard prose stays within 58–68ch; legal text may reach 75ch.
- Journal body stays within 62–66ch and is left aligned.
- Major headings do not exceed 5.25rem and do not create avoidable empty vertical areas.
- No practical label, caption, or button is reduced merely to fit one line.
- Heading/image relationships remain stable without placing copy over faces, equipment details, or busy backgrounds.

### System consistency

- Exactly two primary families are loaded and used.
- Each text element maps to one documented semantic role.
- Uppercase labels appear only for genuine categories/context and use no more than 0.09em tracking.
- Serif, italics, and quotations are selective rather than routine.
- Buttons use a consistent concise vocabulary and typography.
- Forms have visible labels and readable helper, privacy, error, and confirmation text.
- Safety/recovery information is prominent but calm.
- Contrast is at least WCAG AA: 4.5:1 for normal text and 3:1 for large text and meaningful UI graphics.
- Portuguese/English capitalization and punctuation are internally consistent.
- CRBM, dates, durations, percentages, measurements, and reading time follow the agreed locale rules.

## 11. Final review checklist

- [ ] All 42 sitemap URLs reviewed at mobile and desktop widths.
- [ ] Mobile headings wrap naturally without overflow or one-word stacking.
- [ ] No body, button, form, legal, caption, or utility text is too small.
- [ ] Paragraph and article measures are controlled.
- [ ] Serif appears only in approved editorial roles.
- [ ] Sans remains the default for reading and practical information.
- [ ] Eyebrows are not repeated above every heading.
- [ ] No decorative/cursive third family remains.
- [ ] Italics and quotations are not repeated mechanically.
- [ ] Button labels are concise, sentence case, and consistent by language.
- [ ] Form labels remain visible; helper and privacy text are readable.
- [ ] FAQ questions scan and tap comfortably.
- [ ] Treatment preparation, recovery, limitations, and safety are distinct.
- [ ] Journal pages read like articles, not treatment landing pages.
- [ ] Legal text remains practical, left aligned, and comfortably wide.
- [ ] Portuguese accents, casing, punctuation, and professional terms are correct.
- [ ] English wording and case fit naturally at mobile widths.
- [ ] Professional information and number formatting are consistent.
- [ ] Typography works with every responsive image crop.
- [ ] Contrast is manually verified on translucent, image, blush, sage, and forest surfaces.
- [ ] No routes, page structure, image collection, forms, navigation structure, or written meaning changed.

