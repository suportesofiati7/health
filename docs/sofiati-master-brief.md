Sofiati Content Architecture Brief — Premium Picture-Heavy Storytelling, SEO, Internal Linking, Anti-Template Rules and Page-by-Page Section Prompts

Main objective



Build a comprehensive, premium, picture-heavy website system for Franciele Sofiati across all Sofiati concepts.



The content goals must stay consistent across all concepts.



The design, layout, section order, image rhythm, page flow, CSS, animation, visual hierarchy and storytelling structure must be different across concepts.



This is not one website recoloured 50 times.



This is one professional brand expressed through 50 different premium website concepts.



Same brand.

Same page list.

Same ethical rules.

Same core information.

Different visual storytelling.

Different page flows.

Different section layouts.

Different design systems.



Core site message



Franciele Sofiati offers advanced aesthetic biomedicine, laser and skin care in Londrina, PR.



Care begins with professional evaluation.



The website must educate, guide and reassure visitors before they request evaluation.



The site must not promise results, diagnose visitors, invent testimonials or imply that a treatment is suitable without assessment.



The tone must be:



premium

calm

elegant

expert

ethical

visual

concise

professional

patient-focused

conversion-focused without pressure

Anti-template instruction



Do not use the page-by-page section lists as one fixed template.



The section prompts below define what each page must cover.



They do not define one fixed layout or one fixed order for every concept.



For each concept, Codex must create a separate page flow map and decide how the sections are ordered, combined, split or visually expressed.



A concept fails if it uses the same:



section order

hero layout

card grid

CTA style

image placement

page rhythm

footer structure

service page structure

blog/journal layout

CSS component system

mobile layout

section silhouette



Changing colours is not enough.



Changing images is not enough.



Changing text is not enough.



The content purpose may repeat.



The visual storytelling must not repeat.Required planning before coding



Before building a concept, create:



concepts/01-inspire/design-dna.md

concepts/01-inspire/page-flow-map.md

concepts/01-inspire/internal-link-map.md

concepts/01-inspire/asset-plan.md



Repeat for every concept.



design-dna.md must define

concept mood

page rhythm

visual storytelling style

image style

section architecture

card system

CTA system

footer style

header style

mobile layout style

animation style

background system

border/radius system

what this concept must not look like

which other concepts it risks resembling

page-flow-map.md must define



For every page:



page purpose

search intent

section count

section order

layout type per section

image role per section

CTA role per section

internal links per section

what makes this page different from the same page in other concepts

internal-link-map.md must define



For every page:



required internal links

section where each link appears

anchor text

reason for link

whether link supports SEO, conversion or trust

asset-plan.md must define



For every page:



image needed

image purpose

AI image prompt

alt text

filename

concept-specific style

where the image appears

whether the image is decorative or content-supporting



Do not code before these planning files exist.



3. Image-heavy storytelling rules



The site must not be text-heavy.



Most pages should use images in at least 60–75% of major sections.



Images should support the story, not fill space.



Use:



professional portrait placeholders

botanical luxury visuals

sage and ivory abstract textures

laser-light abstract images

macro skin texture visuals

consultation desk scenes

treatment-room inspired visuals

hands with notes

paper, linen, botanical and bronze details

article thumbnails

process illustrations

soft clinical-luxury backgrounds



Avoid:



fake before-and-after images

fake patient procedure images

graphic procedure photos

unrealistic airbrushed skin

hospital-blue generic imagery

pink beauty salon imagery

cheap stock photos

plastic surgery cliché imagery

repeated leaf watermark across concepts

AI asset rule



AI-generated placeholder images are acceptable for now.



Each concept must have its own assets:



concepts/01-inspire/assets/ai/

concepts/02-empower/assets/ai/

concepts/03-enhance/assets/ai/

...



Do not reuse the same asset kit across all concepts.



Every image needs:



descriptive filename

alt text

concept-specific prompt

responsive sizes

compression

visual connection to the page section



Example image prompt format:



Concept: Lumin

Page: Laser

Section: Suitability First

Prompt: Abstract laser-light composition on ivory and sage surfaces, luminous clinical luxury, soft champagne glow, elegant editorial composition, no patient, no procedure, no before-and-after, no hospital-blue palette.

4. SEO rules



Every page must have:



unique title tag

unique meta description

one H1

logical H2/H3 structure

clear search intent

image alt text

descriptive internal links

schema where appropriate

short expert copy

clear CTA

crawlable links

Title format

Page Topic | Franciele Sofiati



Examples:



Laser Care in Londrina | Franciele Sofiati

Skin Care Guidance | Franciele Sofiati

Professional Evaluation | Franciele Sofiati

Meta description rule



Each meta description should be:



unique

human-written

around 140–160 characters

relevant to the page

not stuffed with keywords

careful and ethical

Schema rule



Use JSON-LD where appropriate.



Global schema:



WebSite

Person

ProfessionalService

BreadcrumbList



Page-specific schema:



WebPage

AboutPage

ContactPage

FAQPage

CollectionPage

BlogPosting

Article

PrivacyPolicy where appropriate



Do not add fake reviews.



Do not add fake ratings.



Do not add fake testimonials.



Do not add full street address unless approved.



Use Londrina, PR only.



5. Global content rules

Text length



Keep copy concise.



Recommended limits:



hero eyebrow: max 8 words

hero H1: max 14 words

hero paragraph: max 35 words

section paragraph: max 45 words

card title: max 7 words

card description: max 25 words

FAQ answer: max 70 words

footer description: max 25 words

button text: max 4 words

H1-H6 hierarchy



Use:



one H1 per page

H2 for main sections

H3 for cards and subsections

H4 only for deeper FAQ/legal groups



Do not skip heading levels.



Do not use headings only for styling.



The page outline must make sense without CSS.



Ethical language



Use:



professional evaluation

individual assessment

personalised care

suitability depends on evaluation

results may vary

guided by professional criteria

protocol depends on individual needs

aftercare matters

responsible expectations

educational information

care with precision

skin quality

natural-looking care



Avoid:



guaranteed results

perfect skin

miracle treatment

painless guarantee

instant transformation

definitive result

works for everyone

risk-free

best in Brazil

fake testimonials

fake before-and-after claims

invented patient cases

diagnosis through website copy

6. Section comments and audit attributes



Every section must include an HTML comment.



Example:



<!-- Section 01: Hero — introduces the page topic, establishes trust and gives one clear next step. -->



Every section must also include audit attributes:



<section

  data-section-id="home-01-hero"

  data-section-type="hero"

  data-content-module="brand-introduction"

  data-layout-signature="split-portrait-hero"

  data-visual-role="professional-introduction"

>



Required attributes:



data-section-id

data-section-type

data-content-module

data-layout-signature

data-visual-role



Do not use generic layout signatures like:



section

grid

content

cards

block



Use specific layout signatures like:



split-portrait-hero

editorial-image-chapter

horizontal-care-journey

full-bleed-botanical-divider

asymmetric-laser-panel

radial-results-map

magazine-article-grid

contact-card-overlap

minimal-legal-ledger



No two concepts should reuse the same page-level section signature sequence.



7. Internal linking strategy



Internal links must be placed naturally inside sections.



Do not dump all links at the bottom.



Do not use generic anchor text like “click here”.



Use descriptive links.



Home must link to

About from the professional/profile section

Care from the care paths section

Laser from the laser preview

Skin from the skin preview

Results from the results responsibility section

Values from the values section

Mission from the brand philosophy section if used

FAQ from the questions preview

Journal from the education preview

Blog from the education preview

Consultation from hero and CTA sections

Contact from contact preview

About must link to

Mission from philosophy/purpose section

Values from principles section

Care from approach section

Laser from areas of focus

Skin from areas of focus

Results from expectations section

Consultation from CTA

Contact from contact preview

Care must link to

Consultation from evaluation/process sections

Laser from related care paths

Skin from related care paths

Results from expectation/aftercare sections

FAQ from care questions

Journal from education sections

Blog from aftercare or education sections

Laser must link to

Consultation from hero, suitability and CTA

Care from evaluation/process sections

Skin from related skin quality section

Results from results-may-vary section

FAQ from laser questions

Journal from education sections

Blog from laser education sections

Skin must link to

Consultation from hero and CTA

Care from pathway section

Laser from related care section

Results from expectation section

FAQ from skin questions

Journal from education sections

Blog from skin education sections

Values from natural-looking care section

Results must link to

Consultation from hero and CTA

Care from what influences results

Laser from related care section

Skin from related care section

Testimonials from approved feedback section

FAQ from results questions

Legal from responsibility section

Privacy from consent/before-and-after section

Consultation must link to

Care from what consultation clarifies

Laser from treatment interest section

Skin from treatment interest section

Results from expectation section

FAQ from first-visit questions

Privacy from form/privacy note

Contact from alternatives section

Contact must link to

Consultation from first-step section

FAQ from practical questions

Privacy from form/privacy note

Accessibility from support/access section

Legal from responsible reminder

Mission must link to

About

Values

Care

Consultation

Journal

Values must link to

About

Mission

Care

Results

Consultation

Testimonials must link to

Results

Privacy

Consultation

FAQ

FAQ must link to

Care

Laser

Skin

Results

Consultation

Contact

Privacy

Journal must link to

Care

Laser

Skin

Results

Blog

Consultation

Blog must link to

Care

Laser

Skin

Results

Journal

Consultation

Legal must link to

Privacy

Cookies

Accessibility

Contact

Privacy must link to

Legal

Cookies

Contact

Consultation

Cookies must link to

Privacy

Legal

Contact

Accessibility must link to

Contact

Legal

Privacy

Sitemap

Sitemap must link to

every main page

every brand/trust page

every legal page

Consultation

Contact

8. Page-by-page content architecture



Important: the sections below are content modules and prompts.



Do not use the same order in every concept.



For each concept, create a unique page flow.



HOME PAGE

Target section count



10–14 sections.



Home should be the largest and most visually impressive page.



Search intent



Visitors want to know who Franciele is, what she offers, whether they can trust her and where to begin.



Required content modules

brand introduction

professional evaluation

trust signals

care paths

Franciele profile preview

care journey

laser preview

skin preview

results responsibility

values/trust

education preview

FAQ preview

consultation CTA

contact route Global duplicate layout audit



Create:



audit/reports/global-duplicate-layout-audit.md



Compare all concepts for:



repeated hero layouts

repeated section orders

repeated service page structures

repeated card grids

repeated footer layouts

repeated CTA blocks

repeated mobile menus

repeated image crops

repeated CSS component systems

repeated article grids

repeated legal page layouts



If duplicates are found, mark them as failures.



Do not mark the project complete until duplicates are fixed. Redo until all goals are achieved here is the PAGES AND THEIR SECTIONS  
# GLOBAL RULE FOR ALL 50 CONCEPTS

Every concept must use the same professional facts, same core message, same page structure and same finished copy meaning.

However, each concept must build the pages differently.

Do not clone the same layout.

Do not reuse the same hero structure.

Do not reuse the same footer composition.

Do not reuse the same card grid.

Do not reuse the same section order exactly.

Do not reuse the same spacing rhythm.

Do not reuse the same image crop logic.

Do not reuse the same CSS component system.

The content below is the canonical content library.

Each concept must transform this content into a different visual build.

For each section, Codex must write:

* HTML section comment
* section class
* data-section-id
* data-section-type
* data-layout-signature
* image prompt
* alt text
* eyebrow where useful
* heading
* body copy
* cards/items/steps/FAQs where required
* CTA text
* internal links

---

# GLOBAL CONTACT CONTENT

Use these exact details wherever contact information appears:

Franciele Sofiati
Advanced Aesthetic Biomedicine
CRBM 6277
Londrina, PR
WhatsApp: (43) 9 9104-3536
WhatsApp link: https://wa.me/5543991043536
Email: [sofiatimendonca@gmail.com](mailto:sofiatimendonca@gmail.com)
Instagram: @fransofiati_biomedica
Instagram link: https://www.instagram.com/fransofiati_biomedica/

Do not add a full street address.

Do not invent clinic details.

Do not invent testimonials.

Do not invent before-and-after results.

---

# GLOBAL CTA TEXT BANK

Use these CTAs naturally across pages:

Primary CTAs:

Request evaluation
Begin with evaluation
Send a consultation request
Contact Franciele
Start with professional guidance

Secondary CTAs:

Explore care
Explore laser care
Explore skin guidance
Understand results
Meet Franciele
Read common questions
View consultation details

Avoid generic repeated “Learn more” everywhere.

---

# GLOBAL IMAGE STYLE

Use picture-heavy sections.

Every page must feel visual, calm and premium.

Preferred visual language:

* botanical clinical luxury
* sage, ivory, cream and champagne tones
* refined treatment-room atmosphere
* soft natural light
* professional portrait placeholders
* skin texture macros
* consultation notes
* abstract laser light
* botanical shadows
* editorial still-life compositions
* clean clinical surfaces
* refined paper and linen textures

Avoid:

* cheap beauty salon visuals
* hospital-blue stock images
* plastic surgery clichés
* fake procedure photos
* fake before-and-after images
* unrealistic airbrushed skin
* repeated leaf watermark across all pages
* generic AI faces repeated everywhere

---

# GLOBAL ETHICAL COPY RULE

Use careful, professional language.

Every service-related page must make it clear that suitability depends on professional evaluation.

Use:

Results may vary.
Care should begin with evaluation.
Suitability depends on individual assessment.
Protocols are defined according to professional indication.
This website is educational and does not replace individual evaluation.

Avoid:

Guaranteed result
Perfect skin
Painless
Permanent promise
Best treatment
Works for everyone
Immediate transformation
Risk-free
Miracle
Definitive result

---

# HOME PAGE

## SEO title

Advanced Aesthetic Biomedicine in Londrina | Franciele Sofiati

## Meta description

Laser and skin care in Londrina, PR, guided by professional evaluation, personalised protocols and responsible aesthetic guidance.

## H1

Laser and skin care guided by professional evaluation

---

## HOME SECTION 01 — Hero

HTML comment:

```html
<!-- HOME 01: Hero — introduce Sofiati as evaluation-led laser and skin care in Londrina with a calm premium first impression. -->
```

Data attributes:

```html
data-section-id="home-hero"
data-section-type="hero"
data-content-module="evaluation-led-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="primary-brand-story"
```

Image prompt:

Premium editorial hero for advanced aesthetic biomedicine, sage and ivory palette, refined botanical clinical luxury, soft natural light, calm consultation atmosphere, elegant professional presence, no procedure photo, no before-and-after.

Alt text:

Elegant Sofiati visual introducing evaluation-led laser and skin care in Londrina.

Eyebrow:

Franciele Sofiati · Advanced Aesthetic Biomedicine · Londrina, PR

Heading:

Laser and skin care guided by professional evaluation

Body copy:

Advanced aesthetic biomedicine for people who want clear guidance before choosing a care path. Every protocol begins with understanding your skin, your goals and what may be suitable for you.

Primary CTA:

Request evaluation

Secondary CTA:

Explore care

Internal links:

* /consultation/
* /care/
* /about/

Build variation instruction:

Across the 50 concepts, this hero must not repeat the same structure. Use a different hero pattern per concept: split portrait, oversized editorial image, vertical magazine cover, soft card overlay, asymmetric image wall, full-bleed calm visual, framed clinical still life, quiet luxury landing panel, or layered botanical composition.

---

## HOME SECTION 02 — Professional Trust Strip

HTML comment:

```html
<!-- HOME 02: Trust Strip — present essential professional context without making the header or hero feel crowded. -->
```

Data attributes:

```html
data-section-id="home-trust-strip"
data-section-type="trust"
data-content-module="professional-credentials"
data-layout-signature="unique-per-concept"
data-visual-role="quick-credibility"
```

Image prompt:

Minimal premium trust-detail composition with sage background, ivory cards, bronze dividers and refined clinical typography.

Alt text:

Professional trust details for Franciele Sofiati.

Eyebrow:

Professional context

Heading:

Clear care begins with professional criteria

Body copy:

Franciele Sofiati works with advanced aesthetic biomedicine, laser care and skin guidance in Londrina, PR.

Items:

* Franciele Sofiati
* Advanced Aesthetic Biomedicine
* CRBM 6277
* Londrina, PR

Internal links:

* /about/
* /values/
* /contact/

Build variation instruction:

In some concepts this can be a narrow strip, in others a floating card, stamp-style credential panel, vertical sidebar, scrolling marquee-style trust line, or quiet editorial label block.

---

## HOME SECTION 03 — Evaluation First

HTML comment:

```html
<!-- HOME 03: Evaluation First — explain that care begins with assessment, not assumptions or pressure. -->
```

Data attributes:

```html
data-section-id="home-evaluation-first"
data-section-type="education"
data-content-module="evaluation-first"
data-layout-signature="unique-per-concept"
data-visual-role="care-philosophy"
```

Image prompt:

Close-up of consultation notes on ivory paper, sage botanical shadow, bronze pen, soft clinical-luxury lighting, calm premium aesthetic.

Alt text:

Consultation notes representing professional evaluation before aesthetic care.

Eyebrow:

Evaluation first

Heading:

Care begins with understanding

Body copy:

Before any protocol is suggested, your skin, goals, history and suitability need to be understood with professional attention. Evaluation helps transform interest into a responsible care path.

Cards:

1. Understand your skin
   Care should begin with careful observation, not assumptions.

2. Clarify your goals
   The best next step depends on what you want to improve and why.

3. Indicate responsibly
   A protocol should follow professional evaluation, not pressure.

CTA:

Begin with evaluation

Internal links:

* /consultation/
* /faq/
* /care/

Build variation instruction:

This section can become a three-card explanation, a large image with side notes, a calm numbered sequence, a consultation notebook layout, or a horizontal editorial panel. Do not repeat the same card grid in all concepts.

---

## HOME SECTION 04 — Main Care Paths

HTML comment:

```html
<!-- HOME 04: Care Paths — guide visitors toward the three main service areas without overwhelming them. -->
```

Data attributes:

```html
data-section-id="home-care-paths"
data-section-type="navigation"
data-content-module="care-laser-skin-paths"
data-layout-signature="unique-per-concept"
data-visual-role="service-direction"
```

Image prompt:

Three premium editorial visual cards for care, laser and skin, sage ivory palette, botanical clinical luxury, soft shadows, elegant skin texture and abstract laser detail.

Alt text:

Visual cards introducing care, laser and skin paths.

Eyebrow:

Care paths

Heading:

Choose the path that fits your question

Body copy:

Explore the main areas of care, then request evaluation to understand what may be suitable for your skin, goals and expectations.

Cards:

1. Care
   A personalised path from assessment to aftercare.
   Link: /care/

2. Laser
   Technology-led care guided by professional indication.
   Link: /laser/

3. Skin
   Skin quality guidance for texture, comfort and luminosity.
   Link: /skin/

CTA:

Explore care paths

Internal links:

* /care/
* /laser/
* /skin/

Build variation instruction:

Never use the same three equal cards in every concept. Rotate between image tiles, editorial columns, overlapping panels, vertical story cards, split service bands, mosaic blocks, and horizontal service journeys.

---

## HOME SECTION 05 — Professional Profile Preview

HTML comment:

```html
<!-- HOME 05: Professional Preview — introduce Franciele as the professional behind the care and invite users to the About page. -->
```

Data attributes:

```html
data-section-id="home-professional-preview"
data-section-type="profile"
data-content-module="franciele-preview"
data-layout-signature="unique-per-concept"
data-visual-role="human-trust"
```

Image prompt:

Elegant professional portrait placeholder for Franciele Sofiati, sage and ivory palette, botanical clinical background, soft editorial lighting, calm confident expression.

Alt text:

Portrait-style visual representing Franciele Sofiati.

Eyebrow:

The professional behind the care

Heading:

Care with professional presence

Body copy:

Franciele Sofiati brings a calm, evaluation-led approach to aesthetic biomedicine, laser care and skin guidance. Her work is shaped by professional criteria, clear communication and responsible expectations.

CTA:

Meet Franciele

Internal links:

* /about/
* /mission/
* /values/

Build variation instruction:

Each concept must place the professional presence differently: portrait hero inset, about preview card, signature panel, consultation-side portrait, editorial interview block, mobile menu avatar, or footer identity feature.

---

## HOME SECTION 06 — Care Journey

HTML comment:

```html
<!-- HOME 06: Care Journey — show the process from first contact to aftercare in a clear and reassuring way. -->
```

Data attributes:

```html
data-section-id="home-care-journey"
data-section-type="process"
data-content-module="care-journey"
data-layout-signature="unique-per-concept"
data-visual-role="decision-clarity"
```

Image prompt:

Elegant step-by-step consultation journey graphic in sage, ivory and champagne tones, minimal clinical luxury, refined icons, no cartoon style.

Alt text:

Visual care journey from evaluation to aftercare.

Eyebrow:

How the process works

Heading:

A simple path to responsible care

Body copy:

The process is designed to make decisions clearer before any care path is chosen.

Steps:

1. Request evaluation
2. Share your goals
3. Receive professional assessment
4. Discuss suitable indications
5. Follow protocol guidance
6. Continue with aftercare

CTA:

View consultation details

Internal links:

* /consultation/
* /care/
* /results/

Build variation instruction:

Use different process layouts across concepts: vertical timeline, circular pathway, editorial checklist, horizontal stepper, stacked cards, image-led journey, or quiet numbered notes.

---

## HOME SECTION 07 — Laser Preview

HTML comment:

```html
<!-- HOME 07: Laser Preview — introduce laser care carefully and ethically without promising outcomes. -->
```

Data attributes:

```html
data-section-id="home-laser-preview"
data-section-type="service-preview"
data-content-module="laser-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="technology-care"
```

Image prompt:

Abstract soft laser-light lines across ivory and sage surfaces, champagne glow, premium clinical aesthetic, no patient, no procedure.

Alt text:

Abstract laser-light visual for professional laser care.

Eyebrow:

Laser care

Heading:

Technology guided by professional indication

Body copy:

Laser care should consider skin characteristics, goals, preparation and aftercare. Evaluation helps define whether a protocol may be suitable.

Cards:

1. Suitability first
   Not every protocol suits every person.

2. Preparation matters
   Guidance before sessions supports responsible planning.

3. Aftercare supports the process
   Follow-up instructions help protect the care journey.

CTA:

Explore laser care

Internal links:

* /laser/
* /results/
* /faq/

Build variation instruction:

Do not make every laser preview a standard text-left/image-right block. Use abstract light bands, technical cards, layered glass panels, editorial explainers, or dark-sage technology sections depending on the concept.

---

## HOME SECTION 08 — Skin Preview

HTML comment:

```html
<!-- HOME 08: Skin Preview — introduce skin quality care through education, evaluation and professional guidance. -->
```

Data attributes:

```html
data-section-id="home-skin-preview"
data-section-type="service-preview"
data-content-module="skin-guidance"
data-layout-signature="unique-per-concept"
data-visual-role="skin-quality"
```

Image prompt:

Macro skincare texture in cream, sage and eucalyptus tones, botanical detail, refined editorial skincare image, soft premium light.

Alt text:

Macro skincare texture representing skin quality guidance.

Eyebrow:

Skin quality

Heading:

Skin care with guidance, not guesswork

Body copy:

Skin care can involve texture, luminosity, sensitivity, cleansing and daily habits. The right path depends on evaluation and professional indication.

Cards:

1. Texture
   Understanding what affects the surface of the skin.

2. Luminosity
   Supporting a healthier-looking appearance responsibly.

3. Guidance
   Aligning professional care and daily routines.

CTA:

Explore skin guidance

Internal links:

* /skin/
* /journal/
* /blog/

Build variation instruction:

Use varied visual treatments: macro image with floating notes, soft tiles, skin texture moodboard, vertical topic cards, editorial article preview, or calm educational panel.

---

## HOME SECTION 09 — Results Responsibility

HTML comment:

```html
<!-- HOME 09: Results Responsibility — set realistic expectations before visitors explore outcomes or testimonials. -->
```

Data attributes:

```html
data-section-id="home-results-responsibility"
data-section-type="expectations"
data-content-module="responsible-results"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-trust"
```

Image prompt:

Abstract progress visual with layered translucent cards, sage and ivory palette, subtle champagne lines, no before-and-after imagery.

Alt text:

Abstract visual representing responsible aesthetic progress.

Eyebrow:

Responsible expectations

Heading:

Results depend on more than a treatment

Body copy:

Outcomes vary. Skin characteristics, indication, protocol, number of sessions, preparation and aftercare all influence the final experience.

Items:

* Evaluation
* Protocol
* Sessions
* Aftercare
* Individual response

CTA:

Understand results

Internal links:

* /results/
* /legal/
* /faq/

Build variation instruction:

This section must not use before-and-after imagery. Vary between abstract progress graphics, calm ethics panels, expectation checklists, and split explanatory sections.

---

## HOME SECTION 10 — Values Preview

HTML comment:

```html
<!-- HOME 10: Values Preview — present the principles that shape the Sofiati care experience. -->
```

Data attributes:

```html
data-section-id="home-values-preview"
data-section-type="values"
data-content-module="care-values"
data-layout-signature="unique-per-concept"
data-visual-role="brand-principles"
```

Image prompt:

Four elegant value cards with sage botanical linework, ivory backgrounds and bronze accents, premium clinical design.

Alt text:

Value cards showing precision, safety, responsibility and naturalness.

Eyebrow:

Care principles

Heading:

Principles that shape every decision

Body copy:

The Sofiati approach is guided by precision, safety, responsibility and natural-looking care.

Cards:

1. Precision
   Clear thinking before action.

2. Safety
   Professional criteria before indication.

3. Responsibility
   Honest expectations and careful guidance.

4. Naturalness
   Care that respects balance and individuality.

CTA:

View values

Internal links:

* /values/
* /mission/
* /about/

Build variation instruction:

Vary this section as icons, editorial quote blocks, split values table, stacked principles, soft cards, or a magazine-style manifesto.

---

## HOME SECTION 11 — Education Preview

HTML comment:

```html
<!-- HOME 11: Education Preview — invite visitors to learn before deciding and support SEO through educational content. -->
```

Data attributes:

```html
data-section-id="home-education-preview"
data-section-type="journal-preview"
data-content-module="education-before-decision"
data-layout-signature="unique-per-concept"
data-visual-role="seo-education"
```

Image prompt:

Editorial article cards with skincare textures, consultation notes and abstract laser-light visuals, sage and ivory palette, premium magazine layout.

Alt text:

Educational article cards about skin, laser and evaluation.

Eyebrow:

Learn before choosing

Heading:

Short guides for better questions

Body copy:

Educational notes can help you understand evaluation, laser care, skin quality, results and aftercare before requesting consultation.

Article cards:

1. Why evaluation comes first
   A calm guide to choosing care responsibly.
   Link: /journal/

2. What to ask before laser care
   Questions that help prepare the conversation.
   Link: /laser/

3. Why aftercare matters
   How guidance supports the care process.
   Link: /results/

CTA:

Read educational notes

Internal links:

* /journal/
* /blog/
* /faq/

Build variation instruction:

Vary the article preview layout: magazine cards, horizontal scroll, editorial stack, featured article plus two side notes, or image-led journal grid.

---

## HOME SECTION 12 — FAQ Preview

HTML comment:

```html
<!-- HOME 12: FAQ Preview — answer common doubts before consultation and reduce hesitation. -->
```

Data attributes:

```html
data-section-id="home-faq-preview"
data-section-type="faq-preview"
data-content-module="common-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Minimal FAQ visual with ivory cards, sage background, bronze accordion lines and botanical shadow.

Alt text:

Frequently asked questions about evaluation and care.

Eyebrow:

Common questions

Heading:

Questions before evaluation

FAQs:

1. Do I need evaluation first?
   Yes. Evaluation helps define whether a care path may be suitable for your skin, goals and history.

2. Can results be guaranteed?
   No. Results vary and depend on individual factors, protocol and aftercare.

3. How do I start?
   You can request evaluation through the consultation page or contact Franciele directly.

4. Where is the care based?
   Franciele Sofiati is based in Londrina, PR.

CTA:

Read all questions

Internal links:

* /faq/
* /consultation/
* /contact/

Build variation instruction:

This can be an accordion, stacked editorial Q&A, side-by-side question panel, large single question feature, or compact FAQ block depending on concept.

---

## HOME SECTION 13 — Consultation CTA

HTML comment:

```html
<!-- HOME 13: Consultation CTA — invite visitors to begin with professional evaluation without aggressive sales language. -->
```

Data attributes:

```html
data-section-id="home-consultation-cta"
data-section-type="cta"
data-content-module="evaluation-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Elegant consultation card scene with ivory paper, sage botanical detail, bronze accent and soft clinical-luxury mood.

Alt text:

Consultation card inviting professional evaluation.

Eyebrow:

Begin carefully

Heading:

Start with a professional evaluation

Body copy:

Share your goals and questions so the next step can be guided with care, clarity and responsibility.

Primary CTA:

Request evaluation

Secondary CTA:

Contact Franciele

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Across concepts, vary CTA design: full-width calm banner, portrait CTA, card stack, appointment note, floating consultation panel, or footer-before-final-contact section.

---

## HOME SECTION 14 — Contact Preview

HTML comment:

```html
<!-- HOME 14: Contact Preview — provide practical contact routes and reinforce location without exposing a full address. -->
```

Data attributes:

```html
data-section-id="home-contact-preview"
data-section-type="contact-preview"
data-content-module="contact-routes"
data-layout-signature="unique-per-concept"
data-visual-role="practical-access"
```

Image prompt:

Premium contact still life with sage stationery, ivory card, botanical accent, smartphone with neutral screen, warm clinical light.

Alt text:

Contact details for Franciele Sofiati in Londrina.

Eyebrow:

Contact

Heading:

Contact Franciele Sofiati

Body copy:

For questions or evaluation requests, contact Franciele through WhatsApp, email or Instagram.

Items:

* WhatsApp: (43) 9 9104-3536
* Email: [sofiatimendonca@gmail.com](mailto:sofiatimendonca@gmail.com)
* Instagram: @fransofiati_biomedica
* Londrina, PR

CTA:

Contact Franciele

Internal links:

* /contact/
* /privacy/

Build variation instruction:

Do not make contact sections identical. Use contact cards, soft directory panels, compact strips, icon-led panels, split image/contact layouts, or minimalist final notes.

---

# ABOUT PAGE

## SEO title

About Franciele Sofiati | Advanced Aesthetic Biomedicine

## Meta description

Learn about Franciele Sofiati, CRBM 6277, her professional background and evaluation-led approach to laser and skin care in Londrina.

## H1

Professional care shaped by evaluation and responsibility

---

## ABOUT SECTION 01 — Hero

HTML comment:

```html
<!-- ABOUT 01: Hero — introduce Franciele Sofiati as the professional behind the care. -->
```

Data attributes:

```html
data-section-id="about-hero"
data-section-type="hero"
data-content-module="professional-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="human-trust"
```

Image prompt:

Editorial portrait-style image for Franciele Sofiati, sage and ivory palette, refined botanical clinical setting, soft professional lighting.

Alt text:

Professional portrait-style visual for Franciele Sofiati.

Eyebrow:

About Franciele Sofiati

Heading:

Professional care with calm, clear guidance

Body copy:

Franciele Sofiati works with advanced aesthetic biomedicine, laser care and skin guidance through an evaluation-led approach in Londrina, PR.

Primary CTA:

Request evaluation

Secondary CTA:

View values

Internal links:

* /consultation/
* /values/
* /mission/

Build variation instruction:

Each concept should present the About hero differently: portrait-led, biography card, full-page editorial intro, quiet quote panel, signature profile, or split timeline layout.

---

## ABOUT SECTION 02 — Professional Identity

HTML comment:

```html
<!-- ABOUT 02: Professional Identity — show confirmed professional details without inventing credentials. -->
```

Data attributes:

```html
data-section-id="about-professional-identity"
data-section-type="trust"
data-content-module="confirmed-professional-details"
data-layout-signature="unique-per-concept"
data-visual-role="credential-clarity"
```

Image prompt:

Minimal credential card design with sage background, ivory identity panel, bronze linework and refined typography.

Alt text:

Confirmed professional details for Franciele Sofiati.

Eyebrow:

Professional identity

Heading:

Franciele Sofiati

Body copy:

Advanced Aesthetic Biomedicine. CRBM 6277. Based in Londrina, PR.

Cards:

1. Professional evaluation
   Care starts with understanding the person and the skin.

2. Laser and skin care
   Technology and technique are guided by indication.

3. Responsible communication
   Clear expectations come before any protocol.

Internal links:

* /contact/
* /mission/
* /care/

Build variation instruction:

Vary this as an identity card, credential sidebar, horizontal proof line, profile stamp, or calm trust grid.

---

## ABOUT SECTION 03 — Background

HTML comment:

```html
<!-- ABOUT 03: Background — explain the professional background that supports careful aesthetic care. -->
```

Data attributes:

```html
data-section-id="about-background"
data-section-type="background"
data-content-module="professional-background"
data-layout-signature="unique-per-concept"
data-visual-role="experience-context"
```

Image prompt:

Refined editorial timeline with clinical notes, botanical accents, sage panels and soft paper textures.

Alt text:

Professional background timeline for aesthetic biomedicine care.

Eyebrow:

Background

Heading:

A background that supports careful care

Body copy:

Franciele’s professional path includes clinical pathology, aesthetics, cosmetology and laser-focused care. This background supports a calm, criteria-based approach to aesthetic guidance.

Internal links:

* /care/
* /laser/
* /skin/

Build variation instruction:

Use different story patterns: timeline, editorial paragraph beside portrait, layered background cards, vertical milestones, or quiet biography feature.

---

## ABOUT SECTION 04 — Philosophy of Care

HTML comment:

```html
<!-- ABOUT 04: Philosophy — explain the Sofiati approach: listen, evaluate, indicate and guide responsibly. -->
```

Data attributes:

```html
data-section-id="about-philosophy"
data-section-type="philosophy"
data-content-module="listen-evaluate-indicate-guide"
data-layout-signature="unique-per-concept"
data-visual-role="brand-belief"
```

Image prompt:

Calm consultation scene with soft botanical shadow, ivory paper, sage linen and refined clinical atmosphere.

Alt text:

Consultation scene representing careful aesthetic guidance.

Eyebrow:

Care philosophy

Heading:

Listen first. Evaluate carefully. Indicate responsibly.

Body copy:

The goal is not to rush into a procedure. It is to understand the skin, the goal and the safest path before suggesting care.

Items:

* Listen
* Evaluate
* Indicate
* Guide
* Follow responsibly

CTA:

Understand the mission

Internal links:

* /mission/
* /values/
* /consultation/

Build variation instruction:

This can become a manifesto section, a numbered philosophy block, an editorial quote, a visual care cycle, or a calm split panel.

---

## ABOUT SECTION 05 — Evaluation Method

HTML comment:

```html
<!-- ABOUT 05: Evaluation Method — show how assessment shapes the care plan. -->
```

Data attributes:

```html
data-section-id="about-evaluation-method"
data-section-type="process"
data-content-module="evaluation-method"
data-layout-signature="unique-per-concept"
data-visual-role="method-clarity"
```

Image prompt:

Premium assessment checklist with sage and ivory cards, bronze details, soft clinical desk composition.

Alt text:

Professional evaluation checklist for aesthetic care.

Eyebrow:

Evaluation method

Heading:

How evaluation shapes the care plan

Body copy:

Assessment helps clarify skin characteristics, goals, suitability, professional indication and aftercare needs.

Cards:

1. Skin characteristics
   Understanding the starting point.

2. Personal goals
   Clarifying what the visitor wants to improve.

3. Suitability
   Considering whether a protocol may be appropriate.

4. Aftercare
   Planning guidance beyond the session.

Internal links:

* /consultation/
* /faq/
* /results/

Build variation instruction:

Vary this as a checklist, process map, quiet accordion, assessment cards, or clinical notebook layout.

---

## ABOUT SECTION 06 — Areas of Focus

HTML comment:

```html
<!-- ABOUT 06: Areas of Focus — connect the professional profile to the main service pages. -->
```

Data attributes:

```html
data-section-id="about-areas-of-focus"
data-section-type="service-navigation"
data-content-module="care-laser-skin"
data-layout-signature="unique-per-concept"
data-visual-role="service-bridge"
```

Image prompt:

Three premium image cards for care, laser and skin with unique sage, ivory and champagne visual treatments.

Alt text:

Care, laser and skin focus areas.

Eyebrow:

Areas of focus

Heading:

Focused care paths

Cards:

1. Care
   Personalised guidance from evaluation to aftercare.
   Link: /care/

2. Laser
   Technology-led care with professional indication.
   Link: /laser/

3. Skin
   Skin quality support through responsible guidance.
   Link: /skin/

CTA:

Explore care paths

Internal links:

* /care/
* /laser/
* /skin/

Build variation instruction:

Do not reuse the Home care cards. Make this more biography-connected: use focus pillars, image bands, professional notes, or service links inside a profile section.

---

## ABOUT SECTION 07 — What Visitors Can Expect

HTML comment:

```html
<!-- ABOUT 07: Visitor Expectations — describe the tone of the care experience. -->
```

Data attributes:

```html
data-section-id="about-visitor-expectations"
data-section-type="experience"
data-content-module="what-to-expect"
data-layout-signature="unique-per-concept"
data-visual-role="experience-reassurance"
```

Image prompt:

Soft consultation room atmosphere, sage upholstery, ivory walls, botanical detail, premium calm clinical space.

Alt text:

Calm professional setting representing the Sofiati care experience.

Eyebrow:

What to expect

Heading:

A calm and precise experience

Body copy:

Visitors can expect clear communication, realistic expectations and care guided by individual evaluation.

Cards:

* Calm communication
* Clear guidance
* Realistic expectations
* Individualised planning

Internal links:

* /results/
* /faq/
* /consultation/

Build variation instruction:

Vary as experience cards, soft testimonial-style non-testimonial statements, visual checklist, or hospitality-inspired care notes.

---

## ABOUT SECTION 08 — Values in Practice

HTML comment:

```html
<!-- ABOUT 08: Values in Practice — connect Franciele's approach to the Values page. -->
```

Data attributes:

```html
data-section-id="about-values-in-practice"
data-section-type="values-preview"
data-content-module="values-in-practice"
data-layout-signature="unique-per-concept"
data-visual-role="principle-reinforcement"
```

Image prompt:

Elegant values still life with sage cards, bronze linework, botanical shadow and premium editorial typography.

Alt text:

Values that guide responsible aesthetic care.

Eyebrow:

Values in practice

Heading:

Values that guide decisions

Body copy:

Precision, safety, responsibility and naturalness shape how care is discussed, planned and followed.

Internal links:

* /values/
* /mission/
* /care/

Build variation instruction:

Make this section quieter than the Values page. Use a compact bridge, signature note, quote-style card, or small principles grid.

---

## ABOUT SECTION 09 — Consultation CTA

HTML comment:

```html
<!-- ABOUT 09: Consultation CTA — invite visitors to begin with a professional conversation. -->
```

Data attributes:

```html
data-section-id="about-consultation-cta"
data-section-type="cta"
data-content-module="start-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium consultation note with sage botanical accent, ivory paper, bronze pen and soft clinical light.

Alt text:

Consultation note inviting professional evaluation.

Eyebrow:

Start carefully

Heading:

Begin with a professional conversation

Body copy:

Request evaluation to understand which care path may be suitable for your skin and goals.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Use a CTA style that differs from Home: smaller, more personal, professional-profile anchored, or portrait-adjacent.

---

# CARE PAGE

## SEO title

Personalised Aesthetic Care in Londrina | Franciele Sofiati

## Meta description

Explore personalised aesthetic care guided by professional evaluation, responsible protocols and aftercare in Londrina, PR.

## H1

Personalised aesthetic care begins with evaluation

---

## CARE SECTION 01 — Hero

HTML comment:

```html
<!-- CARE 01: Hero — introduce personalised aesthetic care as an evaluation-led path. -->
```

Data attributes:

```html
data-section-id="care-hero"
data-section-type="hero"
data-content-module="personalised-care-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="service-entry"
```

Image prompt:

Warm consultation scene with sage, ivory and botanical details, premium clinical-luxury aesthetic, calm professional setting.

Alt text:

Consultation-led aesthetic care path.

Eyebrow:

Personalised care

Heading:

A care path shaped around you

Body copy:

Every care plan should begin with evaluation, not assumptions. Your skin, goals and suitability guide the next step.

Primary CTA:

Request evaluation

Secondary CTA:

Explore laser and skin guidance

Internal links:

* /consultation/
* /laser/
* /skin/

Build variation instruction:

Care page hero should feel more process-focused than the Home hero. Use care pathway visuals, consultation desk scenes, service story panels, or a calming editorial service layout.

---

## CARE SECTION 02 — Why Evaluation Comes First

HTML comment:

```html
<!-- CARE 02: Evaluation First — explain why aesthetic care should begin with assessment. -->
```

Data attributes:

```html
data-section-id="care-evaluation-first"
data-section-type="education"
data-content-module="why-evaluation-first"
data-layout-signature="unique-per-concept"
data-visual-role="responsible-start"
```

Image prompt:

Elegant evaluation checklist on ivory paper with sage botanical shadows and bronze details.

Alt text:

Checklist representing professional evaluation before aesthetic care.

Eyebrow:

Before choosing care

Heading:

The right path depends on assessment

Body copy:

Different skin characteristics and goals require different decisions. Evaluation helps avoid random choices and supports responsible planning.

Cards:

1. Skin characteristics
   Understanding the condition and context of the skin.

2. Goals and priorities
   Clarifying what matters most to the visitor.

3. Professional indication
   Defining a path according to assessment.

Internal links:

* /faq/
* /consultation/
* /results/

Build variation instruction:

Use different structures across concepts: educational cards, illustrated checklist, split panel, calm FAQ-style explanation, or layered note system.

---

## CARE SECTION 03 — Care Journey Map

HTML comment:

```html
<!-- CARE 03: Care Journey — map the full path from first contact to aftercare. -->
```

Data attributes:

```html
data-section-id="care-journey-map"
data-section-type="process"
data-content-module="care-process"
data-layout-signature="unique-per-concept"
data-visual-role="journey-clarity"
```

Image prompt:

Elegant horizontal care journey map in sage, ivory and champagne colours, refined line icons, premium clinical design.

Alt text:

Step-by-step care journey from contact to aftercare.

Eyebrow:

Care journey

Heading:

From first contact to aftercare

Body copy:

The journey is designed to keep the visitor informed before, during and after care.

Steps:

1. First contact
2. Evaluation
3. Indication
4. Personalised protocol
5. Aftercare
6. Review when needed

CTA:

View consultation details

Internal links:

* /consultation/
* /results/
* /faq/

Build variation instruction:

Across concepts, vary between timeline, vertical steps, path illustration, editorial chapter sequence, numbered image tiles, or process accordion.

---

## CARE SECTION 04 — What Care Can Include

HTML comment:

```html
<!-- CARE 04: Care Includes — explain possible care categories without implying suitability before evaluation. -->
```

Data attributes:

```html
data-section-id="care-what-care-can-include"
data-section-type="service-details"
data-content-module="care-categories"
data-layout-signature="unique-per-concept"
data-visual-role="service-education"
```

Image prompt:

Premium collage of skin texture, abstract laser light, consultation notes and botanical clinical details in sage and ivory.

Alt text:

Visual overview of personalised aesthetic care categories.

Eyebrow:

Care possibilities

Heading:

Care may involve different paths

Body copy:

The appropriate path depends on professional evaluation. Care may involve skin quality guidance, laser-related care, cleansing, texture support, luminosity support or aftercare planning.

Cards:

1. Skin quality
   Supporting texture, comfort and luminosity.

2. Laser care
   Technology guided by professional indication.

3. Cleansing
   Care planning based on skin needs.

4. Texture
   Understanding surface concerns responsibly.

5. Luminosity
   Supporting a healthier-looking appearance.

6. Aftercare
   Guidance that supports the process.

Internal links:

* /laser/
* /skin/
* /journal/

Build variation instruction:

Do not use identical six-card grids everywhere. Rotate between masonry, image bands, tabbed service notes, editorial tiles, or compact service index.

---

## CARE SECTION 05 — Personalised Protocols

HTML comment:

```html
<!-- CARE 05: Personalised Protocols — make clear that protocols are individual and not one-size-fits-all. -->
```

Data attributes:

```html
data-section-id="care-personalised-protocols"
data-section-type="method"
data-content-module="personalised-protocols"
data-layout-signature="unique-per-concept"
data-visual-role="individualisation"
```

Image prompt:

Layered personalised protocol cards with sage, ivory and champagne accents, calm premium clinical style.

Alt text:

Personalised protocol cards for individual aesthetic care planning.

Eyebrow:

Individual planning

Heading:

No one-size-fits-all plan

Body copy:

A protocol should reflect the person being evaluated. Goals, skin response, history and professional criteria all matter.

Items:

* Individual goals
* Skin characteristics
* Suitability
* Professional indication
* Response and aftercare

Internal links:

* /results/
* /faq/
* /consultation/

Build variation instruction:

Vary this section as a calm statement block, visual equation, stacked decision cards, or editorial “why it matters” layout.

---

## CARE SECTION 06 — Safety and Preparation

HTML comment:

```html
<!-- CARE 06: Safety and Preparation — explain what may need to be discussed before care begins. -->
```

Data attributes:

```html
data-section-id="care-safety-preparation"
data-section-type="preparation"
data-content-module="safety-preparation"
data-layout-signature="unique-per-concept"
data-visual-role="pre-care-guidance"
```

Image prompt:

Elegant preparation checklist with botanical details, sage paper cards and warm clinical light.

Alt text:

Preparation checklist for responsible aesthetic care.

Eyebrow:

Preparation

Heading:

Preparation supports better decisions

Body copy:

Before care begins, relevant history, sensitivity, recent procedures, sun exposure and lifestyle factors may need to be discussed.

Cards:

1. Relevant history
   Share important context before care is considered.

2. Sensitivity
   Discuss skin reactions or tolerance concerns.

3. Recent procedures
   Previous care may influence the next step.

4. Expectations
   Clarify what you hope to improve.

Internal links:

* /laser/
* /consultation/
* /faq/

Build variation instruction:

Can be a checklist, pre-consultation note, split warning panel, question list, or preparation guide.

---

## CARE SECTION 07 — Aftercare Guidance

HTML comment:

```html
<!-- CARE 07: Aftercare Guidance — show that care continues after the session. -->
```

Data attributes:

```html
data-section-id="care-aftercare-guidance"
data-section-type="aftercare"
data-content-module="aftercare-importance"
data-layout-signature="unique-per-concept"
data-visual-role="post-care-support"
```

Image prompt:

Soft aftercare still life with skincare texture, ivory towel, sage botanical shadow and premium clinical calm.

Alt text:

Aftercare visual representing guidance after aesthetic care.

Eyebrow:

Aftercare

Heading:

Aftercare is part of the care

Body copy:

Professional guidance after a protocol helps support comfort, consistency and realistic expectations.

Items:

* Follow professional instructions
* Respect the protocol guidance
* Protect the skin as advised
* Ask questions when unsure

Internal links:

* /results/
* /blog/
* /faq/

Build variation instruction:

Vary this as a soft care note, post-care checklist, image-led aftercare card, or concise educational section.

---

## CARE SECTION 08 — Related Care Paths

HTML comment:

```html
<!-- CARE 08: Related Paths — guide users naturally to Laser, Skin and Results pages. -->
```

Data attributes:

```html
data-section-id="care-related-paths"
data-section-type="internal-navigation"
data-content-module="related-care-pages"
data-layout-signature="unique-per-concept"
data-visual-role="page-bridging"
```

Image prompt:

Premium related-path cards with abstract laser light, skin texture and progress visual, sage and ivory palette.

Alt text:

Related care path cards for laser, skin and results.

Eyebrow:

Next steps

Heading:

Explore the next path

Cards:

1. Explore Laser
   Understand technology-led care.
   Link: /laser/

2. Explore Skin
   Learn about skin quality guidance.
   Link: /skin/

3. Understand Results
   Read about realistic expectations.
   Link: /results/

Internal links:

* /laser/
* /skin/
* /results/

Build variation instruction:

Use different navigation patterns: side cards, image tiles, bottom rail, editorial recommendations, or in-page pathway buttons.

---

## CARE SECTION 09 — Care FAQ

HTML comment:

```html
<!-- CARE 09: Care FAQ — answer care-specific questions before the visitor requests evaluation. -->
```

Data attributes:

```html
data-section-id="care-faq"
data-section-type="faq"
data-content-module="care-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Minimal FAQ accordion visual with sage background, ivory question cards and bronze dividers.

Alt text:

Care questions before aesthetic evaluation.

Eyebrow:

Care questions

Heading:

Questions before choosing care

FAQs:

1. Why does evaluation come first?
   Because care should be based on skin characteristics, goals and suitability.

2. Can I choose a treatment directly?
   A professional evaluation is recommended before deciding on any protocol.

3. How is a protocol defined?
   It depends on assessment, indication, preparation and aftercare.

4. What should I share?
   Your goals, concerns, previous procedures and relevant sensitivities.

CTA:

Read all questions

Internal links:

* /faq/
* /consultation/
* /privacy/

Build variation instruction:

Vary FAQ display as accordion, editorial Q&A, two-column questions, compact cards, or side panel.

---

## CARE SECTION 10 — Consultation CTA

HTML comment:

```html
<!-- CARE 10: Consultation CTA — end the Care page with a clear evaluation request. -->
```

Data attributes:

```html
data-section-id="care-consultation-cta"
data-section-type="cta"
data-content-module="care-evaluation-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium evaluation request card with ivory paper, sage botanical detail and warm professional lighting.

Alt text:

Evaluation request card for personalised aesthetic care.

Eyebrow:

Start carefully

Heading:

Request professional evaluation

Body copy:

A careful first conversation helps clarify what may be suitable for you.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Use a CTA that feels connected to the Care page journey, not copied from Home.

---

# LASER PAGE

## SEO title

Laser Care in Londrina | Franciele Sofiati

## Meta description

Laser care in Londrina guided by professional evaluation, suitability, preparation, aftercare and responsible expectations.

## H1

Laser care guided by professional evaluation

---

## LASER SECTION 01 — Hero

HTML comment:

```html
<!-- LASER 01: Hero — introduce laser care as technology guided by professional judgement. -->
```

Data attributes:

```html
data-section-id="laser-hero"
data-section-type="hero"
data-content-module="laser-care-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="technology-entry"
```

Image prompt:

Abstract refined laser-light composition over sage and ivory surfaces, champagne glow, premium clinical aesthetic, no patient, no procedure.

Alt text:

Abstract laser-light visual for professional laser care.

Eyebrow:

Laser care

Heading:

Technology guided by professional judgement

Body copy:

Laser care should be planned with attention to skin characteristics, goals, suitability, preparation and aftercare.

Primary CTA:

Request evaluation

Secondary CTA:

Understand suitability

Internal links:

* /consultation/
* /care/
* /faq/

Build variation instruction:

Laser page must have its own visual language. Use light beams, technical elegance, abstract geometry or clinical-luxury technology visuals, but avoid cold hospital-blue design.

---

## LASER SECTION 02 — Suitability First

HTML comment:

```html
<!-- LASER 02: Suitability First — explain that laser protocols are not suitable for everyone without evaluation. -->
```

Data attributes:

```html
data-section-id="laser-suitability-first"
data-section-type="education"
data-content-module="laser-suitability"
data-layout-signature="unique-per-concept"
data-visual-role="safety-clarity"
```

Image prompt:

Premium suitability checklist with sage panels, ivory background, abstract laser line and bronze detail.

Alt text:

Suitability checklist for laser care.

Eyebrow:

Suitability first

Heading:

Not every protocol suits every person

Body copy:

Skin characteristics, sensitivity, history and goals all influence whether a laser protocol may be appropriate.

Cards:

1. Skin characteristics
   The skin’s condition and context matter.

2. Sensitivity
   Reactions and tolerance should be discussed.

3. Goals
   Expectations should be clarified before planning.

4. Professional indication
   The final path depends on evaluation.

Internal links:

* /faq/
* /results/
* /consultation/

Build variation instruction:

Vary this as a diagnostic-style panel, caution card, checklist, two-column explanation, or step-based suitability guide.

---

## LASER SECTION 03 — Laser Care Areas

HTML comment:

```html
<!-- LASER 03: Laser Care Areas — outline laser-related topics carefully without promising suitability or outcomes. -->
```

Data attributes:

```html
data-section-id="laser-care-areas"
data-section-type="service-details"
data-content-module="laser-care-areas"
data-layout-signature="unique-per-concept"
data-visual-role="service-education"
```

Image prompt:

Premium abstract laser care collage with soft light beams, skin texture details, sage and ivory surfaces, no procedure photo.

Alt text:

Laser-related care topics including preparation, suitability and aftercare.

Eyebrow:

Laser-related care

Heading:

Laser care may support different goals when indicated

Body copy:

Laser-related care should be discussed after evaluation. Suitability, preparation, protocol and aftercare all influence the care path.

Cards:

1. Laser hair removal
   Suitability and planning depend on evaluation.

2. Texture support
   Guidance may consider skin quality and response.

3. Luminosity support
   Care should be realistic and individual.

4. Rejuvenation education
   Information helps prepare better questions.

5. Preparation
   Guidance before sessions matters.

6. Aftercare
   Support after sessions is part of the process.

Internal links:

* /skin/
* /care/
* /consultation/

Build variation instruction:

Avoid repeating the Care page service grid. Use technical panels, laser-topic bands, image-led modules, or expandable educational cards.

---

## LASER SECTION 04 — Before Laser

HTML comment:

```html
<!-- LASER 04: Before Laser — list what should be discussed before laser care. -->
```

Data attributes:

```html
data-section-id="laser-before-care"
data-section-type="preparation"
data-content-module="before-laser"
data-layout-signature="unique-per-concept"
data-visual-role="pre-care-guidance"
```

Image prompt:

Premium pre-laser consultation checklist, ivory paper, sage botanical detail, champagne linework, soft clinical light.

Alt text:

Checklist for questions before laser care.

Eyebrow:

Before laser care

Heading:

What to discuss before laser care

Body copy:

Before beginning, it may be important to discuss sun exposure, sensitivity, previous procedures, skin history and expectations.

Checklist:

* Recent sun exposure
* Skin sensitivity
* Previous procedures
* Current skin concerns
* Desired outcome
* Aftercare availability

Internal links:

* /consultation/
* /faq/
* /care/

Build variation instruction:

This section can appear as a checklist, a question guide, a pre-care card, a split image note, or a clinical intake-inspired layout.

---

## LASER SECTION 05 — During the Process

HTML comment:

```html
<!-- LASER 05: During the Process — explain that protocols, sessions and intervals depend on evaluation. -->
```

Data attributes:

```html
data-section-id="laser-process"
data-section-type="process"
data-content-module="laser-process"
data-layout-signature="unique-per-concept"
data-visual-role="protocol-clarity"
```

Image prompt:

Abstract session pathway in sage, ivory and champagne tones with refined laser-light lines and soft clinical geometry.

Alt text:

Laser care process pathway.

Eyebrow:

During the process

Heading:

Protocols depend on evaluation

Body copy:

The number of sessions, intervals and guidance can vary. Professional evaluation helps define the path responsibly.

Items:

* Evaluation
* Protocol planning
* Session guidance
* Interval planning
* Aftercare

Internal links:

* /results/
* /care/
* /faq/

Build variation instruction:

Use a different process presentation from the Care page: technical pathway, abstract line sequence, cards over light beam, or compact protocol map.

---

## LASER SECTION 06 — Aftercare

HTML comment:

```html
<!-- LASER 06: Aftercare — explain that aftercare is part of responsible laser planning. -->
```

Data attributes:

```html
data-section-id="laser-aftercare"
data-section-type="aftercare"
data-content-module="laser-aftercare"
data-layout-signature="unique-per-concept"
data-visual-role="post-care-support"
```

Image prompt:

Premium aftercare composition with gentle skincare texture, ivory towel, sage surface and soft botanical shadow.

Alt text:

Aftercare visual for laser care guidance.

Eyebrow:

Aftercare

Heading:

Aftercare supports the process

Body copy:

Following professional guidance after sessions can help support comfort and responsible expectations.

Items:

* Follow instructions carefully
* Protect the skin as advised
* Ask questions when uncertain
* Respect timing and guidance

Internal links:

* /blog/
* /faq/
* /results/

Build variation instruction:

Make this softer and calmer than technical laser sections. Use wellness-inspired clinical still life, aftercare notes, or gentle instruction cards.

---

## LASER SECTION 07 — Results May Vary

HTML comment:

```html
<!-- LASER 07: Results May Vary — set realistic expectations for laser outcomes. -->
```

Data attributes:

```html
data-section-id="laser-results-vary"
data-section-type="expectations"
data-content-module="laser-results-responsibility"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-results"
```

Image prompt:

Abstract individual-response visual with layered translucent sage cards, no before-and-after, no patient imagery.

Alt text:

Abstract visual representing individual laser care results.

Eyebrow:

Responsible expectations

Heading:

Results are individual

Body copy:

Laser outcomes can vary according to skin characteristics, protocol, preparation, sessions and aftercare.

CTA:

Understand results

Internal links:

* /results/
* /legal/
* /faq/

Build variation instruction:

Do not use before-and-after. Use abstract progress visuals, explanation panels or expectation notes.

---

## LASER SECTION 08 — Laser FAQ

HTML comment:

```html
<!-- LASER 08: Laser FAQ — answer common laser questions before consultation. -->
```

Data attributes:

```html
data-section-id="laser-faq"
data-section-type="faq"
data-content-module="laser-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Premium FAQ card layout with sage background, ivory question panels and abstract laser accent lines.

Alt text:

Frequently asked questions about laser care.

Eyebrow:

Laser questions

Heading:

Common laser questions

FAQs:

1. Is laser suitable for everyone?
   No. Suitability depends on evaluation.

2. Do results vary?
   Yes. Individual factors and protocol details matter.

3. Why is aftercare important?
   Aftercare supports the care process and comfort.

4. What should I discuss first?
   Skin history, sensitivity, sun exposure and expectations.

CTA:

Read all questions

Internal links:

* /faq/
* /consultation/
* /results/

Build variation instruction:

Vary the FAQ pattern across concepts. Do not repeat the same accordion styling every time.

---

## LASER SECTION 09 — Related Skin Care

HTML comment:

```html
<!-- LASER 09: Related Skin Care — connect laser care to the broader skin-quality journey. -->
```

Data attributes:

```html
data-section-id="laser-related-skin-care"
data-section-type="internal-navigation"
data-content-module="laser-skin-connection"
data-layout-signature="unique-per-concept"
data-visual-role="service-bridge"
```

Image prompt:

Elegant connection visual between abstract laser light and macro skin texture, sage ivory palette, premium editorial style.

Alt text:

Connection between laser care and skin quality guidance.

Eyebrow:

Connected care

Heading:

Laser and skin quality can connect

Body copy:

Laser care may be part of a broader skin-quality plan when professionally indicated.

Cards:

1. Explore Skin
   Understand texture, sensitivity and skin quality.
   Link: /skin/

2. Read educational notes
   Learn before choosing a protocol.
   Link: /journal/

3. Prepare questions
   Use the FAQ to clarify doubts.
   Link: /faq/

Internal links:

* /skin/
* /journal/
* /blog/

Build variation instruction:

This should feel like a bridge, not a duplicate service grid. Use cross-linking cards, soft content rail, or image-led related path.

---

## LASER SECTION 10 — Consultation CTA

HTML comment:

```html
<!-- LASER 10: Consultation CTA — invite visitors to evaluate before choosing laser care. -->
```

Data attributes:

```html
data-section-id="laser-consultation-cta"
data-section-type="cta"
data-content-module="laser-evaluation-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium laser consultation card with abstract light detail, ivory paper, sage surface and bronze accent.

Alt text:

Evaluation request for laser care.

Eyebrow:

Evaluate first

Heading:

Evaluate before choosing laser care

Body copy:

Request evaluation to understand whether a laser-related path may be suitable for your goals.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

CTA should match the Laser page visual language but not copy the Home or Care CTA layout.

---

# SKIN PAGE

## SEO title

Skin Care Guidance in Londrina | Franciele Sofiati

## Meta description

Skin care guidance in Londrina focused on evaluation, skin quality, texture, luminosity and responsible aesthetic planning.

## H1

Skin quality care with professional guidance

---

## SKIN SECTION 01 — Hero

HTML comment:

```html
<!-- SKIN 01: Hero — introduce skin care as evaluation-led guidance for skin quality, texture and luminosity. -->
```

Data attributes:

```html
data-section-id="skin-hero"
data-section-type="hero"
data-content-module="skin-guidance-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="skin-entry"
```

Image prompt:

Premium macro skincare texture in sage, cream and ivory tones with botanical luxury details and soft natural light.

Alt text:

Macro skincare texture representing skin quality guidance.

Eyebrow:

Skin guidance

Heading:

Understand your skin before choosing care

Body copy:

Skin care should begin with evaluation, especially when concerns involve texture, sensitivity, luminosity or visible changes.

Primary CTA:

Request evaluation

Secondary CTA:

Explore care

Internal links:

* /consultation/
* /care/
* /faq/

Build variation instruction:

Skin page should feel softer and more texture-led than Laser. Use macro images, calm editorial surfaces, skin-quality topic tiles, and warm educational layouts.

---

## SKIN SECTION 02 — Understanding Your Skin

HTML comment:

```html
<!-- SKIN 02: Understanding Skin — explain that similar skin concerns can have different causes. -->
```

Data attributes:

```html
data-section-id="skin-understanding"
data-section-type="education"
data-content-module="skin-is-individual"
data-layout-signature="unique-per-concept"
data-visual-role="skin-education"
```

Image prompt:

Soft layered skin education cards with cream, sage and ivory tones, botanical shadow and elegant clinical notes.

Alt text:

Educational cards about individual skin characteristics.

Eyebrow:

Individual skin

Heading:

Skin is individual

Body copy:

Similar concerns can have different causes. Evaluation helps clarify what your skin needs before care is planned.

Items:

* Texture
* Sensitivity
* Luminosity
* Skin history
* Daily habits
* Professional indication

Internal links:

* /faq/
* /consultation/
* /journal/

Build variation instruction:

Vary this section as an educational note, topic map, calm checklist, split macro image, or editorial explanation.

---

## SKIN SECTION 03 — Skin Concerns Education

HTML comment:

```html
<!-- SKIN 03: Skin Topics — introduce common skin topics in an educational, non-diagnostic way. -->
```

Data attributes:

```html
data-section-id="skin-topics"
data-section-type="service-details"
data-content-module="skin-concerns-education"
data-layout-signature="unique-per-concept"
data-visual-role="topic-education"
```

Image prompt:

Premium skin topic collage with macro texture, botanical details, soft cream and sage surfaces, refined editorial look.

Alt text:

Educational skin care topics including texture, luminosity and sensitivity.

Eyebrow:

Skin topics

Heading:

Common skin topics to understand

Body copy:

These topics can help you prepare better questions, but they do not replace professional evaluation.

Cards:

1. Texture
   Surface changes need careful evaluation.

2. Luminosity
   A healthier-looking appearance depends on context.

3. Sensitivity
   Comfort and tolerance matter.

4. Spots and melasma education
   Guidance should be cautious and individual.

5. Rosacea education
   Skin reactivity requires professional attention.

6. Cleansing
   Suitability depends on skin condition.

7. Skin barrier
   Daily care and professional care should align.

8. Ageing signs education
   Expectations should stay realistic.

Internal links:

* /journal/
* /blog/
* /consultation/

Build variation instruction:

Do not use a plain eight-card grid everywhere. Rotate between topic index, image-led editorial cards, soft accordion, mosaic layout, or guided topic pathway.

---

## SKIN SECTION 04 — Skin Quality Pathway

HTML comment:

```html
<!-- SKIN 04: Skin Quality Pathway — show how a skin concern becomes a care plan through evaluation. -->
```

Data attributes:

```html
data-section-id="skin-quality-pathway"
data-section-type="process"
data-content-module="skin-care-pathway"
data-layout-signature="unique-per-concept"
data-visual-role="pathway-clarity"
```

Image prompt:

Elegant skin quality pathway graphic with sage, ivory and champagne details, soft organic lines and refined clinical style.

Alt text:

Pathway from skin concern to care plan.

Eyebrow:

Skin pathway

Heading:

From concern to care plan

Body copy:

A skin concern should be understood before a care path is chosen. Evaluation helps organise priorities and guide the next step.

Steps:

1. Understand the concern
2. Evaluate the skin
3. Define priorities
4. Plan care
5. Guide aftercare

Internal links:

* /care/
* /results/
* /consultation/

Build variation instruction:

Use varied forms: vertical journey, soft circular pathway, editorial list with images, or layered process notes.

---

## SKIN SECTION 05 — Professional Treatments

HTML comment:

```html
<!-- SKIN 05: Professional Treatments — explain that clinic-based care must be professionally indicated. -->
```

Data attributes:

```html
data-section-id="skin-professional-treatments"
data-section-type="service-education"
data-content-module="professional-skin-care"
data-layout-signature="unique-per-concept"
data-visual-role="clinical-guidance"
```

Image prompt:

Refined treatment-room still life with skincare textures, sage details, ivory clinical surfaces and soft luxury lighting.

Alt text:

Professional skin care environment for evaluation-led treatment guidance.

Eyebrow:

Professional care

Heading:

Professional care should be carefully indicated

Body copy:

Clinic-based care may support skin quality when the indication is appropriate. The right path depends on evaluation.

Internal links:

* /care/
* /laser/
* /faq/

Build variation instruction:

This section should feel professional but not procedural. Avoid treatment photos. Use still life, room atmosphere, or educational panels.

---

## SKIN SECTION 06 — Home Guidance

HTML comment:

```html
<!-- SKIN 06: Home Guidance — connect professional care with daily skin habits. -->
```

Data attributes:

```html
data-section-id="skin-home-guidance"
data-section-type="education"
data-content-module="daily-care-guidance"
data-layout-signature="unique-per-concept"
data-visual-role="routine-support"
```

Image prompt:

Premium daily skin care still life with cream textures, sage botanical accents, ivory towel and soft morning light.

Alt text:

Daily skin care still life representing home guidance.

Eyebrow:

Daily care

Heading:

Daily care matters too

Body copy:

Professional care and home guidance should work together. Consistency, suitability and realistic expectations all matter.

Items:

* Consistency
* Suitability
* Skin comfort
* Professional guidance
* Aftercare habits

Internal links:

* /blog/
* /faq/
* /results/

Build variation instruction:

Vary as routine notes, soft checklist, morning-care visual, editorial article-style block, or compact guidance cards.

---

## SKIN SECTION 07 — Natural-Looking Care

HTML comment:

```html
<!-- SKIN 07: Natural-Looking Care — reinforce balance, restraint and individualised aesthetic planning. -->
```

Data attributes:

```html
data-section-id="skin-natural-looking-care"
data-section-type="values"
data-content-module="natural-looking-care"
data-layout-signature="unique-per-concept"
data-visual-role="brand-principle"
```

Image prompt:

Elegant natural skin texture visual with soft light, sage and ivory tones, botanical clinical luxury, realistic refined skin detail.

Alt text:

Natural-looking skin care visual representing balance and restraint.

Eyebrow:

Balance

Heading:

Balance over excess

Body copy:

A responsible aesthetic plan should respect individuality, natural-looking care and professional restraint.

Internal links:

* /values/
* /results/
* /about/

Build variation instruction:

This should not feel like a sales claim. Use a quiet brand principle section, editorial quote, or visual manifesto.

---

## SKIN SECTION 08 — Related Education

HTML comment:

```html
<!-- SKIN 08: Related Education — guide users toward Journal and Blog content about skin care. -->
```

Data attributes:

```html
data-section-id="skin-related-education"
data-section-type="journal-preview"
data-content-module="skin-education-links"
data-layout-signature="unique-per-concept"
data-visual-role="seo-education"
```

Image prompt:

Editorial article cards about skin evaluation, aftercare and skin quality, sage and ivory palette.

Alt text:

Educational article cards about skin care guidance.

Eyebrow:

Learn more

Heading:

Learn more about skin care

Article cards:

1. Why skin evaluation matters
   Understand why similar concerns can require different care paths.
   Link: /journal/

2. Questions before skin care
   Prepare better questions before evaluation.
   Link: /faq/

3. How aftercare supports comfort
   Learn why care continues after a protocol.
   Link: /blog/

Internal links:

* /journal/
* /blog/
* /faq/

Build variation instruction:

Vary the article preview pattern from Home and Blog. Use small education strips, featured notes, or topic tiles.

---

## SKIN SECTION 09 — Skin FAQ

HTML comment:

```html
<!-- SKIN 09: Skin FAQ — answer skin-specific questions and avoid diagnosis through website copy. -->
```

Data attributes:

```html
data-section-id="skin-faq"
data-section-type="faq"
data-content-module="skin-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Minimal skin FAQ cards with cream, sage and ivory tones, botanical shadow and bronze dividers.

Alt text:

Skin care questions before evaluation.

Eyebrow:

Skin questions

Heading:

Common skin questions

FAQs:

1. Can this page diagnose my skin?
   No. This website is educational and does not replace evaluation.

2. Why do I need evaluation?
   Because skin concerns can have different causes and care needs.

3. What if I have sensitivity?
   Sensitivity should be discussed before any protocol is considered.

4. How do I know what is suitable?
   Suitability depends on professional assessment.

CTA:

Read all questions

Internal links:

* /faq/
* /consultation/
* /privacy/

Build variation instruction:

Vary FAQ presentation from Laser and Care. Use soft Q&A cards, accordion, sidebar answers, or editorial question blocks.

---

## SKIN SECTION 10 — Consultation CTA

HTML comment:

```html
<!-- SKIN 10: Consultation CTA — invite users to request skin evaluation before choosing care. -->
```

Data attributes:

```html
data-section-id="skin-consultation-cta"
data-section-type="cta"
data-content-module="skin-evaluation-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium skin evaluation request card with macro skin texture, sage botanical accent and ivory background.

Alt text:

Evaluation request for skin care guidance.

Eyebrow:

Start with assessment

Heading:

Request skin evaluation

Body copy:

Start with professional assessment before choosing a care path.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

CTA should feel soft and skin-focused, not copied from Laser or Care.

---

# RESULTS PAGE

## SEO title

Responsible Aesthetic Results | Franciele Sofiati

## Meta description

Understand responsible aesthetic results, individual variation, aftercare and why evaluation matters before choosing a care protocol.

## H1

Results with responsibility begin with evaluation

---

## RESULTS SECTION 01 — Hero

HTML comment:

```html
<!-- RESULTS 01: Hero — introduce results through realistic expectations and responsible communication. -->
```

Data attributes:

```html
data-section-id="results-hero"
data-section-type="hero"
data-content-module="responsible-results-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="expectation-setting"
```

Image prompt:

Abstract layered progress visual in sage, ivory and champagne tones, no before-and-after, no patient imagery, premium editorial style.

Alt text:

Abstract visual representing responsible aesthetic progress.

Eyebrow:

Responsible results

Heading:

Realistic expectations matter

Body copy:

Aesthetic outcomes are individual. Evaluation, indication, protocol and aftercare all influence the final experience.

Primary CTA:

Request evaluation

Secondary CTA:

Understand the care process

Internal links:

* /consultation/
* /care/
* /faq/

Build variation instruction:

Results page must never rely on fake before-and-after visuals. Use abstract progress, ethical communication panels, consent-aware image placeholders, or expectation education.

---

## RESULTS SECTION 02 — What Influences Results

HTML comment:

```html
<!-- RESULTS 02: Influencing Factors — explain what can affect aesthetic outcomes. -->
```

Data attributes:

```html
data-section-id="results-influencing-factors"
data-section-type="education"
data-content-module="factors-that-influence-results"
data-layout-signature="unique-per-concept"
data-visual-role="result-context"
```

Image prompt:

Premium factor cards showing evaluation, protocol, sessions and aftercare with sage and ivory clinical-luxury design.

Alt text:

Factors that influence aesthetic results.

Eyebrow:

What affects outcomes

Heading:

Results depend on several factors

Body copy:

No single treatment exists in isolation. Results may be influenced by the starting point, the indication, the protocol and how care is followed.

Cards:

1. Skin characteristics
   Individual skin context matters.

2. Professional indication
   The care path should match evaluation.

3. Protocol
   Details and planning influence the process.

4. Number of sessions
   Some care paths require staged planning.

5. Aftercare
   Guidance after care supports the process.

6. Daily routine
   Habits may influence skin quality and comfort.

Internal links:

* /faq/
* /care/
* /consultation/

Build variation instruction:

Vary as factor wheel, stacked cards, editorial explanation, visual equation, or expectation map.

---

## RESULTS SECTION 03 — Responsible Expectations

HTML comment:

```html
<!-- RESULTS 03: Responsible Expectations — state clearly that individual results cannot be promised through website copy. -->
```

Data attributes:

```html
data-section-id="results-responsible-expectations"
data-section-type="ethics"
data-content-module="no-guarantees"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-clarity"
```

Image prompt:

Quiet legal-ethical communication panel with ivory paper, sage background and bronze detail, premium editorial design.

Alt text:

Responsible expectations statement for aesthetic care.

Eyebrow:

Clear communication

Heading:

No website can promise an individual result

Body copy:

Results may vary from person to person. Responsible care begins with honest communication before any protocol is chosen.

Internal links:

* /legal/
* /faq/
* /consultation/

Build variation instruction:

This section should be visually strong but calm. Use a statement panel, editorial pull quote, split explanation, or calm ethics note.

---

## RESULTS SECTION 04 — Before-and-After Ethics

HTML comment:

```html
<!-- RESULTS 04: Before-and-After Ethics — explain that result images require consent, context and responsible use. -->
```

Data attributes:

```html
data-section-id="results-before-after-ethics"
data-section-type="privacy-ethics"
data-content-module="before-after-consent"
data-layout-signature="unique-per-concept"
data-visual-role="consent-awareness"
```

Image prompt:

Abstract image consent visual with empty image frames, sage privacy cards, ivory background and refined bronze linework.

Alt text:

Consent-aware visual for before-and-after image ethics.

Eyebrow:

Image ethics

Heading:

Images require consent and context

Body copy:

Before-and-after images should never be invented or used without authorisation. Privacy, consent and context matter.

Internal links:

* /testimonials/
* /privacy/
* /legal/

Build variation instruction:

Never use fake patient photos. Use abstract frames, privacy cards, consent notes or elegant empty image placeholders.

---

## RESULTS SECTION 05 — Progress Over Promises

HTML comment:

```html
<!-- RESULTS 05: Progress Over Promises — position responsible care as planned, guided and individual. -->
```

Data attributes:

```html
data-section-id="results-progress-over-promises"
data-section-type="education"
data-content-module="progress-not-promises"
data-layout-signature="unique-per-concept"
data-visual-role="expectation-education"
```

Image prompt:

Layered progress path with soft sage gradients, ivory steps and champagne accents, premium non-medical abstract style.

Alt text:

Abstract progress pathway representing responsible care planning.

Eyebrow:

Progress, not promises

Heading:

Care is planned, not promised

Body copy:

A responsible plan considers the starting point, the goal, the protocol, the response and the aftercare guidance.

Items:

* Starting point
* Goal
* Protocol
* Response
* Aftercare

Internal links:

* /care/
* /skin/
* /laser/

Build variation instruction:

Vary as progress path, layered cards, statement sequence, or editorial “from goal to guidance” panel.

---

## RESULTS SECTION 06 — Approved Testimonials Area

HTML comment:

```html
<!-- RESULTS 06: Approved Testimonials Area — reserve space for authorised feedback without inventing testimonials. -->
```

Data attributes:

```html
data-section-id="results-approved-testimonials"
data-section-type="testimonials-placeholder"
data-content-module="approved-feedback-only"
data-layout-signature="unique-per-concept"
data-visual-role="trust-with-consent"
```

Image prompt:

Elegant approved-feedback area with empty testimonial cards, sage and ivory palette, privacy-first visual style.

Alt text:

Approved testimonial area awaiting authorised feedback.

Eyebrow:

Feedback with consent

Heading:

Feedback shared responsibly

Body copy:

Approved testimonials can be added here once authorised for publication. Feedback should never be used to guarantee another person’s outcome.

CTA:

View testimonials

Internal links:

* /testimonials/
* /privacy/
* /results/

Build variation instruction:

This should not look empty or broken. Use a tasteful consent-aware placeholder, not fake reviews.

---

## RESULTS SECTION 07 — Results FAQ

HTML comment:

```html
<!-- RESULTS 07: Results FAQ — answer outcome-related questions with realistic language. -->
```

Data attributes:

```html
data-section-id="results-faq"
data-section-type="faq"
data-content-module="results-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Minimal results FAQ cards with sage panels, ivory background and abstract progress lines.

Alt text:

Questions about realistic aesthetic results.

Eyebrow:

Results questions

Heading:

Questions about outcomes

FAQs:

1. Can results be guaranteed?
   No. Results vary.

2. What affects results?
   Skin, indication, protocol, sessions and aftercare.

3. Are before-and-after images always shown?
   Only when authorised and used responsibly.

4. Should I evaluate first?
   Yes. Evaluation helps define realistic expectations.

CTA:

Read all questions

Internal links:

* /faq/
* /consultation/
* /legal/

Build variation instruction:

Vary FAQ display from other pages. Use result-focused cards, accordion, ethical Q&A panel, or split note layout.

---

## RESULTS SECTION 08 — Related Pages

HTML comment:

```html
<!-- RESULTS 08: Related Pages — connect results expectations to Care, Laser, Skin and Consultation. -->
```

Data attributes:

```html
data-section-id="results-related-pages"
data-section-type="internal-navigation"
data-content-module="results-related-care"
data-layout-signature="unique-per-concept"
data-visual-role="site-navigation"
```

Image prompt:

Premium related-page cards for care, laser, skin and consultation with sage, ivory and champagne tones.

Alt text:

Related pages for understanding care, laser, skin and consultation.

Eyebrow:

Understand the full context

Heading:

Explore the care journey around results

Cards:

1. Care
   How the process works.
   Link: /care/

2. Laser
   Technology guided by evaluation.
   Link: /laser/

3. Skin
   Skin quality and guidance.
   Link: /skin/

4. Consultation
   The first step.
   Link: /consultation/

Internal links:

* /care/
* /laser/
* /skin/
* /consultation/

Build variation instruction:

Use a related-page section that differs from Care page related paths. Consider a four-panel editorial index or quiet navigation strip.

---

## RESULTS SECTION 09 — Consultation CTA

HTML comment:

```html
<!-- RESULTS 09: Consultation CTA — invite users to begin with realistic guidance. -->
```

Data attributes:

```html
data-section-id="results-consultation-cta"
data-section-type="cta"
data-content-module="realistic-guidance-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium realistic guidance card with abstract progress visual, sage background and ivory CTA panel.

Alt text:

Consultation request for realistic aesthetic guidance.

Eyebrow:

Begin responsibly

Heading:

Begin with realistic guidance

Body copy:

Request evaluation to discuss your goals and understand what may be suitable.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

CTA must match the Results page tone: thoughtful, calm, responsible, not sales-heavy.

---

# CONSULTATION PAGE

## SEO title

Professional Evaluation in Londrina | Franciele Sofiati

## Meta description

Request professional evaluation with Franciele Sofiati in Londrina, PR, to discuss skin, laser care and personalised aesthetic guidance.

## H1

Begin with a professional evaluation

---

## CONSULTATION SECTION 01 — Hero

HTML comment:

```html
<!-- CONSULTATION 01: Hero — introduce evaluation as the first step before choosing a care path. -->
```

Data attributes:

```html
data-section-id="consultation-hero"
data-section-type="hero"
data-content-module="evaluation-request-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="conversion-entry"
```

Image prompt:

Premium consultation desk scene with ivory paper, sage botanical detail and calm professional atmosphere.

Alt text:

Consultation setting for professional aesthetic evaluation.

Eyebrow:

Professional evaluation

Heading:

The first step is understanding

Body copy:

Evaluation helps clarify your goals, skin characteristics, suitability and the safest next step.

Primary CTA:

Send request

Secondary CTA:

View contact options

Internal links:

* /contact/
* /faq/
* /privacy/

Build variation instruction:

Consultation page should feel practical but premium. Use forms, note cards, intake-style panels, or image-led request layouts.

---

## CONSULTATION SECTION 02 — What Evaluation Clarifies

HTML comment:

```html
<!-- CONSULTATION 02: Evaluation Clarifies — show what consultation can help organise before care is chosen. -->
```

Data attributes:

```html
data-section-id="consultation-clarifies"
data-section-type="education"
data-content-module="what-evaluation-clarifies"
data-layout-signature="unique-per-concept"
data-visual-role="decision-support"
```

Image prompt:

Premium evaluation clarity cards with sage, ivory and bronze details, calm clinical-luxury design.

Alt text:

Cards showing what professional evaluation can clarify.

Eyebrow:

What evaluation helps clarify

Heading:

What evaluation can help clarify

Cards:

1. Your goals
   What you want to improve and why.

2. Skin characteristics
   What needs to be observed before planning.

3. Suitability
   Whether a care path may be appropriate.

4. Protocol options
   What may be discussed after assessment.

5. Preparation
   What should be considered before care.

6. Aftercare
   What guidance may be needed after sessions.

Internal links:

* /care/
* /results/
* /faq/

Build variation instruction:

Vary between card layout, checklist, icon panel, intake guide, or educational split section.

---

## CONSULTATION SECTION 03 — How It Works

HTML comment:

```html
<!-- CONSULTATION 03: How It Works — explain the consultation request flow clearly. -->
```

Data attributes:

```html
data-section-id="consultation-how-it-works"
data-section-type="process"
data-content-module="consultation-process"
data-layout-signature="unique-per-concept"
data-visual-role="practical-clarity"
```

Image prompt:

Elegant consultation process pathway with ivory cards, sage lines and champagne numbering.

Alt text:

Step-by-step consultation request process.

Eyebrow:

How it works

Heading:

A simple consultation path

Steps:

1. Send your request
2. Describe your goals
3. Receive guidance
4. Attend evaluation
5. Discuss suitable options

Internal links:

* /faq/
* /privacy/
* /contact/

Build variation instruction:

Use a different process style from Care page. This should feel like an intake journey, not a service journey.

---

## CONSULTATION SECTION 04 — What to Prepare

HTML comment:

```html
<!-- CONSULTATION 04: What to Prepare — tell visitors what information helps the first response. -->
```

Data attributes:

```html
data-section-id="consultation-what-to-prepare"
data-section-type="preparation"
data-content-module="message-preparation"
data-layout-signature="unique-per-concept"
data-visual-role="form-support"
```

Image prompt:

Premium message preparation checklist with smartphone, ivory note card, sage botanical detail and warm light.

Alt text:

Checklist of what to include in a consultation request.

Eyebrow:

Before sending

Heading:

What to share in your message

Cards:

1. Main concern
   Briefly describe what you would like to discuss.

2. Treatment interest
   Mention laser, skin care or another care path if relevant.

3. Previous procedures
   Share relevant context if applicable.

4. Sensitivities or questions
   Mention anything you feel is important.

5. Preferred contact method
   Tell us how you prefer to be contacted.

Internal links:

* /contact/
* /faq/
* /privacy/

Build variation instruction:

This can be an intake checklist, message guide, card stack beside form, or small notes under the form.

---

## CONSULTATION SECTION 05 — Consultation Form

HTML comment:

```html
<!-- CONSULTATION 05: Form — collect basic consultation request details using the approved Formspree endpoint. -->
```

Data attributes:

```html
data-section-id="consultation-form"
data-section-type="form"
data-content-module="consultation-request-form"
data-layout-signature="unique-per-concept"
data-visual-role="primary-conversion"
```

Image prompt:

Elegant form layout visual with sage border, ivory form fields, bronze focus states and premium clinical style.

Alt text:

Consultation request form for Franciele Sofiati.

Eyebrow:

Request evaluation

Heading:

Send a consultation request

Body copy:

Use the form to share your contact details and the reason for your request. Your message helps organise the first response.

Form endpoint:

https://formspree.io/f/xzdldkjy

Form fields:

* Name
* WhatsApp
* Email
* Treatment interest
* Message
* Privacy acknowledgement

Button text:

Send request

Form note:

Your information will be used to respond to your request and guide the next contact.

Internal links:

* /privacy/
* /contact/
* /legal/

Build variation instruction:

Forms may have different layouts across concepts, but must remain accessible, labelled, mobile-friendly and connected to the same endpoint.

---

## CONSULTATION SECTION 06 — Privacy Note

HTML comment:

```html
<!-- CONSULTATION 06: Privacy Note — reassure visitors about responsible use of contact information. -->
```

Data attributes:

```html
data-section-id="consultation-privacy-note"
data-section-type="privacy-note"
data-content-module="responsible-information-use"
data-layout-signature="unique-per-concept"
data-visual-role="trust-reassurance"
```

Image prompt:

Minimal privacy note card with sage lock icon, ivory background and bronze divider.

Alt text:

Privacy note for consultation information.

Eyebrow:

Privacy

Heading:

Your information should be handled responsibly

Body copy:

Contact details and messages should be used only to respond to your request and support communication about evaluation.

Internal links:

* /privacy/
* /legal/
* /contact/

Build variation instruction:

Keep this concise. It can be a note under the form, a side card, or a small trust panel.

---

## CONSULTATION SECTION 07 — Contact Alternatives

HTML comment:

```html
<!-- CONSULTATION 07: Contact Alternatives — provide alternative routes for visitors who do not want to use the form. -->
```

Data attributes:

```html
data-section-id="consultation-contact-alternatives"
data-section-type="contact-options"
data-content-module="alternative-contact-routes"
data-layout-signature="unique-per-concept"
data-visual-role="contact-access"
```

Image prompt:

Premium contact route cards with WhatsApp, email and Instagram references, sage and ivory palette.

Alt text:

Alternative contact routes for Franciele Sofiati.

Eyebrow:

Other contact routes

Heading:

Prefer another route?

Items:

* WhatsApp: (43) 9 9104-3536
* Email: [sofiatimendonca@gmail.com](mailto:sofiatimendonca@gmail.com)
* Instagram: @fransofiati_biomedica
* Londrina, PR

CTA:

Contact Franciele

Internal links:

* /contact/

Build variation instruction:

Vary this from Contact page. Use compact route cards, a horizontal strip, or small contact sidebar.

---

## CONSULTATION SECTION 08 — First Evaluation Questions

HTML comment:

```html
<!-- CONSULTATION 08: First Evaluation Questions — answer practical questions before the first evaluation. -->
```

Data attributes:

```html
data-section-id="consultation-first-questions"
data-section-type="faq"
data-content-module="first-evaluation-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Elegant first-visit FAQ cards with sage background, ivory question panels and soft botanical shadow.

Alt text:

Questions before first professional evaluation.

Eyebrow:

Before your first evaluation

Heading:

Before your first evaluation

FAQs:

1. What should I send first?
   Your main concern, goals and contact details.

2. Can I choose a protocol before evaluation?
   Evaluation is recommended before deciding.

3. Is online contact enough?
   Online contact helps begin, but it does not replace assessment.

Internal links:

* /faq/
* /care/
* /results/

Build variation instruction:

Use a compact FAQ style because the page already contains form content.

---

## CONSULTATION SECTION 09 — Evaluation Reminder

HTML comment:

```html
<!-- CONSULTATION 09: Evaluation Reminder — clarify that online information does not replace professional assessment. -->
```

Data attributes:

```html
data-section-id="consultation-evaluation-reminder"
data-section-type="disclaimer"
data-content-module="online-information-limit"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-clarity"
```

Image prompt:

Quiet educational disclaimer panel with ivory paper, sage background and refined bronze line.

Alt text:

Reminder that online information does not replace evaluation.

Eyebrow:

Important note

Heading:

Online information does not replace assessment

Body copy:

The website can guide your first questions, but individual care decisions should be made after professional evaluation.

Internal links:

* /results/
* /legal/
* /faq/

Build variation instruction:

Keep this visible but elegant. It should not feel like legal clutter.

---

# CONTACT PAGE

## SEO title

Contact Franciele Sofiati | Londrina, PR

## Meta description

Contact Franciele Sofiati in Londrina, PR, through WhatsApp, email or Instagram to request professional evaluation.

## H1

Contact Franciele Sofiati

---

## CONTACT SECTION 01 — Hero

HTML comment:

```html
<!-- CONTACT 01: Hero — introduce the easiest ways to contact Franciele Sofiati. -->
```

Data attributes:

```html
data-section-id="contact-hero"
data-section-type="hero"
data-content-module="contact-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="contact-entry"
```

Image prompt:

Premium contact card scene, sage and ivory stationery, botanical detail, warm professional lighting.

Alt text:

Contact card for Franciele Sofiati.

Eyebrow:

Contact

Heading:

Choose the easiest way to start

Body copy:

Send a message with your goals, questions or treatment interest so the next step can be guided clearly.

Primary CTA:

Request evaluation

Secondary CTA:

View contact routes

Internal links:

* /consultation/
* /faq/
* /privacy/

Build variation instruction:

Contact page should feel practical and easy, not heavy. Use direct route cards, contact panel, or warm editorial contact section.

---

## CONTACT SECTION 02 — Contact Routes

HTML comment:

```html
<!-- CONTACT 02: Contact Routes — show official contact details clearly and accessibly. -->
```

Data attributes:

```html
data-section-id="contact-routes"
data-section-type="contact-details"
data-content-module="official-contact-details"
data-layout-signature="unique-per-concept"
data-visual-role="practical-access"
```

Image prompt:

Premium contact route cards with WhatsApp, email, Instagram and location markers in sage and ivory.

Alt text:

Official contact routes for Franciele Sofiati.

Eyebrow:

Official contact details

Heading:

Contact routes

Items:

* WhatsApp: (43) 9 9104-3536
* Email: [sofiatimendonca@gmail.com](mailto:sofiatimendonca@gmail.com)
* Instagram: @fransofiati_biomedica
* Location: Londrina, PR

External links:

* https://wa.me/5543991043536
* mailto:sofiatimendonca@gmail.com
* https://www.instagram.com/fransofiati_biomedica/

Internal links:

* /consultation/
* /privacy/

Build variation instruction:

Make these details easy to scan. Vary layout as route cards, directory panel, split contact list, compact contact strip or icon-based contact area.

---

## CONTACT SECTION 03 — Best Way to Start

HTML comment:

```html
<!-- CONTACT 03: Best Route — help visitors choose the right contact channel. -->
```

Data attributes:

```html
data-section-id="contact-best-route"
data-section-type="guidance"
data-content-module="best-contact-route"
data-layout-signature="unique-per-concept"
data-visual-role="contact-decision-support"
```

Image prompt:

Elegant communication route cards with phone, email and social icons in sage, ivory and champagne tones.

Alt text:

Contact route guidance for WhatsApp, email, form and Instagram.

Eyebrow:

Choose a route

Heading:

What route should I use?

Cards:

1. WhatsApp
   For a quick first contact.

2. Email
   For more detailed questions.

3. Form
   For structured evaluation requests.

4. Instagram
   For social updates and direct contact.

Internal links:

* /consultation/
* /privacy/
* /faq/

Build variation instruction:

This should not duplicate Contact Routes visually. Use comparison cards, “best for” labels, route selector, or calm guidance panel.

---

## CONTACT SECTION 04 — What to Include

HTML comment:

```html
<!-- CONTACT 04: Message Guidance — explain what visitors should include in a first message. -->
```

Data attributes:

```html
data-section-id="contact-what-to-include"
data-section-type="preparation"
data-content-module="message-guidance"
data-layout-signature="unique-per-concept"
data-visual-role="message-quality"
```

Image prompt:

Premium first-message checklist with smartphone, ivory card, sage surface and botanical shadow.

Alt text:

Checklist of what to include in a first contact message.

Eyebrow:

First message

Heading:

Help the first response be clearer

Cards:

1. Your main concern
   Briefly explain what you would like to discuss.

2. Your treatment interest
   Mention care, laser, skin guidance or another question.

3. Previous procedures if relevant
   Add context that may help the conversation.

4. Questions you want to ask
   Include doubts you would like clarified.

5. Best contact method
   Say how you prefer to receive a response.

Internal links:

* /faq/
* /consultation/
* /privacy/

Build variation instruction:

Use a practical guide style. It can be a checklist, example message structure, side note or compact pre-contact block.

---

## CONTACT SECTION 05 — Contact Form

HTML comment:

```html
<!-- CONTACT 05: Contact Form — provide a structured contact option using the approved Formspree endpoint. -->
```

Data attributes:

```html
data-section-id="contact-form"
data-section-type="form"
data-content-module="contact-message-form"
data-layout-signature="unique-per-concept"
data-visual-role="secondary-conversion"
```

Image prompt:

Elegant contact form design with sage border, ivory fields, bronze focus state and premium clinical look.

Alt text:

Contact form for Franciele Sofiati.

Eyebrow:

Send a message

Heading:

Send a structured message

Body copy:

Use the form if you prefer to organise your request before sending.

Form endpoint:

https://formspree.io/f/xzdldkjy

Form fields:

* Name
* WhatsApp
* Email
* Message
* Privacy acknowledgement

Button text:

Send message

Form note:

Your information will be used to respond to your request.

Internal links:

* /privacy/
* /legal/
* /consultation/

Build variation instruction:

Contact form can be simpler than Consultation form but must remain accessible, labelled and mobile-friendly.

---

## CONTACT SECTION 06 — Location Note

HTML comment:

```html
<!-- CONTACT 06: Location Note — provide location context without publishing a full address. -->
```

Data attributes:

```html
data-section-id="contact-location-note"
data-section-type="location"
data-content-module="londrina-location-only"
data-layout-signature="unique-per-concept"
data-visual-role="location-context"
```

Image prompt:

Elegant Londrina location card with abstract map texture, sage and ivory palette, no exact address pin.

Alt text:

Location note for Franciele Sofiati in Londrina, PR.

Eyebrow:

Location

Heading:

Based in Londrina, PR

Body copy:

Franciele Sofiati is based in Londrina, Paraná. Full address details should only be shared when appropriate for confirmed appointments.

Internal links:

* /consultation/
* /contact/
* /privacy/

Build variation instruction:

Do not add a map with full address. Use abstract location visuals only.

---

## CONTACT SECTION 07 — Responsible Reminder

HTML comment:

```html
<!-- CONTACT 07: Responsible Reminder — clarify that contact begins the conversation but does not replace evaluation. -->
```

Data attributes:

```html
data-section-id="contact-responsible-reminder"
data-section-type="disclaimer"
data-content-module="contact-does-not-replace-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-clarity"
```

Image prompt:

Minimal responsibility note with ivory card, sage background and bronze linework.

Alt text:

Reminder that online contact does not replace professional evaluation.

Eyebrow:

Important note

Heading:

Contact starts the conversation

Body copy:

Online contact can help organise your questions, but it does not replace professional evaluation.

Internal links:

* /legal/
* /faq/
* /consultation/

Build variation instruction:

Keep this short and visible, not heavy.

---

## CONTACT SECTION 08 — Contact FAQ

HTML comment:

```html
<!-- CONTACT 08: Contact FAQ — answer practical contact questions. -->
```

Data attributes:

```html
data-section-id="contact-faq"
data-section-type="faq"
data-content-module="contact-questions"
data-layout-signature="unique-per-concept"
data-visual-role="objection-handling"
```

Image prompt:

Contact FAQ cards in sage, ivory and champagne tones, premium accessible design.

Alt text:

Questions about contacting Franciele Sofiati.

Eyebrow:

Contact questions

Heading:

Contact questions

FAQs:

1. Can I send a WhatsApp message first?
   Yes, WhatsApp is available for first contact.

2. Should I describe my concern?
   Yes. A short description helps guide the response.

3. Is the address public?
   Use Londrina, PR only unless address sharing is approved.

4. Can I ask about suitability online?
   Suitability depends on evaluation.

Internal links:

* /faq/
* /consultation/
* /privacy/

Build variation instruction:

Use a compact layout. This should support contact, not dominate the page.

---

# MISSION PAGE

## SEO title

Mission | Franciele Sofiati

## Meta description

Discover the mission behind Sofiati care: professional evaluation, responsible guidance and aesthetic care with precision in Londrina.

## H1

Care with precision, safety and responsibility

---

## MISSION SECTION 01 — Hero

HTML comment:

```html
<!-- MISSION 01: Hero — present the mission behind Sofiati's evaluation-led care. -->
```

Data attributes:

```html
data-section-id="mission-hero"
data-section-type="hero"
data-content-module="mission-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="brand-purpose"
```

Image prompt:

Premium mission hero with sage botanical shadows, ivory background, refined professional typography and calm clinical-luxury mood.

Alt text:

Mission visual for evaluation-led aesthetic care.

Eyebrow:

Mission

Heading:

Aesthetic care should begin with understanding

Body copy:

The mission of Sofiati care is to guide aesthetic decisions through evaluation, clarity and responsibility.

Primary CTA:

Request evaluation

Secondary CTA:

View values

Internal links:

* /about/
* /values/
* /consultation/

Build variation instruction:

Mission page should feel more manifesto-like than service pages. Use editorial statements, values imagery, and calm brand storytelling.

---

## MISSION SECTION 02 — Purpose

HTML comment:

```html
<!-- MISSION 02: Purpose — explain why evaluation-led care matters. -->
```

Data attributes:

```html
data-section-id="mission-purpose"
data-section-type="purpose"
data-content-module="why-evaluation-led-care"
data-layout-signature="unique-per-concept"
data-visual-role="mission-clarity"
```

Image prompt:

Elegant purpose cards with sage and ivory surfaces, bronze accents and botanical clinical linework.

Alt text:

Purpose cards explaining evaluation-led care.

Eyebrow:

Purpose

Heading:

Why evaluation-led care matters

Body copy:

Care becomes more responsible when the person, the skin and the goal are understood before any protocol is suggested.

Internal links:

* /care/
* /values/
* /results/

Build variation instruction:

Vary as a large statement, manifesto block, image card, quiet split section, or purpose pillars.

---

## MISSION SECTION 03 — Technology With Judgement

HTML comment:

```html
<!-- MISSION 03: Technology With Judgement — position technology as a tool guided by professional criteria. -->
```

Data attributes:

```html
data-section-id="mission-technology-judgement"
data-section-type="philosophy"
data-content-module="technology-guided-by-judgement"
data-layout-signature="unique-per-concept"
data-visual-role="technology-positioning"
```

Image prompt:

Abstract technology and botanical visual with soft laser light, sage surfaces, ivory depth and champagne lines.

Alt text:

Technology guided by professional judgement in aesthetic care.

Eyebrow:

Technology and judgement

Heading:

Technology supports care, but judgement leads it

Body copy:

Laser and aesthetic technologies can be valuable tools, but professional indication must guide their use.

Internal links:

* /laser/
* /skin/
* /consultation/

Build variation instruction:

This can be an abstract laser section, balanced “tool vs judgement” panel, or editorial technology note.

---

## MISSION SECTION 04 — Education Before Decision

HTML comment:

```html
<!-- MISSION 04: Education Before Decision — connect the mission to Journal and Blog content. -->
```

Data attributes:

```html
data-section-id="mission-education-before-decision"
data-section-type="education"
data-content-module="education-before-decision"
data-layout-signature="unique-per-concept"
data-visual-role="seo-education"
```

Image prompt:

Premium educational article still life with journal cards, consultation notes, sage botanical accent and ivory background.

Alt text:

Educational notes helping visitors prepare for evaluation.

Eyebrow:

Education

Heading:

Informed visitors ask better questions

Body copy:

Educational content helps visitors understand care paths, expectations and the importance of evaluation.

Internal links:

* /journal/
* /blog/
* /faq/

Build variation instruction:

Vary as featured article cards, learning pathway, editorial note or compact education rail.

---

## MISSION SECTION 05 — Responsibility in Practice

HTML comment:

```html
<!-- MISSION 05: Responsibility in Practice — explain how responsibility appears from consultation to aftercare. -->
```

Data attributes:

```html
data-section-id="mission-responsibility-practice"
data-section-type="values"
data-content-module="responsibility-in-practice"
data-layout-signature="unique-per-concept"
data-visual-role="care-ethics"
```

Image prompt:

Elegant responsibility checklist with sage, ivory and champagne elements, calm premium clinical design.

Alt text:

Responsibility checklist for aesthetic care.

Eyebrow:

Responsibility

Heading:

Responsibility appears in every step

Body copy:

From consultation to aftercare, the goal is to communicate clearly and avoid unrealistic promises.

Items:

* Clear guidance
* Professional indication
* Realistic expectations
* Aftercare support
* Privacy and consent

Internal links:

* /results/
* /faq/
* /privacy/

Build variation instruction:

This can be a checklist, values block, ethics panel, or care journey overlay.

---

## MISSION SECTION 06 — Related Values

HTML comment:

```html
<!-- MISSION 06: Related Values — bridge the Mission page to the Values page. -->
```

Data attributes:

```html
data-section-id="mission-related-values"
data-section-type="internal-navigation"
data-content-module="mission-values-bridge"
data-layout-signature="unique-per-concept"
data-visual-role="brand-navigation"
```

Image prompt:

Premium values cards with sage botanical linework, ivory backgrounds and bronze typography accents.

Alt text:

Values behind the Sofiati mission.

Eyebrow:

Values behind the mission

Heading:

The values behind the mission

Body copy:

Precision, safety, naturalness and responsibility shape how care is discussed and planned.

CTA:

View values

Internal links:

* /values/
* /about/
* /care/

Build variation instruction:

Make this a bridge section, not a duplicate of Values page.

---

## MISSION SECTION 07 — Consultation CTA

HTML comment:

```html
<!-- MISSION 07: Consultation CTA — invite visitors to begin with a careful first step. -->
```

Data attributes:

```html
data-section-id="mission-consultation-cta"
data-section-type="cta"
data-content-module="mission-evaluation-request"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Elegant evaluation request card with botanical clinical luxury, sage background and ivory CTA panel.

Alt text:

Evaluation request guided by the Sofiati mission.

Eyebrow:

Begin carefully

Heading:

Begin with a careful first step

Body copy:

Request professional evaluation to discuss your goals with clarity and responsibility.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

CTA should feel mission-led and calm, not sales-heavy.

---

# VALUES PAGE

## SEO title

Values | Franciele Sofiati

## Meta description

Explore the values behind Sofiati care: precision, safety, responsibility, naturalness and professional judgement.

## H1

Values that guide every care decision

---

## VALUES SECTION 01 — Hero

HTML comment:

```html
<!-- VALUES 01: Hero — introduce the principles behind Sofiati care. -->
```

Data attributes:

```html
data-section-id="values-hero"
data-section-type="hero"
data-content-module="values-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="brand-principles"
```

Image prompt:

Premium values hero with sage and ivory layers, botanical linework, bronze accents and calm editorial composition.

Alt text:

Values guiding Sofiati aesthetic care.

Eyebrow:

Values

Heading:

Principles before protocols

Body copy:

The values behind Sofiati care help keep communication clear, expectations responsible and decisions centred on evaluation.

Primary CTA:

Request evaluation

Secondary CTA:

View mission

Internal links:

* /mission/
* /about/
* /consultation/

Build variation instruction:

Values page should feel like a brand manifesto. Use principles, editorial cards, bold typography, and varied visual hierarchy.

---

## VALUES SECTION 02 — Core Values

HTML comment:

```html
<!-- VALUES 02: Core Values — list the principles that guide care decisions. -->
```

Data attributes:

```html
data-section-id="values-core"
data-section-type="values-list"
data-content-module="core-values"
data-layout-signature="unique-per-concept"
data-visual-role="principle-index"
```

Image prompt:

Eight elegant value cards in sage, ivory and champagne tones with botanical line icons and refined typography.

Alt text:

Core values including precision, safety, responsibility and naturalness.

Eyebrow:

Core values

Heading:

The values behind the care experience

Cards:

1. Precision
   Clear assessment before action.

2. Safety
   Professional criteria before indication.

3. Responsibility
   Honest expectations and careful guidance.

4. Naturalness
   Care that respects balance.

5. Individuality
   No one-size-fits-all protocol.

6. Clarity
   Communication that helps decisions.

7. Warmth
   A calm and respectful experience.

8. Professional judgement
   Technology guided by evaluation.

Internal links:

* /care/
* /consultation/
* /results/

Build variation instruction:

Do not use a basic eight-card grid in every concept. Try staggered cards, values wheel, vertical manifesto, editorial list, or split text-image layout.

---

## VALUES SECTION 03 — Values in Evaluation

HTML comment:

```html
<!-- VALUES 03: Values in Evaluation — show that values begin during assessment. -->
```

Data attributes:

```html
data-section-id="values-in-evaluation"
data-section-type="philosophy"
data-content-module="values-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="evaluation-principle"
```

Image prompt:

Calm professional evaluation scene with sage botanical detail, ivory paper and bronze accents.

Alt text:

Evaluation scene representing values in aesthetic care.

Eyebrow:

Evaluation

Heading:

Evaluation is where values begin

Body copy:

Assessment helps transform general interest into a more responsible conversation about suitability and goals.

Internal links:

* /consultation/
* /faq/
* /care/

Build variation instruction:

This can be a statement block, visual note, split section, or values-to-process bridge.

---

## VALUES SECTION 04 — Values in Protocols

HTML comment:

```html
<!-- VALUES 04: Values in Protocols — explain that protocols should reflect the individual. -->
```

Data attributes:

```html
data-section-id="values-in-protocols"
data-section-type="method"
data-content-module="values-protocols"
data-layout-signature="unique-per-concept"
data-visual-role="individualised-care"
```

Image prompt:

Personalised protocol cards in sage and ivory tones, premium clinical-luxury composition.

Alt text:

Protocol planning guided by individual evaluation.

Eyebrow:

Protocols

Heading:

Protocols should reflect the person

Body copy:

A responsible plan considers individual characteristics, desired outcomes and professional indication.

Internal links:

* /care/
* /results/
* /skin/

Build variation instruction:

Use protocol cards, editorial explanation, layered decision map or quiet care-planning visual.

---

## VALUES SECTION 05 — Values in Aftercare

HTML comment:

```html
<!-- VALUES 05: Values in Aftercare — explain that responsible care continues after the session. -->
```

Data attributes:

```html
data-section-id="values-in-aftercare"
data-section-type="aftercare"
data-content-module="values-aftercare"
data-layout-signature="unique-per-concept"
data-visual-role="post-care-values"
```

Image prompt:

Soft aftercare visual with skincare texture, sage botanical accent and ivory towel, premium calm atmosphere.

Alt text:

Aftercare guidance as part of responsible aesthetic care.

Eyebrow:

Aftercare

Heading:

Care continues after the session

Body copy:

Aftercare guidance supports comfort, consistency and realistic expectations.

Internal links:

* /laser/
* /skin/
* /results/

Build variation instruction:

This section can be soft and warm. Use aftercare notes, gentle checklist or calming image-led layout.

---

## VALUES SECTION 06 — Trust CTA

HTML comment:

```html
<!-- VALUES 06: Trust CTA — invite visitors to see how the approach works in practice. -->
```

Data attributes:

```html
data-section-id="values-trust-cta"
data-section-type="cta"
data-content-module="values-next-step"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium CTA card with sage background, ivory typography panel and botanical clinical detail.

Alt text:

Invitation to meet Franciele or request evaluation.

Eyebrow:

Next step

Heading:

See how the approach works

Body copy:

Learn more about Franciele or begin with a professional evaluation.

Primary CTA:

Meet Franciele

Secondary CTA:

Request evaluation

Internal links:

* /about/
* /consultation/
* /contact/

Build variation instruction:

Use a different CTA structure from Mission. This can be dual-option, profile-led, or calm end-panel.

---

# TESTIMONIALS PAGE

## SEO title

Testimonials | Franciele Sofiati

## Meta description

Patient feedback and experience themes shared responsibly, with privacy, consent and realistic expectations.

## H1

Patient feedback shared with responsibility

---

## TESTIMONIALS SECTION 01 — Hero

HTML comment:

```html
<!-- TESTIMONIALS 01: Hero — introduce testimonials with privacy, consent and realistic expectations. -->
```

Data attributes:

```html
data-section-id="testimonials-hero"
data-section-type="hero"
data-content-module="responsible-testimonials-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="trust-with-boundaries"
```

Image prompt:

Premium testimonial hero with soft empty quote cards, sage and ivory palette, privacy-first visual style, no fake review imagery.

Alt text:

Responsible testimonial area for authorised feedback.

Eyebrow:

Testimonials

Heading:

Feedback must be treated with care

Body copy:

Testimonials should only be published when authorised and should never be used to guarantee another person’s outcome.

Primary CTA:

Request evaluation

Secondary CTA:

Understand results

Internal links:

* /results/
* /consultation/
* /privacy/

Build variation instruction:

Do not invent testimonials. Make the page feel intentionally consent-aware, not empty or unfinished.

---

## TESTIMONIALS SECTION 02 — Approved Testimonials

HTML comment:

```html
<!-- TESTIMONIALS 02: Approved Testimonials — reserve space for authorised patient feedback only. -->
```

Data attributes:

```html
data-section-id="testimonials-approved"
data-section-type="testimonials-placeholder"
data-content-module="approved-feedback-only"
data-layout-signature="unique-per-concept"
data-visual-role="authorised-social-proof"
```

Image prompt:

Elegant approved testimonial cards with neutral quote marks, sage background, ivory panels and bronze dividers.

Alt text:

Approved testimonial cards awaiting authorised feedback.

Eyebrow:

Approved feedback

Heading:

Approved testimonials

Body copy:

Approved testimonials can be added here once authorised for publication.

Placeholder card text:

Authorised feedback will appear here when available and approved for publication.

Internal links:

* /privacy/
* /contact/
* /results/

Build variation instruction:

Use tasteful placeholders. Do not show star ratings, fake names, fake dates or invented patient stories.

---

## TESTIMONIALS SECTION 03 — Experience Themes

HTML comment:

```html
<!-- TESTIMONIALS 03: Experience Themes — describe general care experience themes without inventing testimonials. -->
```

Data attributes:

```html
data-section-id="testimonials-experience-themes"
data-section-type="experience"
data-content-module="care-experience-themes"
data-layout-signature="unique-per-concept"
data-visual-role="trust-context"
```

Image prompt:

Premium experience theme cards with sage botanical detail, ivory cards and soft professional atmosphere.

Alt text:

Experience themes for evaluation-led aesthetic care.

Eyebrow:

Experience themes

Heading:

What responsible feedback may reflect

Body copy:

General experience themes can help visitors understand the tone of care without inventing individual stories.

Cards:

1. Clear guidance
   Communication that helps visitors understand the next step.

2. Calm evaluation
   A careful approach before any care path is chosen.

3. Professional care
   Decisions guided by professional criteria.

4. Responsible expectations
   Honest language about results and suitability.

Internal links:

* /values/
* /about/
* /consultation/

Build variation instruction:

This section can provide trust without fake testimonials. Use experience pillars, values cards, or calm explanatory layout.

---

## TESTIMONIALS SECTION 04 — Privacy and Consent

HTML comment:

```html
<!-- TESTIMONIALS 04: Privacy and Consent — explain that feedback and images require permission. -->
```

Data attributes:

```html
data-section-id="testimonials-privacy-consent"
data-section-type="privacy-ethics"
data-content-module="testimonial-consent"
data-layout-signature="unique-per-concept"
data-visual-role="privacy-trust"
```

Image prompt:

Privacy and consent visual with sage lock icon, ivory quote cards and bronze accent lines.

Alt text:

Privacy and consent for testimonials and feedback.

Eyebrow:

Privacy and consent

Heading:

Privacy comes first

Body copy:

Feedback, images or personal details should only be shared with permission and appropriate context.

Internal links:

* /privacy/
* /legal/
* /results/

Build variation instruction:

Use a trust note, consent card, privacy panel or small legal-ethical explainer.

---

## TESTIMONIALS SECTION 05 — Results Responsibility

HTML comment:

```html
<!-- TESTIMONIALS 05: Results Responsibility — clarify that feedback is not a guarantee of another outcome. -->
```

Data attributes:

```html
data-section-id="testimonials-results-responsibility"
data-section-type="expectations"
data-content-module="feedback-not-guarantee"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-clarity"
```

Image prompt:

Abstract results responsibility visual with sage layers, ivory statement card and no before-and-after imagery.

Alt text:

Responsible expectations statement for patient feedback.

Eyebrow:

Important note

Heading:

Feedback is not a guarantee

Body copy:

Every person responds differently. Testimonials should never replace evaluation or create unrealistic expectations.

Internal links:

* /results/
* /faq/
* /consultation/

Build variation instruction:

Make this short but visible. It should protect against misleading expectations.

---

## TESTIMONIALS SECTION 06 — Consultation CTA

HTML comment:

```html
<!-- TESTIMONIALS 06: Consultation CTA — invite visitors to begin their own evaluation. -->
```

Data attributes:

```html
data-section-id="testimonials-consultation-cta"
data-section-type="cta"
data-content-module="start-own-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Elegant consultation CTA with sage background, ivory card and soft botanical clinical detail.

Alt text:

Consultation request after reading testimonial guidance.

Eyebrow:

Your own path

Heading:

Begin your own evaluation

Body copy:

Start with professional assessment to understand what may be suitable for your skin and goals.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Do not make this feel like “book because others liked it.” Keep it individual and responsible.

---

# FAQ PAGE

## SEO title

FAQ | Franciele Sofiati

## Meta description

Common questions about evaluation, laser care, skin guidance, results, contact and privacy at Sofiati.

## H1

Questions before professional evaluation

---

## FAQ SECTION 01 — Hero

HTML comment:

```html
<!-- FAQ 01: Hero — introduce the FAQ as guidance before professional evaluation. -->
```

Data attributes:

```html
data-section-id="faq-hero"
data-section-type="hero"
data-content-module="faq-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="question-entry"
```

Image prompt:

Premium FAQ hero with ivory question cards, sage background, botanical shadow and bronze line details.

Alt text:

Frequently asked questions before professional evaluation.

Eyebrow:

FAQ

Heading:

Clear answers before the first step

Body copy:

These answers help organise common doubts, but individual care decisions require professional evaluation.

Primary CTA:

Request evaluation

Secondary CTA:

Contact Franciele

Internal links:

* /consultation/
* /contact/
* /care/

Build variation instruction:

FAQ page can be more functional, but still premium. Use searchable accordions, topic blocks, side navigation, or sectioned Q&A.

---

## FAQ SECTION 02 — Consultation Questions

HTML comment:

```html
<!-- FAQ 02: Consultation Questions — answer common questions about starting with evaluation. -->
```

Data attributes:

```html
data-section-id="faq-consultation-questions"
data-section-type="faq-group"
data-content-module="consultation-questions"
data-layout-signature="unique-per-concept"
data-visual-role="practical-guidance"
```

Image prompt:

Consultation FAQ cards with sage and ivory tones, premium clinical-luxury style.

Alt text:

Consultation questions before professional evaluation.

Eyebrow:

Consultation

Heading:

Consultation questions

FAQs:

1. Why does evaluation come first?
   Because suitability depends on individual skin characteristics, goals and history.

2. What should I send first?
   Your concern, treatment interest, contact details and any relevant questions.

3. Can I choose a protocol before evaluation?
   Evaluation is recommended before deciding on a protocol.

Internal links:

* /consultation/
* /privacy/
* /contact/

Build variation instruction:

Vary FAQ groups visually. Each group should be easy to scan.

---

## FAQ SECTION 03 — Laser Questions

HTML comment:

```html
<!-- FAQ 03: Laser Questions — answer laser-specific doubts with suitability and aftercare language. -->
```

Data attributes:

```html
data-section-id="faq-laser-questions"
data-section-type="faq-group"
data-content-module="laser-questions"
data-layout-signature="unique-per-concept"
data-visual-role="laser-clarity"
```

Image prompt:

Laser FAQ visual with abstract champagne laser lines, sage background and ivory question panels.

Alt text:

Laser care questions and suitability guidance.

Eyebrow:

Laser

Heading:

Laser questions

FAQs:

1. Is laser suitable for everyone?
   No. Suitability depends on professional evaluation.

2. Do results vary?
   Yes. Individual characteristics, protocol and aftercare matter.

3. What should I discuss first?
   Skin history, sensitivity, sun exposure and expectations.

Internal links:

* /laser/
* /results/
* /consultation/

Build variation instruction:

Give this section a subtle technology feel, but keep it warm and premium.

---

## FAQ SECTION 04 — Skin Questions

HTML comment:

```html
<!-- FAQ 04: Skin Questions — answer skin-related doubts without diagnosing visitors online. -->
```

Data attributes:

```html
data-section-id="faq-skin-questions"
data-section-type="faq-group"
data-content-module="skin-questions"
data-layout-signature="unique-per-concept"
data-visual-role="skin-education"
```

Image prompt:

Skin FAQ cards with cream, sage and ivory tones, macro texture details and botanical shadow.

Alt text:

Skin care questions before professional evaluation.

Eyebrow:

Skin

Heading:

Skin questions

FAQs:

1. Can this website diagnose my skin?
   No. The content is educational and does not replace evaluation.

2. What if my skin is sensitive?
   Sensitivity should be discussed before any protocol is considered.

3. How do I know what care is suitable?
   Suitability depends on assessment.

Internal links:

* /skin/
* /journal/
* /consultation/

Build variation instruction:

Make this softer than laser questions. Use texture-led visuals or warm FAQ cards.

---

## FAQ SECTION 05 — Results Questions

HTML comment:

```html
<!-- FAQ 05: Results Questions — answer outcome-related questions with realistic expectations. -->
```

Data attributes:

```html
data-section-id="faq-results-questions"
data-section-type="faq-group"
data-content-module="results-questions"
data-layout-signature="unique-per-concept"
data-visual-role="expectation-clarity"
```

Image prompt:

Results FAQ cards with abstract progress lines, sage and ivory palette, no before-and-after images.

Alt text:

Questions about aesthetic results and realistic expectations.

Eyebrow:

Results

Heading:

Results questions

FAQs:

1. Can results be guaranteed?
   No. Results vary from person to person.

2. What influences results?
   Skin characteristics, indication, protocol, sessions and aftercare.

3. Are before-and-after images always used?
   Only when authorised and appropriate.

Internal links:

* /results/
* /legal/
* /care/

Build variation instruction:

Use ethical visuals only. No fake patient imagery.

---

## FAQ SECTION 06 — Booking and Contact Questions

HTML comment:

```html
<!-- FAQ 06: Booking and Contact Questions — answer practical communication questions. -->
```

Data attributes:

```html
data-section-id="faq-booking-contact"
data-section-type="faq-group"
data-content-module="booking-contact-questions"
data-layout-signature="unique-per-concept"
data-visual-role="contact-support"
```

Image prompt:

Contact FAQ visual with WhatsApp, email and Instagram route cards, sage and ivory tones.

Alt text:

Booking and contact questions for Franciele Sofiati.

Eyebrow:

Booking and contact

Heading:

Booking and contact questions

FAQs:

1. Can I start by WhatsApp?
   Yes. WhatsApp is available for first contact.

2. Can I email instead?
   Yes. Email is available for detailed questions.

3. Is the full address listed online?
   No. Use Londrina, PR only unless address sharing is approved.

Internal links:

* /contact/
* /consultation/
* /privacy/

Build variation instruction:

Keep this practical and easy to scan.

---

## FAQ SECTION 07 — Privacy Questions

HTML comment:

```html
<!-- FAQ 07: Privacy Questions — answer basic privacy questions related to forms and contact. -->
```

Data attributes:

```html
data-section-id="faq-privacy-questions"
data-section-type="faq-group"
data-content-module="privacy-questions"
data-layout-signature="unique-per-concept"
data-visual-role="privacy-trust"
```

Image prompt:

Privacy FAQ cards with sage lock icon, ivory background and bronze line details.

Alt text:

Privacy questions about contact information.

Eyebrow:

Privacy

Heading:

Privacy questions

FAQs:

1. How is form information used?
   It is used to respond to your request and support communication.

2. Is contact information public?
   No. Contact details should be handled responsibly.

3. Where can I read more?
   Visit the Privacy page.

Internal links:

* /privacy/
* /legal/
* /contact/

Build variation instruction:

This can be a smaller FAQ section or privacy note block.

---

## FAQ SECTION 08 — Related Pages

HTML comment:

```html
<!-- FAQ 08: Related Pages — guide users to the most useful pages after reading questions. -->
```

Data attributes:

```html
data-section-id="faq-related-pages"
data-section-type="internal-navigation"
data-content-module="faq-related-pages"
data-layout-signature="unique-per-concept"
data-visual-role="site-navigation"
```

Image prompt:

Premium related-page cards for care, laser, skin, results and consultation, sage ivory palette.

Alt text:

Related pages after reading FAQ.

Eyebrow:

Explore next

Heading:

Explore related pages

Cards:

* Care
* Laser
* Skin
* Results
* Consultation

Internal links:

* /care/
* /laser/
* /skin/
* /results/
* /consultation/

Build variation instruction:

Do not make this identical to Results related pages. Use a compact navigation block or page-topic index.

---

## FAQ SECTION 09 — Still Unsure CTA

HTML comment:

```html
<!-- FAQ 09: Still Unsure CTA — invite visitors to request evaluation if they still have questions. -->
```

Data attributes:

```html
data-section-id="faq-still-unsure-cta"
data-section-type="cta"
data-content-module="questions-to-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Elegant question-to-consultation CTA with sage background, ivory card and soft botanical detail.

Alt text:

Invitation to request evaluation after reading common questions.

Eyebrow:

Still unsure?

Heading:

Still unsure where to start?

Body copy:

Request evaluation and share your questions so the next step can be guided responsibly.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Make this CTA question-led, not sales-heavy.

---

# JOURNAL PAGE

## SEO title

Journal | Franciele Sofiati

## Meta description

Educational notes about evaluation, laser care, skin quality, aftercare and responsible aesthetic expectations.

## H1

Educational notes for thoughtful care decisions

---

## JOURNAL SECTION 01 — Hero

HTML comment:

```html
<!-- JOURNAL 01: Hero — introduce the Journal as educational support before choosing care. -->
```

Data attributes:

```html
data-section-id="journal-hero"
data-section-type="hero"
data-content-module="journal-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="education-entry"
```

Image prompt:

Premium journal hero with article cards, consultation notes, sage botanical detail and ivory editorial background.

Alt text:

Educational journal notes about evaluation and aesthetic care.

Eyebrow:

Journal

Heading:

Learn before choosing

Body copy:

The Journal gathers short educational notes to help visitors understand care before requesting evaluation.

Primary CTA:

Request evaluation

Secondary CTA:

Browse articles

Internal links:

* /blog/
* /consultation/
* /faq/

Build variation instruction:

Journal page should feel editorial and image-rich. Use magazine layouts, featured articles, category panels and visual article cards.

---

## JOURNAL SECTION 02 — Featured Note

HTML comment:

```html
<!-- JOURNAL 02: Featured Note — highlight the most important educational starting point. -->
```

Data attributes:

```html
data-section-id="journal-featured-note"
data-section-type="featured-article"
data-content-module="evaluation-comes-first"
data-layout-signature="unique-per-concept"
data-visual-role="editorial-feature"
```

Image prompt:

Featured article card with consultation notes, sage paper texture, ivory background and bronze editorial label.

Alt text:

Featured journal note about why evaluation comes before treatment.

Eyebrow:

Featured note

Heading:

Why evaluation comes before choosing a treatment

Body copy:

A short guide to understanding why skin, goals, suitability and aftercare should be discussed before any protocol.

CTA:

Read the note

Internal links:

* /care/
* /consultation/
* /faq/

Build variation instruction:

Make this feel like a magazine feature: large image, excerpt card, editorial text block or visual article cover.

---

## JOURNAL SECTION 03 — Journal Categories

HTML comment:

```html
<!-- JOURNAL 03: Categories — organise educational content by decision stage. -->
```

Data attributes:

```html
data-section-id="journal-categories"
data-section-type="category-navigation"
data-content-module="journal-topic-categories"
data-layout-signature="unique-per-concept"
data-visual-role="content-navigation"
```

Image prompt:

Premium category tiles for evaluation, laser, skin quality, aftercare, results and questions, sage ivory palette.

Alt text:

Journal categories for evaluation, laser, skin quality, aftercare and results.

Eyebrow:

Browse by decision stage

Heading:

Find the guidance you need

Categories:

* Evaluation
* Laser
* Skin quality
* Aftercare
* Results
* Questions before treatment

Internal links:

* /laser/
* /skin/
* /results/
* /faq/

Build variation instruction:

Vary category layout as tabs, cards, editorial index, side navigation, or image categories.

---

## JOURNAL SECTION 04 — Start With Evaluation

HTML comment:

```html
<!-- JOURNAL 04: Start With Evaluation — provide article cards focused on professional assessment. -->
```

Data attributes:

```html
data-section-id="journal-evaluation-articles"
data-section-type="article-group"
data-content-module="evaluation-education"
data-layout-signature="unique-per-concept"
data-visual-role="seo-content"
```

Image prompt:

Evaluation article cards with consultation notebook visuals, sage and ivory tones, bronze details.

Alt text:

Journal notes about professional evaluation.

Eyebrow:

Start with evaluation

Heading:

Start with evaluation

Article cards:

1. What professional evaluation can clarify
   Understand how assessment helps guide suitability, priorities and next steps.

2. Questions to ask before treatment
   Prepare a clearer conversation before choosing a care path.

3. Why suitability matters
   Learn why not every protocol is appropriate for every person.

Internal links:

* /consultation/
* /faq/
* /care/

Build variation instruction:

This can be a horizontal article rail, stacked editorial cards, or featured note plus smaller cards.

---

## JOURNAL SECTION 05 — Laser and Technology

HTML comment:

```html
<!-- JOURNAL 05: Laser and Technology — provide article cards about laser care, preparation and aftercare. -->
```

Data attributes:

```html
data-section-id="journal-laser-articles"
data-section-type="article-group"
data-content-module="laser-education"
data-layout-signature="unique-per-concept"
data-visual-role="seo-content"
```

Image prompt:

Laser article cards with abstract champagne light, sage panels and ivory editorial text blocks.

Alt text:

Journal notes about laser care and preparation.

Eyebrow:

Laser and technology

Heading:

Laser and technology

Article cards:

1. What to understand before laser care
   Learn why suitability, skin history and goals should be discussed first.

2. Why preparation matters
   Understand how preparation supports responsible planning.

3. Aftercare after laser sessions
   Learn why professional guidance continues after the session.

Internal links:

* /laser/
* /care/
* /results/

Build variation instruction:

Make this section visually more technical than skin education but still warm and premium.

---

## JOURNAL SECTION 06 — Skin Quality

HTML comment:

```html
<!-- JOURNAL 06: Skin Quality — provide article cards about texture, sensitivity and daily care. -->
```

Data attributes:

```html
data-section-id="journal-skin-quality"
data-section-type="article-group"
data-content-module="skin-quality-education"
data-layout-signature="unique-per-concept"
data-visual-role="seo-content"
```

Image prompt:

Skin quality article cards with macro skin texture, cream tones, sage botanical detail and soft light.

Alt text:

Journal notes about skin quality and daily care.

Eyebrow:

Skin quality

Heading:

Skin quality

Article cards:

1. Understanding texture and luminosity
   Learn why skin quality should be evaluated before care is planned.

2. Sensitive skin and careful guidance
   Understand why sensitivity should be discussed before protocols.

3. Daily care and professional planning
   Learn how home guidance and professional care can work together.

Internal links:

* /skin/
* /blog/
* /consultation/

Build variation instruction:

Use softer visuals than the laser article group. Avoid identical card structure.

---

## JOURNAL SECTION 07 — Aftercare and Expectations

HTML comment:

```html
<!-- JOURNAL 07: Aftercare and Expectations — provide educational cards about results and responsible care. -->
```

Data attributes:

```html
data-section-id="journal-aftercare-expectations"
data-section-type="article-group"
data-content-module="aftercare-results-education"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-education"
```

Image prompt:

Aftercare and results article cards with abstract progress visuals, sage and ivory palette, no before-and-after images.

Alt text:

Journal notes about aftercare and realistic expectations.

Eyebrow:

Aftercare and expectations

Heading:

Aftercare and expectations

Article cards:

1. Why results vary
   Understand the factors that can influence outcomes.

2. How aftercare supports comfort
   Learn why guidance after a protocol matters.

3. Progress without promises
   Read about responsible expectations in aesthetic care.

Internal links:

* /results/
* /faq/
* /legal/

Build variation instruction:

Use abstract progress visuals and ethical copy. No patient imagery.

---

## JOURNAL SECTION 08 — Journal Grid

HTML comment:

```html
<!-- JOURNAL 08: Journal Grid — display all journal notes in a clear image-led article grid. -->
```

Data attributes:

```html
data-section-id="journal-grid"
data-section-type="article-grid"
data-content-module="all-journal-notes"
data-layout-signature="unique-per-concept"
data-visual-role="content-index"
```

Image prompt:

Premium editorial article grid with sage, ivory and champagne tones, image thumbnails and clean spacing.

Alt text:

Grid of educational journal notes.

Eyebrow:

All notes

Heading:

All journal notes

Card structure:

* Image thumbnail
* Article title
* Short summary
* Category
* Link

Starter article titles:

* Why evaluation comes first
* Questions before laser care
* Understanding skin quality
* Why aftercare matters
* Results and realistic expectations
* What to include in your first message

Internal links:

* /blog/
* /faq/
* /consultation/

Build variation instruction:

Every concept can display the grid differently: masonry, editorial list, compact cards, horizontal scroll or magazine index.

---

## JOURNAL SECTION 09 — Educational Disclaimer and CTA

HTML comment:

```html
<!-- JOURNAL 09: Education Disclaimer CTA — remind visitors that reading helps but evaluation guides individual decisions. -->
```

Data attributes:

```html
data-section-id="journal-education-disclaimer-cta"
data-section-type="cta"
data-content-module="reading-does-not-replace-evaluation"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-conversion"
```

Image prompt:

Elegant educational disclaimer card with ivory paper, sage background and botanical clinical detail.

Alt text:

Reminder that educational content does not replace professional evaluation.

Eyebrow:

Important note

Heading:

Reading helps, but evaluation guides

Body copy:

Educational content can prepare your questions, but it does not replace professional evaluation.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/
* /legal/

Build variation instruction:

This CTA should feel educational and calm, not sales-focused.

---

# BLOG PAGE

## SEO title

Blog | Franciele Sofiati

## Meta description

Articles about skin care, laser care, consultation, aftercare and responsible aesthetic decision-making.

## H1

Articles about skin, laser and responsible care

---

## BLOG SECTION 01 — Hero

HTML comment:

```html
<!-- BLOG 01: Hero — introduce the Blog as a practical education hub for skin, laser and care topics. -->
```

Data attributes:

```html
data-section-id="blog-hero"
data-section-type="hero"
data-content-module="blog-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="education-entry"
```

Image prompt:

Premium blog hero with article thumbnails, skin texture, abstract laser light, sage and ivory editorial layout.

Alt text:

Blog articles about skin, laser and responsible aesthetic care.

Eyebrow:

Blog

Heading:

A practical education hub

Body copy:

Explore accessible articles about skin quality, laser care, aftercare, consultation and responsible expectations.

Primary CTA:

Browse articles

Secondary CTA:

Request evaluation

Internal links:

* /journal/
* /consultation/
* /faq/

Build variation instruction:

Blog should feel more content-heavy than Journal, but still image-led and premium.

---

## BLOG SECTION 02 — Featured Articles

HTML comment:

```html
<!-- BLOG 02: Featured Articles — highlight key article topics for first-time visitors. -->
```

Data attributes:

```html
data-section-id="blog-featured-articles"
data-section-type="featured-articles"
data-content-module="blog-featured-content"
data-layout-signature="unique-per-concept"
data-visual-role="content-priority"
```

Image prompt:

Featured article cards with sage panels, ivory backgrounds, skin texture and laser-light details.

Alt text:

Featured articles about consultation, laser care and aftercare.

Eyebrow:

Featured articles

Heading:

Start with these guides

Cards:

1. What to ask before evaluation
   Prepare better questions before choosing a care path.

2. Understanding laser care responsibly
   Learn why suitability and aftercare matter.

3. Why aftercare matters
   See how care continues after the session.

Internal links:

* /laser/
* /skin/
* /results/

Build variation instruction:

Use a different featured article layout from Journal. Try one large card plus two smaller cards, editorial columns or visual magazine layout.

---

## BLOG SECTION 03 — Topic Filters

HTML comment:

```html
<!-- BLOG 03: Topic Filters — provide clear topic navigation for article discovery. -->
```

Data attributes:

```html
data-section-id="blog-topic-filters"
data-section-type="filter-navigation"
data-content-module="blog-topic-filters"
data-layout-signature="unique-per-concept"
data-visual-role="content-navigation"
```

Image prompt:

Premium topic filter buttons in sage, ivory and champagne, clean accessible design.

Alt text:

Topic filters for blog articles.

Eyebrow:

Browse topics

Heading:

Browse topics

Topics:

* Laser care
* Skin care
* Consultation
* Aftercare
* Results
* Patient questions

Internal links:

* /laser/
* /skin/
* /consultation/
* /results/
* /faq/

Build variation instruction:

Filters can be chips, tabs, side nav, vertical category cards or editorial topic index.

---

## BLOG SECTION 04 — Laser Articles

HTML comment:

```html
<!-- BLOG 04: Laser Articles — group laser-related articles for SEO and user clarity. -->
```

Data attributes:

```html
data-section-id="blog-laser-articles"
data-section-type="article-group"
data-content-module="laser-articles"
data-layout-signature="unique-per-concept"
data-visual-role="seo-content"
```

Image prompt:

Laser article cards with abstract laser light, sage panels, ivory text blocks and champagne detail.

Alt text:

Blog articles about laser care.

Eyebrow:

Laser care articles

Heading:

Laser care articles

Cards:

1. Suitability before laser care
   Why evaluation matters before choosing a laser protocol.

2. Preparation and aftercare
   What may need to be discussed before and after sessions.

3. Results and realistic expectations
   Why outcomes vary and should be discussed responsibly.

Internal links:

* /laser/
* /faq/
* /results/

Build variation instruction:

Use distinct styling from Journal laser cards. Blog can be more practical and searchable.

---

## BLOG SECTION 05 — Skin Articles

HTML comment:

```html
<!-- BLOG 05: Skin Articles — group skin-related articles for SEO and education. -->
```

Data attributes:

```html
data-section-id="blog-skin-articles"
data-section-type="article-group"
data-content-module="skin-articles"
data-layout-signature="unique-per-concept"
data-visual-role="seo-content"
```

Image prompt:

Skin article cards with macro texture, cream and sage palette, botanical shadows and clean editorial layout.

Alt text:

Blog articles about skin quality and skin care guidance.

Eyebrow:

Skin care articles

Heading:

Skin care articles

Cards:

1. Skin quality and evaluation
   Why skin concerns should be assessed before care is planned.

2. Texture and luminosity
   How these topics can be discussed responsibly.

3. Sensitive skin questions
   Why sensitivity should be shared before any protocol.

Internal links:

* /skin/
* /journal/
* /consultation/

Build variation instruction:

Use softer visual rhythm than laser articles. Vary card shapes and crops.

---

## BLOG SECTION 06 — Consultation and Aftercare Articles

HTML comment:

```html
<!-- BLOG 06: Consultation and Aftercare Articles — group practical guidance around starting and following care. -->
```

Data attributes:

```html
data-section-id="blog-consultation-aftercare"
data-section-type="article-group"
data-content-module="consultation-aftercare-articles"
data-layout-signature="unique-per-concept"
data-visual-role="practical-education"
```

Image prompt:

Consultation and aftercare article cards with ivory notes, sage botanical accent and soft clinical still life.

Alt text:

Blog articles about consultation and aftercare.

Eyebrow:

Consultation and aftercare

Heading:

Consultation and aftercare

Cards:

1. How to prepare for evaluation
   What to organise before the first conversation.

2. What to include in your first message
   How to make your request clearer.

3. Why aftercare is part of care
   Why guidance continues after the session.

Internal links:

* /consultation/
* /results/
* /faq/

Build variation instruction:

This should be practical and useful. Use checklist article cards or guide-style layout.

---

## BLOG SECTION 07 — Blog Grid

HTML comment:

```html
<!-- BLOG 07: Blog Grid — display all articles in a clear image-led layout. -->
```

Data attributes:

```html
data-section-id="blog-grid"
data-section-type="article-grid"
data-content-module="all-blog-articles"
data-layout-signature="unique-per-concept"
data-visual-role="content-index"
```

Image prompt:

Premium blog article grid with image thumbnails, sage category tags, ivory cards and clean editorial spacing.

Alt text:

Grid of blog articles about skin, laser and care.

Eyebrow:

All articles

Heading:

All articles

Card structure:

* Image thumbnail
* Article title
* Topic tag
* Short summary
* Link

Starter article titles:

* What to ask before evaluation
* Understanding laser care responsibly
* Why aftercare matters
* Skin quality and evaluation
* Sensitive skin questions
* Results and realistic expectations

Internal links:

* /journal/
* /faq/
* /consultation/

Build variation instruction:

Each concept should use a different blog index style: masonry, editorial list, filters, magazine grid or horizontal content rail.

---

## BLOG SECTION 08 — Responsible Reading Note

HTML comment:

```html
<!-- BLOG 08: Responsible Reading Note — clarify that articles are educational and not individual advice. -->
```

Data attributes:

```html
data-section-id="blog-responsible-reading-note"
data-section-type="disclaimer"
data-content-module="educational-information-only"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-clarity"
```

Image prompt:

Quiet educational note panel with ivory background, sage border and bronze detail.

Alt text:

Educational information note for blog readers.

Eyebrow:

Important note

Heading:

Educational information only

Body copy:

Articles can help you prepare better questions, but individual care decisions should be made after professional evaluation.

Internal links:

* /legal/
* /faq/
* /consultation/

Build variation instruction:

Keep this concise and elegant. It can be a note strip, small callout or final disclaimer card.

---

## BLOG SECTION 09 — Contact CTA

HTML comment:

```html
<!-- BLOG 09: Contact CTA — invite readers to ask questions through evaluation or contact. -->
```

Data attributes:

```html
data-section-id="blog-contact-cta"
data-section-type="cta"
data-content-module="article-reader-next-step"
data-layout-signature="unique-per-concept"
data-visual-role="conversion"
```

Image prompt:

Premium article-to-consultation CTA with sage background, ivory card and calm botanical detail.

Alt text:

Invitation to request evaluation after reading articles.

Eyebrow:

Have a question?

Heading:

Have a question about your case?

Body copy:

Use what you read to prepare your questions, then request professional evaluation for individual guidance.

CTA:

Request evaluation

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Make this feel like a natural next step after reading, not an aggressive sales block.

---

# LEGAL PAGE

## SEO title

Legal Information | Franciele Sofiati

## Meta description

Legal and responsible-use information for the Franciele Sofiati website, including educational content and communication limits.

## H1

Legal information

---

## LEGAL SECTION 01 — Hero

HTML comment:

```html
<!-- LEGAL 01: Hero — introduce responsible website use and legal information. -->
```

Data attributes:

```html
data-section-id="legal-hero"
data-section-type="hero"
data-content-module="legal-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="legal-entry"
```

Image prompt:

Minimal legal information page hero with sage background, ivory document card and bronze linework.

Alt text:

Legal information for the Franciele Sofiati website.

Eyebrow:

Legal

Heading:

Responsible use of this website

Body copy:

This page explains important information about the use of website content and communication.

Internal links:

* /privacy/
* /cookies/
* /accessibility/

Build variation instruction:

Legal page can be simpler but still premium, readable and well-spaced.

---

## LEGAL SECTION 02 — Educational Information

HTML comment:

```html
<!-- LEGAL 02: Educational Information — clarify that website content is not individual professional evaluation. -->
```

Data attributes:

```html
data-section-id="legal-educational-information"
data-section-type="legal-content"
data-content-module="educational-information"
data-layout-signature="unique-per-concept"
data-visual-role="legal-clarity"
```

Image prompt:

Educational information legal card with ivory paper, sage border and calm clinical typography.

Alt text:

Legal note explaining educational website information.

Eyebrow:

Educational content

Heading:

Website content is educational

Body copy:

The information on this website is for general educational purposes and does not replace professional evaluation.

Internal links:

* /consultation/
* /faq/
* /results/

Build variation instruction:

Use clear legal typography. Avoid tiny unreadable text.

---

## LEGAL SECTION 03 — Professional Responsibility

HTML comment:

```html
<!-- LEGAL 03: Professional Responsibility — connect legal information to responsible aesthetic communication. -->
```

Data attributes:

```html
data-section-id="legal-professional-responsibility"
data-section-type="legal-content"
data-content-module="professional-responsibility"
data-layout-signature="unique-per-concept"
data-visual-role="ethical-communication"
```

Image prompt:

Responsible communication card with sage background, ivory statement panel and bronze divider.

Alt text:

Professional responsibility in aesthetic communication.

Eyebrow:

Professional responsibility

Heading:

Responsible communication matters

Body copy:

Aesthetic care should be discussed with clear expectations and professional guidance.

Internal links:

* /results/
* /testimonials/
* /consultation/

Build variation instruction:

Keep this short, precise and clear.

---

## LEGAL SECTION 04 — Website Use

HTML comment:

```html
<!-- LEGAL 04: Website Use — explain limitations on use and interpretation of content. -->
```

Data attributes:

```html
data-section-id="legal-website-use"
data-section-type="legal-content"
data-content-module="website-use"
data-layout-signature="unique-per-concept"
data-visual-role="legal-guidance"
```

Image prompt:

Minimal website-use document visual with ivory text panel and sage background.

Alt text:

Website-use information for Sofiati content.

Eyebrow:

Website use

Heading:

Use of website content

Body copy:

Website content should not be copied, reused or interpreted as individual advice without proper context.

Internal links:

* /privacy/
* /contact/

Build variation instruction:

Use clean text blocks with good spacing.

---

## LEGAL SECTION 05 — Intellectual Property

HTML comment:

```html
<!-- LEGAL 05: Intellectual Property — protect text, image, structure and brand materials. -->
```

Data attributes:

```html
data-section-id="legal-intellectual-property"
data-section-type="legal-content"
data-content-module="intellectual-property"
data-layout-signature="unique-per-concept"
data-visual-role="rights-information"
```

Image prompt:

Intellectual property card with refined brand mark placeholder, sage and ivory palette, bronze legal line.

Alt text:

Intellectual property information for Sofiati brand materials.

Eyebrow:

Intellectual property

Heading:

Intellectual property

Body copy:

Text, images, structure and brand materials on this website belong to their respective owners unless otherwise stated.

Internal links:

* /contact/
* /privacy/

Build variation instruction:

Keep the design compact. Legal pages should not become visually heavy.

---

## LEGAL SECTION 06 — Legal Contact

HTML comment:

```html
<!-- LEGAL 06: Contact for Legal Questions — provide route for legal or website-use questions. -->
```

Data attributes:

```html
data-section-id="legal-contact"
data-section-type="contact-note"
data-content-module="legal-contact"
data-layout-signature="unique-per-concept"
data-visual-role="support-route"
```

Image prompt:

Legal contact note with ivory card, sage background and email icon in bronze.

Alt text:

Contact route for legal questions.

Eyebrow:

Questions

Heading:

Questions about this page

Body copy:

For legal or website-use questions, contact the official email listed on the Contact page.

CTA:

Contact Franciele

Internal links:

* /contact/
* /privacy/
* /cookies/

Build variation instruction:

Use a compact contact card or note strip.

---

# PRIVACY PAGE

## SEO title

Privacy Policy | Franciele Sofiati

## Meta description

Privacy information about how contact form details, messages and visitor information may be handled on the Sofiati website.

## H1

Privacy information

---

## PRIVACY SECTION 01 — Hero

HTML comment:

```html
<!-- PRIVACY 01: Hero — introduce privacy information for visitor contact and form use. -->
```

Data attributes:

```html
data-section-id="privacy-hero"
data-section-type="hero"
data-content-module="privacy-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="privacy-entry"
```

Image prompt:

Minimal privacy policy hero with sage background, ivory document card and subtle bronze lock icon.

Alt text:

Privacy information for the Sofiati website.

Eyebrow:

Privacy

Heading:

Your information should be handled responsibly

Body copy:

This page explains how contact details and messages may be used when visitors communicate through the website.

Internal links:

* /contact/
* /legal/
* /cookies/

Build variation instruction:

Privacy page should be readable, calm and compact, not visually cluttered.

---

## PRIVACY SECTION 02 — Information Collected

HTML comment:

```html
<!-- PRIVACY 02: Information Collected — explain what visitors may submit through forms or contact routes. -->
```

Data attributes:

```html
data-section-id="privacy-information-collected"
data-section-type="privacy-content"
data-content-module="information-collected"
data-layout-signature="unique-per-concept"
data-visual-role="privacy-clarity"
```

Image prompt:

Privacy information card with form field icons, sage and ivory palette, bronze dividers.

Alt text:

Information that may be submitted through contact forms.

Eyebrow:

Information collected

Heading:

Information you may send

Body copy:

Forms or contact routes may collect your name, WhatsApp, email, treatment interest and message.

Internal links:

* /consultation/
* /contact/
* /legal/

Build variation instruction:

Use clear bullet-style layout or compact readable paragraph.

---

## PRIVACY SECTION 03 — How Information Is Used

HTML comment:

```html
<!-- PRIVACY 03: How Information Is Used — explain the purpose of collecting contact details. -->
```

Data attributes:

```html
data-section-id="privacy-information-use"
data-section-type="privacy-content"
data-content-module="how-information-is-used"
data-layout-signature="unique-per-concept"
data-visual-role="purpose-clarity"
```

Image prompt:

Minimal data-use explanation card with sage arrows, ivory panels and bronze details.

Alt text:

How visitor information may be used.

Eyebrow:

Use of information

Heading:

How information may be used

Body copy:

Information may be used to respond to your request, organise communication and guide the next contact.

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Keep wording clear and practical.

---

## PRIVACY SECTION 04 — Sharing and Storage

HTML comment:

```html
<!-- PRIVACY 04: Sharing and Storage — explain responsible handling of personal information. -->
```

Data attributes:

```html
data-section-id="privacy-sharing-storage"
data-section-type="privacy-content"
data-content-module="sharing-storage"
data-layout-signature="unique-per-concept"
data-visual-role="trust-reassurance"
```

Image prompt:

Responsible handling card with sage lock icon, ivory privacy panel and soft botanical detail.

Alt text:

Responsible handling of visitor information.

Eyebrow:

Responsible handling

Heading:

Responsible handling

Body copy:

Personal information should not be sold. It should be handled only as needed for communication and service-related contact.

Internal links:

* /legal/
* /contact/

Build variation instruction:

Use a trust-building layout but avoid over-designing legal content.

---

## PRIVACY SECTION 05 — Your Choices

HTML comment:

```html
<!-- PRIVACY 05: Your Choices — explain visitor rights to request correction, update or deletion where applicable. -->
```

Data attributes:

```html
data-section-id="privacy-your-choices"
data-section-type="privacy-content"
data-content-module="visitor-choices"
data-layout-signature="unique-per-concept"
data-visual-role="user-control"
```

Image prompt:

Visitor choices card with ivory checklist, sage background and bronze accent.

Alt text:

Visitor choices about personal information.

Eyebrow:

Your choices

Heading:

Your choices

Body copy:

Visitors may request correction, update or deletion of personal information where applicable.

Internal links:

* /contact/
* /legal/

Build variation instruction:

Keep this simple and accessible.

---

## PRIVACY SECTION 06 — Privacy Contact

HTML comment:

```html
<!-- PRIVACY 06: Privacy Contact — provide a route for privacy-related questions. -->
```

Data attributes:

```html
data-section-id="privacy-contact"
data-section-type="contact-note"
data-content-module="privacy-contact"
data-layout-signature="unique-per-concept"
data-visual-role="support-route"
```

Image prompt:

Privacy contact note with sage background, ivory card and bronze email icon.

Alt text:

Contact route for privacy questions.

Eyebrow:

Questions

Heading:

Privacy questions

Body copy:

For privacy-related questions, use the contact email listed on the Contact page.

CTA:

Contact Franciele

Internal links:

* /contact/
* /legal/
* /cookies/

Build variation instruction:

Use a compact contact CTA, not a large sales CTA.

---

# COOKIES PAGE

## SEO title

Cookies Policy | Franciele Sofiati

## Meta description

Cookie information for the Franciele Sofiati website, including basic explanations and visitor choices.

## H1

Cookies information

---

## COOKIES SECTION 01 — Hero

HTML comment:

```html
<!-- COOKIES 01: Hero — introduce cookies information in a simple and accessible way. -->
```

Data attributes:

```html
data-section-id="cookies-hero"
data-section-type="hero"
data-content-module="cookies-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="cookies-entry"
```

Image prompt:

Minimal cookies information hero with sage background, ivory card and subtle browser preference icon.

Alt text:

Cookies information for the Sofiati website.

Eyebrow:

Cookies

Heading:

How cookies may support the website

Body copy:

Cookies can help websites work properly, remember preferences or understand general visitor behaviour.

Internal links:

* /privacy/
* /legal/
* /accessibility/

Build variation instruction:

Cookies page should be small, readable and not overbuilt.

---

## COOKIES SECTION 02 — What Cookies Are

HTML comment:

```html
<!-- COOKIES 02: What Cookies Are — explain cookies in plain language. -->
```

Data attributes:

```html
data-section-id="cookies-what-they-are"
data-section-type="cookies-content"
data-content-module="cookie-definition"
data-layout-signature="unique-per-concept"
data-visual-role="plain-language-explanation"
```

Image prompt:

Simple browser-cookie explanation card with ivory panels, sage background and bronze linework.

Alt text:

Plain-language explanation of website cookies.

Eyebrow:

Definition

Heading:

What are cookies?

Body copy:

Cookies are small files stored by a browser to help a website function, remember settings or collect basic usage information.

Internal links:

* /privacy/
* /legal/

Build variation instruction:

Use a simple explanatory card or text block.

---

## COOKIES SECTION 03 — Cookies We May Use

HTML comment:

```html
<!-- COOKIES 03: Cookies We May Use — list possible cookie categories without claiming analytics if not implemented. -->
```

Data attributes:

```html
data-section-id="cookies-types"
data-section-type="cookies-content"
data-content-module="cookie-types"
data-layout-signature="unique-per-concept"
data-visual-role="cookie-category-clarity"
```

Image prompt:

Cookie category cards with essential, preference and analytics labels, sage and ivory style.

Alt text:

Cookie categories including essential, preference and analytics cookies.

Eyebrow:

Cookie types

Heading:

Types of cookies

Items:

* Essential cookies
* Preference cookies
* Analytics cookies if enabled

Body copy:

Only use analytics or preference cookies if they are actually implemented.

Internal links:

* /privacy/
* /legal/

Build variation instruction:

Keep the conditional warning in the code comments too so the site does not claim tools it does not use.

---

## COOKIES SECTION 04 — Managing Cookies

HTML comment:

```html
<!-- COOKIES 04: Managing Cookies — explain that visitors can usually control cookies through browser settings. -->
```

Data attributes:

```html
data-section-id="cookies-managing"
data-section-type="cookies-content"
data-content-module="managing-cookies"
data-layout-signature="unique-per-concept"
data-visual-role="user-choice"
```

Image prompt:

Browser settings visual with sage interface elements, ivory background and premium minimal style.

Alt text:

Browser settings for managing cookies.

Eyebrow:

Managing preferences

Heading:

Managing cookies

Body copy:

Visitors can usually manage cookies through browser settings or website cookie preferences where available.

Internal links:

* /privacy/
* /accessibility/

Build variation instruction:

Keep concise and clear.

---

## COOKIES SECTION 05 — Cookie Contact

HTML comment:

```html
<!-- COOKIES 05: Contact — provide a route for cookie-related questions. -->
```

Data attributes:

```html
data-section-id="cookies-contact"
data-section-type="contact-note"
data-content-module="cookies-contact"
data-layout-signature="unique-per-concept"
data-visual-role="support-route"
```

Image prompt:

Cookie contact note with sage background, ivory card and bronze email icon.

Alt text:

Contact route for cookie questions.

Eyebrow:

Questions

Heading:

Cookie questions

Body copy:

For questions about cookies, use the contact email listed on the Contact page.

Internal links:

* /privacy/
* /legal/
* /contact/

Build variation instruction:

Use a compact support note, not a large CTA.

---

# ACCESSIBILITY PAGE

## SEO title

Accessibility | Franciele Sofiati

## Meta description

Accessibility information for the Sofiati website, including design approach, navigation, forms and feedback contact.

## H1

Accessibility

---

## ACCESSIBILITY SECTION 01 — Hero

HTML comment:

```html
<!-- ACCESSIBILITY 01: Hero — introduce the website's accessibility intention. -->
```

Data attributes:

```html
data-section-id="accessibility-hero"
data-section-type="hero"
data-content-module="accessibility-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="accessibility-entry"
```

Image prompt:

Minimal accessibility hero with sage background, ivory interface cards and accessible navigation icons.

Alt text:

Accessibility information for the Sofiati website.

Eyebrow:

Accessibility

Heading:

A website designed to be usable

Body copy:

The Sofiati website should be clear, responsive and accessible for visitors using different devices and navigation methods.

Internal links:

* /contact/
* /privacy/
* /sitemap/

Build variation instruction:

Accessibility page should be simple, legible and genuinely usable.

---

## ACCESSIBILITY SECTION 02 — Design Approach

HTML comment:

```html
<!-- ACCESSIBILITY 02: Design Approach — describe readable and responsive design expectations. -->
```

Data attributes:

```html
data-section-id="accessibility-design-approach"
data-section-type="accessibility-content"
data-content-module="readable-responsive-design"
data-layout-signature="unique-per-concept"
data-visual-role="usability-clarity"
```

Image prompt:

Readable design visual with typography samples, contrast cards and responsive layout frames in sage and ivory.

Alt text:

Readable and responsive design accessibility approach.

Eyebrow:

Design approach

Heading:

Readable and responsive design

Body copy:

The site should use clear contrast, readable typography, responsive layouts and logical structure.

Internal links:

* /sitemap/
* /contact/

Build variation instruction:

Make the page itself demonstrate accessibility through spacing, contrast and readable text.

---

## ACCESSIBILITY SECTION 03 — Navigation and Forms

HTML comment:

```html
<!-- ACCESSIBILITY 03: Navigation and Forms — explain keyboard-friendly navigation and labelled form expectations. -->
```

Data attributes:

```html
data-section-id="accessibility-navigation-forms"
data-section-type="accessibility-content"
data-content-module="navigation-form-usability"
data-layout-signature="unique-per-concept"
data-visual-role="interaction-clarity"
```

Image prompt:

Accessible navigation and form visual with labelled fields, focus rings and mobile menu states in sage and ivory.

Alt text:

Accessible navigation and labelled form fields.

Eyebrow:

Navigation and forms

Heading:

Navigation and form usability

Body copy:

Menus, links, buttons and forms should be keyboard-friendly, labelled clearly and usable on mobile.

Internal links:

* /consultation/
* /contact/
* /privacy/

Build variation instruction:

Ensure actual implementation follows this: focus states, labels, aria where appropriate and keyboard navigation.

---

## ACCESSIBILITY SECTION 04 — Known Limitations

HTML comment:

```html
<!-- ACCESSIBILITY 04: Known Limitations — provide a place to acknowledge and improve accessibility issues. -->
```

Data attributes:

```html
data-section-id="accessibility-known-limitations"
data-section-type="accessibility-content"
data-content-module="known-limitations"
data-layout-signature="unique-per-concept"
data-visual-role="transparency"
```

Image prompt:

Known limitations note with ivory card, sage border and simple improvement icon.

Alt text:

Known accessibility limitations and improvement note.

Eyebrow:

Ongoing improvement

Heading:

Known limitations

Body copy:

If any accessibility issue is found, it should be reviewed and improved as part of the ongoing website process.

Internal links:

* /contact/
* /legal/

Build variation instruction:

Keep this honest and concise.

---

## ACCESSIBILITY SECTION 05 — Feedback

HTML comment:

```html
<!-- ACCESSIBILITY 05: Feedback — invite visitors to report accessibility problems. -->
```

Data attributes:

```html
data-section-id="accessibility-feedback"
data-section-type="feedback"
data-content-module="accessibility-feedback"
data-layout-signature="unique-per-concept"
data-visual-role="support-route"
```

Image prompt:

Accessibility feedback card with sage background, ivory form note and bronze message icon.

Alt text:

Accessibility feedback contact note.

Eyebrow:

Feedback

Heading:

Accessibility feedback

Body copy:

Visitors may report accessibility problems so the website can be improved.

Internal links:

* /contact/
* /privacy/

Build variation instruction:

Use a compact feedback CTA or note card.

---

## ACCESSIBILITY SECTION 06 — Accessibility Contact

HTML comment:

```html
<!-- ACCESSIBILITY 06: Contact — provide contact route for accessibility feedback. -->
```

Data attributes:

```html
data-section-id="accessibility-contact"
data-section-type="contact-note"
data-content-module="accessibility-contact"
data-layout-signature="unique-per-concept"
data-visual-role="support-contact"
```

Image prompt:

Accessibility contact card with ivory background, sage icon and clean readable typography.

Alt text:

Contact route for accessibility feedback.

Eyebrow:

Contact

Heading:

Contact for accessibility

Body copy:

For accessibility feedback, use the contact email listed on the Contact page.

CTA:

Contact Franciele

Internal links:

* /contact/
* /privacy/
* /legal/
* /sitemap/

Build variation instruction:

Keep this simple and easy to use.

---

# SITEMAP PAGE

## SEO title

Sitemap | Franciele Sofiati

## Meta description

Find all main, trust, education, legal, consultation and contact pages on the Franciele Sofiati website.

## H1

Sitemap

---

## SITEMAP SECTION 01 — Hero

HTML comment:

```html
<!-- SITEMAP 01: Hero — introduce the sitemap as a clear route to every main page. -->
```

Data attributes:

```html
data-section-id="sitemap-hero"
data-section-type="hero"
data-content-module="sitemap-introduction"
data-layout-signature="unique-per-concept"
data-visual-role="navigation-entry"
```

Image prompt:

Premium sitemap hero with structured page links, sage and ivory panels and bronze navigation lines.

Alt text:

Sitemap navigation for the Franciele Sofiati website.

Eyebrow:

Sitemap

Heading:

Find every page

Body copy:

Use this sitemap to navigate the main pages, trust pages, education pages and legal information.

Internal links:

* /home/
* /consultation/
* /contact/

Build variation instruction:

Sitemap page should be very clear and functional. Do not over-design navigation.

---

## SITEMAP SECTION 02 — Main Pages

HTML comment:

```html
<!-- SITEMAP 02: Main Pages — list the primary pages of the website. -->
```

Data attributes:

```html
data-section-id="sitemap-main-pages"
data-section-type="sitemap-group"
data-content-module="main-pages"
data-layout-signature="unique-per-concept"
data-visual-role="primary-navigation"
```

Image prompt:

Main pages sitemap cards in sage and ivory with clean link hierarchy.

Alt text:

Main website pages in the sitemap.

Eyebrow:

Main pages

Heading:

Main pages

Links:

* Home — /home/
* About — /about/
* Care — /care/
* Laser — /laser/
* Skin — /skin/
* Results — /results/
* Consultation — /consultation/
* Contact — /contact/

Build variation instruction:

Use clear link grouping with enough spacing and visible hover/focus states.

---

## SITEMAP SECTION 03 — Brand and Trust Pages

HTML comment:

```html
<!-- SITEMAP 03: Brand and Trust Pages — list trust, values and educational navigation pages. -->
```

Data attributes:

```html
data-section-id="sitemap-brand-trust"
data-section-type="sitemap-group"
data-content-module="brand-trust-pages"
data-layout-signature="unique-per-concept"
data-visual-role="trust-navigation"
```

Image prompt:

Brand and trust sitemap card with sage background, ivory link list and bronze dividers.

Alt text:

Brand and trust pages in the sitemap.

Eyebrow:

Brand and trust

Heading:

Brand and trust

Links:

* Mission — /mission/
* Values — /values/
* Testimonials — /testimonials/
* FAQ — /faq/
* Journal — /journal/
* Blog — /blog/

Build variation instruction:

Keep navigation clear. Do not bury these links.

---

## SITEMAP SECTION 04 — Legal Pages

HTML comment:

```html
<!-- SITEMAP 04: Legal Pages — list legal and support pages. -->
```

Data attributes:

```html
data-section-id="sitemap-legal-pages"
data-section-type="sitemap-group"
data-content-module="legal-pages"
data-layout-signature="unique-per-concept"
data-visual-role="legal-navigation"
```

Image prompt:

Legal sitemap card with ivory background, sage border and compact link list.

Alt text:

Legal and support pages in the sitemap.

Eyebrow:

Legal and support

Heading:

Legal and support

Links:

* Legal — /legal/
* Privacy — /privacy/
* Cookies — /cookies/
* Accessibility — /accessibility/

Build variation instruction:

Keep legal links easy to find.

---

## SITEMAP SECTION 05 — Contact Route

HTML comment:

```html
<!-- SITEMAP 05: Contact Route — provide a practical next step after navigation. -->
```

Data attributes:

```html
data-section-id="sitemap-contact-route"
data-section-type="cta"
data-content-module="sitemap-contact-next-step"
data-layout-signature="unique-per-concept"
data-visual-role="practical-next-step"
```

Image prompt:

Compact contact route card with sage background, ivory CTA panel and botanical accent.

Alt text:

Contact route from the sitemap.

Eyebrow:

Start or ask a question

Heading:

Start or ask a question

Body copy:

For personal questions, begin with consultation or contact Franciele directly.

Primary CTA:

Request evaluation

Secondary CTA:

Contact Franciele

Internal links:

* /consultation/
* /contact/

Build variation instruction:

Use a compact practical CTA. The sitemap should remain navigation-first.

---

# GLOBAL FOOTER SECTION CONTENT

HTML comment:

```html
<!-- GLOBAL FOOTER: Site footer — provide brand identity, main navigation, trust pages, legal pages, contact details and educational disclaimer in a compact premium layout. -->
```

Data attributes:

```html
data-section-id="global-footer"
data-section-type="footer"
data-content-module="site-footer"
data-layout-signature="unique-per-concept"
data-visual-role="global-navigation-and-trust"
```

Footer brand content:

Franciele Sofiati
Advanced Aesthetic Biomedicine
CRBM 6277
Laser and skin care guided by professional evaluation in Londrina, PR.

Footer tagline:

Take care of yourself with sophistication.

Footer navigation groups:

Pages:

* Home
* About
* Care
* Laser
* Skin
* Results
* Consultation
* Contact

Trust:

* Mission
* Values
* Testimonials
* FAQ
* Journal
* Blog

Legal:

* Legal
* Privacy
* Cookies
* Accessibility
* Sitemap

Contact:

* WhatsApp: (43) 9 9104-3536
* [sofiatimendonca@gmail.com](mailto:sofiatimendonca@gmail.com)
* @fransofiati_biomedica
* Londrina, PR

Footer disclaimer:

Information on this website is educational and does not replace an individual professional evaluation.

Copyright:

© 2026 Franciele Sofiati. All rights reserved.

Footer build instruction:

Every concept needs a different footer layout.

The footer must be compact, readable and premium.

Do not create oversized empty footer space.

Do not use a repeated weak leaf watermark.

Do not make text tiny.

Do not bury contact information.

Do not make every footer the same dark block.

Use different footer builds across concepts:

* compact editorial footer
* horizontal luxury footer
* split brand/contact footer
* newsletter-style footer without newsletter signup
* calm sitemap footer
* signature footer
* card-based footer
* two-row footer
* minimal legal footer
* image-accent footer

Contact must be easy to find.

Logo must be visible but not oversized.

Footer must work on mobile without becoming a huge empty block.

---

# GLOBAL FLOATING ACTIONS

## Floating WhatsApp

HTML comment:

```html
<!-- FLOATING ACTION: WhatsApp — fixed bottom-right contact shortcut, separate from header and mobile menu. -->
```

Label:

Message Franciele on WhatsApp

Link:

https://wa.me/5543991043536

Accessibility label:

Open WhatsApp contact with Franciele Sofiati

Build instruction:

Keep fixed bottom-right.

Do not place WhatsApp in the header menu.

Do not let it overlap the back-to-top button.

Make it accessible and mobile-friendly.

---

## Back to Top

HTML comment:

```html
<!-- FLOATING ACTION: Back to top — fixed scroll return button with accessible label. -->
```

Label:

Back to top

Accessibility label:

Return to the top of the page

Build instruction:

Keep near the WhatsApp button but visually separate.

Do not make the floating action area too large.

Do not block page content.

---

# GLOBAL HEADER CONTENT

HTML comment:

```html
<!-- GLOBAL HEADER: Main navigation — compact premium navigation with logo, primary pages, language switcher and consultation CTA. -->
```

Header content:

* Sofiati logo or monogram
* Home
* About
* Care
* Laser
* Skin
* Results
* Consultation
* Contact
* EN/PT language switcher
* Optional Consultation CTA

Header rules:

Do not show concept names in public header.

Do not show debug labels.

Do not show Text or Motion labels.

Do not show CRBM, WhatsApp, email or Instagram inside the main header.

Do not place WhatsApp in the header.

Keep the language switcher.

Keep mobile navigation clean and accessible.

Header build instruction:

Each concept can have a different header style, but all must be premium, compact and usable.

Possible variations:

* centred logo nav
* split navigation
* slim top identity bar
* editorial header
* floating framed nav
* compact sticky header
* transparent-to-solid header
* mobile drawer
* full-screen mobile overlay
* bottom mobile nav support if appropriate

---

# FINAL BUILD RULE FOR ALL 50 CONCEPTS

Use the same content system above.

Build each concept differently.

For every concept, create a unique:

* page rhythm
* hero structure
* image crop strategy
* card style
* button style
* spacing system
* footer layout
* mobile menu
* section order
* transition style
* visual emphasis

The user should be able to compare the 50 sites and immediately feel that they are genuinely different concepts, not copies with changed colours.

The content should remain consistent and polished.

The build must be different.
