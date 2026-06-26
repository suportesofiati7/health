# Concept 33 - Elan Brief

## 1. Concept Snapshot
- Concept number: 33
- Concept folder path: `concepts/33-elan`
- Files inspected: 40 files, including `concepts/33-elan/index.html`, `concepts/33-elan/css/style.css`, `concepts/33-elan/partials/header.html`, `concepts/33-elan/partials/mobile-menu.html`, `concepts/33-elan/partials/footer.html`, and planning docs.
- Missing expected files: none
- Screenshots inspected/available:
- `audit/screenshots/desktop/33-elan-desktop.png`
- `audit/screenshots/mobile/33-elan-mobile.png`
- `final/homepage-screenshots/desktop/concept-33-elan-home-desktop.png`
- `final/homepage-screenshots/mobile/concept-33-elan-home-mobile.png`
- Status: needs review
- Confidence level: high

## 2. Concept Purpose
- Intended impression: destination premium care translated into a Sofiati visual world, using destination journey pins as the governing asset language.
- Visitor emotion: elan brand narrative.
- Business goal: move visitors toward a professional evaluation without pressure or unsupported claims.
- Consultation/contact role: consultation is the primary conversion path; contact and WhatsApp support practical next steps.
- How it fits Sofiati: It is identified by `destination journey pins`, portrait treatment `sage duotone editorial profile tile`, motion `portrait lift`, form `botanical framed form` and footer `signature seal footer`. The HTML, CSS and JS include unique markers for this concept.

## 3. Visual Personality
- Mood: elan brand narrative.
- Energy: composed but visually marked by its asset language
- Softness/sharpness: fine-line panels; avoid one-note rounded-card repetition.
- Editorial/clinical balance: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Image-led or text-led feel: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Premium cues: bronze corner frame appears in the hero, section strip, mobile menu, form and footer.
- Trust cues: professional role, CRBM, evaluation-led copy, legal/contact footer, and page-flow links.

## 4. Layout Signature
- Homepage structure: elan-laser-light-sequence-hero-01, elan-split-portrait-hero-visual-story-02, elan-offset-consultation-ledger-content-03, elan-editorial-image-chapter-content-04, elan-horizontal-care-journey-pathway-05, elan-full-bleed-botanical-divider-content-06
- Section rhythm: # 33-elan Page Flow Map Concept strategy: Elan uses elan brand narrative as its page-flow lens. Same facts, distinct rhythm.
- Grid behavior: CSS selectors include site-header, header-actions, menu-button, header-card-stack, header-meta, header-main, header-split-nav, header-command, header-actions-left, header-kicker
- Spacing rhythm: CSS uses page width and spacing variables such as --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35
- Use of cards: avoid repeated equal-card grids; use mixed panels, notes, ledgers, routes, editorial image chapters, or compact accordions.
- Use of split layouts/image blocks: first homepage layout signatures are elan-laser-light-sequence-hero-01, elan-split-portrait-hero-visual-story-02, elan-offset-consultation-ledger-content-03, elan-editorial-image-chapter-content-04
- Density level: screenshots available for density review; compare header/footer contact sheets before changing spacing
- Scroll rhythm: page-flow, signature sequence, image rhythm, and CTA placement must be different enough to read as a separate premium concept.

## 5. Header Signature
- Logo placement: header class tokens `public-header-layout-elan`; brand mark path appears in header partial.
- Desktop nav structure: labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact, Home, About, Care, Laser.
- Nav spacing: controlled by `concepts/33-elan/css/style.css` around `.public-header`, `.desktop-nav`, and concept header layout classes.
- CTA placement: `.header-consultation` is inside `.public-header-tools` when present.
- Language switcher placement: status/header/menu use `.public-language` / `.language-switcher` where present.
- Active/hover states: inspect `.desktop-nav a:hover`, `:focus-visible`, and `[aria-current]` rules before editing.
- Sticky behavior: public header CSS uses sticky positioning in the shared concept stylesheet layer.
- Background behavior: This concept uses a destination header. The header is assigned the unique runtime marker `header-33-elan` and a concept-specific CSS composition.
- Risks: no active header issue recorded
- Files involved: `concepts/33-elan/partials/header.html`, `concepts/33-elan/partials/navigation.html`, `concepts/33-elan/partials/mobile-menu.html`, `concepts/33-elan/css/style.css`, `concepts/33-elan/js/main.js`.

## 6. Mobile Menu Signature
- Trigger style: `.public-menu-button` / `[data-menu-toggle]` in the header partial.
- Menu opening style: local JS in `concepts/33-elan/js/main.js` toggles the `#mobile-menu` state.
- Layout: menu class tokens `public-menu-layout-bold-editorial`.
- Link rhythm: mobile labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact, Consultation.
- CTA treatment: `.mobile-consult` / `.public-mobile-cta` appears after the primary mobile links.
- Language switcher behavior: `EN/PT controls present`.
- Close behavior: `[data-menu-close]` close control is present when parsed from the mobile partial.
- Accessibility concerns: check focus order and dialog state after any menu edits; screenshot review required at 360px and 390px.
- Visual personality: The mobile menu uses a journey planner menu with local JavaScript in `js/main.js`, local partial loading in `js/partials.js` and local markup in `partials/mobile-menu.html`.

## 7. Hero Signature
- Hero structure: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Heading style: homepage H1 is `Skin care planned with precision`.
- Image placement: homepage images include assets/brand/sofiati-monogram-bronze.png, assets/images/contact/sofiati-contact-business-card-inspired-layout.webp, assets/images/faq/sofiati-faq-brand-manual-clinical-guidance.webp, assets/images/care/sofiati-care-botanical-clinical-brand-application.webp
- CTA placement: inspect `.hero-actions`, `.button-primary`, `.button-soft`, and page-flow CTA roles.
- Above-the-fold balance: verify with homepage desktop/mobile screenshots before editing hero spacing.
- Desktop/mobile behavior: generated screenshots are listed above; mobile cropping must be checked at 360px and 390px.
- Cropping risks: image refs and object-fit rules in CSS must be preserved; portrait concept is sage duotone editorial profile tile, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-elan.webp`..
- Uniqueness: do not turn this hero into another concept's split-screen/card-grid pattern. a generic medical directory, a pink beauty-salon template, hospital-blue stock design, or the same build with swapped colors.

## 8. Page Flow Signature
- Home: Introduce evaluation-led aesthetic biomedicine, orient visitors, and move them calmly toward consultation. Layout rhythm: elan-skin-texture-editorial, elan-offset-consultation-ledger, elan-asymmetric-laser-panel, elan-minimal-legal-ledger. Internal links: about.html, care.html, laser.html, skin.html, results.html, values.html, mission.html, faq.html, journal.html, blog.html, consultation.html, contact.html.
- About: Build trust around Franciele's professional identity, credentials, care philosophy, and ethical boundaries. Layout rhythm: elan-skin-texture-editorial, elan-offset-consultation-ledger, elan-asymmetric-laser-panel, elan-minimal-legal-ledger. Internal links: mission.html, values.html, care.html, laser.html, skin.html, results.html, consultation.html, contact.html.
- Care: Explain how personalised care moves from evaluation to planning, aftercare, and responsible expectations. Layout rhythm: elan-consultation-desk-still-life, elan-split-portrait-hero, elan-full-bleed-botanical-divider, elan-contact-card-overlap. Internal links: consultation.html, laser.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Laser: Frame laser care through suitability, preparation, technology, aftercare, and realistic outcomes. Layout rhythm: elan-skin-texture-editorial, elan-offset-consultation-ledger, elan-asymmetric-laser-panel, elan-minimal-legal-ledger. Internal links: consultation.html, care.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Skin: Guide skin quality conversations around texture, luminosity, sensitivity, cleansing, and professional assessment. Layout rhythm: elan-consultation-desk-still-life, elan-split-portrait-hero, elan-full-bleed-botanical-divider, elan-contact-card-overlap. Internal links: consultation.html, care.html, laser.html, results.html, faq.html, journal.html, blog.html, values.html.
- Results: Set responsible expectations without promises, fake outcomes, or pressure-based conversion. Layout rhythm: elan-split-portrait-hero, elan-horizontal-care-journey, elan-magazine-article-grid, elan-floating-note-system. Internal links: consultation.html, care.html, laser.html, skin.html, testimonials.html, faq.html, legal.html, privacy.html.
- Consultation: Help visitors request evaluation with clear expectations, privacy notes, and useful preparation. Layout rhythm: elan-asymmetric-laser-panel, elan-contact-card-overlap, elan-portrait-and-process-band, elan-large-type-statement. Internal links: care.html, laser.html, skin.html, results.html, faq.html, privacy.html, contact.html.
- Contact: Make approved contact routes clear while keeping care decisions evaluation-led. Layout rhythm: elan-split-portrait-hero, elan-horizontal-care-journey, elan-magazine-article-grid, elan-floating-note-system. Internal links: consultation.html, faq.html, privacy.html, accessibility.html, legal.html.
- FAQ: Answer practical questions in concise, careful language that guides visitors to professional evaluation. Layout rhythm: elan-large-type-statement, elan-laser-light-sequence, elan-horizontal-care-journey, elan-magazine-article-grid. Internal links: care.html, laser.html, skin.html, results.html, consultation.html, contact.html, privacy.html.
- Journal: Offer editorial education that helps visitors ask better questions before care. Layout rhythm: elan-split-portrait-hero, elan-horizontal-care-journey, elan-magazine-article-grid, elan-floating-note-system. Internal links: care.html, laser.html, skin.html, results.html, blog.html, consultation.html.
- Blog: Present deeper educational articles on skin, laser, consultation, aftercare, and expectations. Layout rhythm: elan-consultation-desk-still-life, elan-split-portrait-hero, elan-full-bleed-botanical-divider, elan-contact-card-overlap. Internal links: care.html, laser.html, skin.html, results.html, journal.html, consultation.html.
- Legal: Clarify responsible website use, educational limits, legal boundaries, and approved contact routes. Layout rhythm: elan-skin-texture-editorial, elan-offset-consultation-ledger, elan-asymmetric-laser-panel, elan-minimal-legal-ledger. Internal links: privacy.html, cookies.html, accessibility.html, contact.html, sitemap.html.

## 9. Footer Signature
- Footer structure: classes `public-footer-33, public-footer-recipe-elan, public-footer-icons-diamond, public-footer-divider-editorial-rule, public-footer-hover-gold-sweep, public-footer-shell`; recipe `elan`.
- Column rhythm/headings: footer labels parsed as Consultation, Home, About, Care, Laser, Skin, Results, Consultation, Contact, Mission, Values, Testimonials, FAQ, Journal, Blog, Legal, Privacy, Cookies.
- Legal/contact areas: Legal and Contact must remain; full street address must not be added.
- Copyright: centered alignment must be verified in rendered desktop and mobile screenshots.
- Decorative assets/background: The footer uses a destination footer, local contact hierarchy and concept-specific footer marker `footer-33-elan`.
- Mobile stacking: verify in the mobile header/footer screenshot sheet after any footer edit.
- Alignment risks: C33-LABEL-001, C33-SITEMAP-001, C33-RENDER-001
- Files involved: `concepts/33-elan/partials/footer.html`, `concepts/33-elan/css/style.css`.

## 10. CTA Signature
- Header CTA: `.header-consultation` should remain visually stronger than ordinary nav links.
- Hero CTA: driven by `.hero-actions` and page-specific button markup.
- Section CTAs: page-flow map assigns contextual CTA roles by section.
- Contact CTA: `contact.html` and `partials/contact-card.html` hold contact route emphasis.
- Form CTA: `partials/consultation-form.html` controls the form submission button and consent pattern.
- WhatsApp CTA: `partials/floating-whatsapp.html` and `js/main.js` mount the `wa.me/5543991043536` route.
- Footer CTA: `.footer-cta` in footer partial should stay calmer than the header/hero primary CTA.
- Visual priority: botanical framed form with a botanical frame, focus glow, privacy acknowledgement, honeypot, loading, success and error states.
- Accessibility: preserve labels, focus states, and privacy acknowledgement.

## 11. Typography Signature
- Heading typography: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Body typography: stylesheet evidence uses Inter/system sans-serif for body copy.
- Nav typography: compact uppercase/small-label rhythm appears in nav/status rules.
- Button typography: CTA/button rules use bold small sans-serif labels.
- Readability: preserve contrast against #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35 backgrounds.
- Mobile scaling: verify h1/h2/nav/button fit at 360px and 390px after edits.

## 12. Colour, Glow, and Texture Signature
- Primary colors: #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35, #FDE3B0, #2E3631, #706B63, #879588
- Accent/background variables: --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35, --champagne: #FDE3B0, --ink: #2E3631, --muted: #706B63, --accent: #879588, --surface: #F8F4EA, --line: rgba(37,35,33,.14)
- Glow use: bronze corner frame appears in the hero, section strip, mobile menu, form and footer.
- Gradients/texture use: inspect `body::before`, asset background variables, and concept asset overlays.
- Contrast risks: language switchers, dark footers, and pale nav states need rendered contrast review.

## 13. Image and Asset Rhythm
- Asset idea: Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.
- Hero/portrait use: sage duotone editorial profile tile, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-elan.webp`.
- Service/botanical/icons: A custom destination journey pins SVG icon pack covers consultation, laser, skin, care, evaluation, safety, aftercare, results, journal, mission, values, contact, technology, credentials, WhatsApp and back to top.
- Key asset paths:
- `concepts/33-elan/assets/animations/motion-path.svg`
- `concepts/33-elan/assets/backgrounds/botanical-background.svg`
- `concepts/33-elan/assets/backgrounds/mobile-menu-background.svg`
- `concepts/33-elan/assets/botanical/botanical-quote.svg`
- `concepts/33-elan/assets/botanical/bronze-branch.svg`
- `concepts/33-elan/assets/botanical/footer-botanical-stamp.svg`
- `concepts/33-elan/assets/botanical/gold-leaf-divider.svg`
- `concepts/33-elan/assets/botanical/monogram-wreath.svg`
- `concepts/33-elan/assets/botanical/sage-botanical-corner.svg`
- `concepts/33-elan/assets/botanical/section-separator.svg`
- `concepts/33-elan/assets/brand/assinatura-1.jpg`
- `concepts/33-elan/assets/brand/footer-signature-watermark.png`
- Alt text risks: static alt audit has passed historically; re-run after image changes.
- Repeated asset risks: do not reuse another concept's portrait frame, icon pack, or divider treatment.

## 14. Animation and Interaction Signature
- Motion idea: portrait lift controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.
- Scroll/hover/menu effects: CSS selectors include menu-button, menu-button-visible, mobile-menu, mobile-menu-top, mobile-menu-links, mobile-menu-primary, mobile-menu-secondary, mobile-menu-note, mobile-menu-bloom, mobile-menu-concierge, hero, hero-copy
- JS hooks: menu/lang/form/floating hooks found
- Reduced-motion considerations: preserve `body.reduce-motion` and CSS reduced-motion behavior where present.
- Performance risks: avoid adding libraries for small concept-level animation repairs.

## 15. Content Voice and Copy Risks
- Client-facing quality: copy should stay calm, evaluation-led, educational, and professional.
- Generic/placeholder risks: compare H1s and section headings against nearby concepts before rewriting.
- CTA clarity: consultation language should stay clear without pressure.
- Ethical results language: do not add guarantees, fake testimonials, fake before/after proof, or treatment suitability claims.
- Human review: required for any medical/aesthetic claim changes beyond formatting or obvious label cleanup.

## 16. SEO and Schema Snapshot
- Title/meta pattern: `Evaluation-Led Aesthetic Care | Elan | Franciele Sofiati` / `Evaluation-Led Aesthetic Care for Franciele Sofiati in Londrina, PR, guided by evaluation-first care, ethical expectations and the Elan concept.`
- H1 pattern: 1 H1 parsed; `Skin care planned with precision`
- Schema pattern: `partials/schema.html` plus page head partials control JSON-LD evidence.
- Sitemap presence: `concepts/33-elan/sitemap.html` exists.
- Internal links: internal-link map length 164 lines; inspect before page link changes.
- Image alt status: use static alt audit after image edits.
- Canonical status: inspect `partials/head.html` before SEO edits.

## 17. Accessibility Snapshot
- Semantic structure: verify one H1, nav landmarks, footer nav groups, form labels, and dialog attributes.
- Heading order: static audit should remain PASS after content changes.
- Nav accessibility: header/menu controls use aria labels and expanded/hidden states; verify keyboard behavior manually.
- Focus states: inspect `:focus-visible` rules before changing nav/CTA styles.
- Contrast risks: language controls, pale header text, dark footer links, and overlaid CTA labels.
- Form labels: `partials/consultation-form.html` controls labels and consent.
- Alt text: preserve current alt audit pass.

## 18. Responsive Design Snapshot
- 360px: check mobile header, menu top controls, language switcher, hero cropping, and footer stack.
- 390px: check common mobile layout and floating WhatsApp overlap.
- 768px: check tablet transition between mobile menu and desktop nav.
- 1024px: check early desktop nav wrap.
- 1366px: check standard desktop header/footer balance.
- 1440px+: check wide desktop footer copyright centering and hero composition.
- Overflow risks: use `scripts/audit_rendered_concepts.py` plus screenshots.
- CTA stacking risks: check hero, menu, form, and footer CTAs separately.

## 19. Concept Uniqueness Analysis
- What makes it different: It is identified by `destination journey pins`, portrait treatment `sage duotone editorial profile tile`, motion `portrait lift`, form `botanical framed form` and footer `signature seal footer`. The HTML, CSS and JS include unique markers for this concept.
- Protected features: header `public-header-layout-elan`, menu `public-menu-layout-bold-editorial`, footer recipe `elan`, asset language `Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.`, motion `portrait lift controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.`.
- Concepts it risks resembling: compare closely against concepts `34` and `41` during duplicate-layout audits.
- Do not standardize: header rhythm, hero image placement, footer recipe, CTA shape, icon/divider assets, card radius, and motion timing.
- Can improve: active issues can be fixed using spacing, contrast, label, and alignment adjustments without replacing the `elan brand narrative.` visual grammar.

## 20. Issues Found During Audit
### C33-LABEL-001
- Page/component: global footer / footer labels
- File path: `concepts/33-elan/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/33-elan-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Verification method: Run rg label search and screenshot footer.
- Fixed in this task: yes

### C33-SITEMAP-001
- Page/component: sitemap / sitemap labels
- File path: `concepts/33-elan/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Verification method: Run rg for Brand and education.
- Fixed in this task: yes

### C33-RENDER-001
- Page/component: index.html / Copyright center delta -226px
- File path: `concepts/33-elan/index.html`
- Screenshot path: `audit/screenshots/desktop/33-elan-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fixed in this task: no

## 21. Fixes Applied
- C33-LABEL-001: Footer public labels were cleaned from Brand/Brand and Trust to About. File: `concepts/33-elan/partials/footer.html`. Verification: Run rg label search and screenshot footer..
- C33-SITEMAP-001: Sitemap Brand and education label was cleaned to About and education. File: `concepts/33-elan/sitemap.html`. Verification: Run rg for Brand and education..

## 22. Final Concept Status
- Status: needs review
- Confidence level: high
- Remaining issues: C33-RENDER-001
- Next recommended task: follow the issue register and run rendered verification for this concept before implementation closure.
