#!/usr/bin/env python3
"""Generate the 50 standalone Sofiati static website concepts.

The generated HTML is English source content. Run translate_pages.py afterwards
when the bilingual PT/EN presentation should be Portuguese by default.
"""

from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path
from textwrap import dedent


ROOT = Path(__file__).resolve().parents[1]
CONCEPTS_PATH = ROOT / "data" / "concepts.json"
CONCEPTS_DIR = ROOT / "concepts"
CSS_DIR = ROOT / "css" / "concepts"

PAGES = [
    "home",
    "about",
    "mission",
    "values",
    "care",
    "laser",
    "skin",
    "results",
    "testimonials",
    "journal",
    "blog",
    "faq",
    "contact",
    "consultation",
    "legal",
    "privacy",
    "cookies",
    "accessibility",
    "404",
]

PAGE_LABELS = {
    "home": "Home",
    "about": "About",
    "mission": "Mission",
    "values": "Values",
    "care": "Care",
    "laser": "Laser",
    "skin": "Skin",
    "results": "Results",
    "testimonials": "Testimonials",
    "journal": "Journal",
    "blog": "Blog",
    "faq": "FAQ",
    "contact": "Contact",
    "consultation": "Consultation",
    "legal": "Legal",
    "privacy": "Privacy",
    "cookies": "Cookies",
    "accessibility": "Accessibility",
    "404": "404",
}

HERO_IMAGES = {
    "home": "assets/images/home/sofiati-home-hero-botanical-clinical-luxury.webp",
    "about": "assets/images/about/franciele-sofiati-brand-story-botanical-moodboard.webp",
    "mission": "assets/images/mission/sofiati-mission-science-care-naturalness.webp",
    "values": "assets/images/values/sofiati-values-care-confidence-safety-naturalness.webp",
    "care": "assets/images/care/sofiati-care-botanical-clinical-brand-application.webp",
    "laser": "assets/images/laser/sofiati-laser-botanical-precision-story-background.webp",
    "skin": "assets/images/skin/sofiati-skin-care-soft-sage-story-background.webp",
    "results": "assets/images/results/sofiati-results-ethical-expectations-botanical.webp",
    "testimonials": "assets/images/testimonials/sofiati-testimonials-approval-first-contact-card.webp",
    "journal": "assets/images/journal/sofiati-journal-typography-palette-system.webp",
    "blog": "assets/images/blog/sofiati-blog-palette-care-education.webp",
    "faq": "assets/images/faq/sofiati-faq-brand-manual-clinical-guidance.webp",
    "contact": "assets/images/contact/sofiati-contact-business-card-inspired-layout.webp",
    "consultation": "assets/images/consultation/sofiati-consultation-stationery-care-pathway.webp",
    "legal": "assets/images/legal/sofiati-legal-monogram-pattern-sage.webp",
    "privacy": "assets/images/legal/sofiati-legal-monogram-pattern-sage.webp",
    "cookies": "assets/images/legal/sofiati-legal-monogram-pattern-sage.webp",
    "accessibility": "assets/images/faq/sofiati-faq-brand-manual-clinical-guidance.webp",
    "404": "assets/images/legal/sofiati-legal-monogram-pattern-sage.webp",
}

DISCLAIMERS = (
    "Results may vary according to individual characteristics, professional evaluation, treatment indication, protocol, number of sessions and aftercare.",
    "Information on this website is educational and does not replace an individual professional evaluation.",
)

PAGE_DEFS: dict[str, dict[str, object]] = {
    "home": {
        "theme": "Premium introduction",
        "title": "Laser, skin and advanced aesthetic care in Londrina, PR.",
        "lede": "Franciele Sofiati brings biomedical training, clinical calm and laser-focused precision to personalised aesthetic care.",
        "sections": [
            ("Advanced aesthetic biomedicine", "Professional care is introduced through evaluation, science-led planning and a warm, botanical visual language."),
            ("Professional evaluation", "Each journey begins with goals, history, skin response and suitability before any protocol is indicated."),
            ("Laser care", "Laser hair removal, rejuvenation education and technology-based care are presented with clear preparation and aftercare boundaries."),
            ("Skin quality", "Skin cleansing, melasma education, rosacea education and texture support are organised as calm educational pathways."),
            ("Results with responsibility", "The page explains natural-looking results without guarantees, pressure tactics or unapproved before-and-after imagery."),
            ("Consultation pathway", "Visitors are guided toward WhatsApp, email or a consultation request with only Londrina, PR shown as the location."),
            ("Journal preview", "Educational notes from skin, laser and aftercare topics create a quieter alternative to sales-led clinic content."),
        ],
    },
    "about": {
        "theme": "Professional story",
        "title": "A biomedical foundation for precise, human aesthetic care.",
        "lede": "Franciele Sofiati is positioned as a biomedical professional with clinical pathology background, aesthetics, cosmetology and laser specialism.",
        "sections": [
            ("Professional portrait", "The page frames Franciele with a refined signature identity instead of celebrity-style personal branding."),
            ("Clinical pathology background", "Her clinical foundation supports a careful reading of skin history, contraindications and treatment suitability."),
            ("Aesthetician and cosmetologist background", "Aesthetic care is described as attentive, technical and grounded in professional scope."),
            ("Laser specialist section", "Laser expertise appears as a specialist focus with educational language around technology and safety."),
            ("Personal method", "The Sofiati method combines listening, evaluation, protocol planning, aftercare and measured follow-up."),
            ("Brand identity story", "Sage, ivory, cream, bronze and botanical details create a clinical mood that still feels feminine and warm."),
        ],
    },
    "mission": {
        "theme": "Purpose and responsibility",
        "title": "Care that protects natural expression while respecting safety.",
        "lede": "The mission is to make advanced aesthetic biomedicine feel clear, responsible and personal before it feels persuasive.",
        "sections": [
            ("Core purpose statement", "The site gives priority to patient education, professional judgement and natural-looking aesthetic direction."),
            ("Care philosophy", "Care is presented as quiet confidence: precise enough for technology, soft enough for human attention."),
            ("Natural-looking results statement", "The mission avoids transformation rhetoric and keeps expectations aligned with individual characteristics."),
            ("Safety commitment", "Preparation, contraindications, aftercare and follow-up are treated as part of the service, not fine print."),
            ("Technology commitment", "Laser and skin technologies are positioned as tools that require evaluation, not shortcuts."),
            ("Human warmth", "The voice stays calm, respectful and welcoming for clients who want clarity before deciding."),
        ],
    },
    "values": {
        "theme": "Care values",
        "title": "Precision, warmth and responsibility as visible values.",
        "lede": "The values page turns the Sofiati identity into practical standards for consultation, treatment and communication.",
        "sections": [
            ("Precision value", "Every recommendation should have a reason, a suitability check and a clear aftercare plan."),
            ("Safety value", "The website refuses sensational language, claims that erase risk and pressure around aesthetic decisions."),
            ("Naturalness value", "Natural-looking results are framed as alignment with each person's features, skin and context."),
            ("Warmth value", "The tone is feminine and welcoming without becoming casual, vague or salon-like."),
            ("Technology value", "Equipment references are educational and connected to evaluation rather than fixed outcomes."),
            ("Ethics value", "No fake testimonials, no unapproved patient images, no full address and no sensational result claims."),
        ],
    },
    "care": {
        "theme": "Evaluation-led care",
        "title": "A structured care pathway before any aesthetic protocol.",
        "lede": "Care is organised around suitability, planning, preparation, aftercare and measured expectations.",
        "sections": [
            ("Treatment category architecture", "Advanced aesthetic biomedicine is divided into evaluation, laser, skin quality and results education."),
            ("Category navigation", "Visitors can move between laser care, skin care and consultation without feeling pushed into a procedure."),
            ("Treatment suitability", "Each treatment category is presented as an indication to discuss, not a guarantee to purchase."),
            ("Preparation guidance", "Preparation is written as part of safety and comfort before technology-based treatments."),
            ("Aftercare guidance", "Aftercare is included in the journey because outcomes depend on individual response and follow-up."),
            ("FAQ preview", "Common questions are answered with professional boundaries and a clear route to individual evaluation."),
        ],
    },
    "laser": {
        "theme": "Laser education",
        "title": "Laser care explained with precision, safety and restraint.",
        "lede": "Laser hair removal, rejuvenation and technology references are presented as educational topics that require professional evaluation.",
        "sections": [
            ("Laser hair removal", "The page introduces laser hair removal with preparation, phototype considerations and session planning."),
            ("Laser Light Sheer Duet reference", "Light Sheer Duet appears as an equipment reference drawn from public Sofiati education themes."),
            ("Laser rejuvenation", "Rejuvenation is described through collagen, texture and skin quality education rather than sudden promises."),
            ("Laser Harmony reference", "Laser Harmony is presented as a technology topic for spots, redness, rejuvenation and professional indication."),
            ("ND:YAG education", "ND:YAG appears as an educational note connected to vascular, phototype and safety discussions."),
            ("Aftercare and risk disclaimer", "Aftercare, sun care, intervals and individual response are made visible before conversion."),
        ],
        "disclaimer": True,
    },
    "skin": {
        "theme": "Skin quality education",
        "title": "Skin care for texture, clarity and calm confidence.",
        "lede": "Skin cleansing, quality, spots, melasma, rosacea, flaccidity and wrinkles are organised as education-led care topics.",
        "sections": [
            ("Skin cleansing", "Skin cleansing is framed as a professional care category with assessment, comfort and barrier respect."),
            ("Skin quality", "Skin quality content focuses on texture, glow, hydration support and realistic maintenance."),
            ("Spots and melasma education", "Spots and melasma are discussed as complex concerns that require evaluation and careful expectations."),
            ("Rosacea education", "Rosacea education prioritises sensitivity, redness triggers and technology suitability."),
            ("Flaccidity and wrinkles education", "Flaccidity and wrinkles are treated with natural-looking language and long-view care."),
            ("Ultrasonic peeling education", "Ultrasonic peeling appears as an educational topic until the confirmed service menu is approved."),
        ],
        "disclaimer": True,
    },
    "results": {
        "theme": "Ethical results",
        "title": "Results with responsibility, privacy and realistic expectations.",
        "lede": "The results page avoids fake outcomes and focuses on what affects aesthetic response over time.",
        "sections": [
            ("Ethical results statement", "Results are discussed through evaluation, protocol selection, number of sessions and aftercare."),
            ("Results-vary disclaimer", "The page gives the variation disclaimer a visible role instead of hiding it below the fold."),
            ("Privacy-respecting image approach", "No patient image, testimonial or before-and-after material is shown without explicit written approval."),
            ("Treatment filter", "Visitors can understand which category they are researching before discussing suitability."),
            ("What affects results", "Skin history, lifestyle, intervals, indications and home care are named as variables."),
            ("Consultation-before-results", "The route back to consultation is presented as the responsible next step."),
        ],
        "disclaimer": True,
    },
    "testimonials": {
        "theme": "Approval-first social proof",
        "title": "A testimonial system that waits for approval before speaking.",
        "lede": "This page explains how patient stories can be added later without inventing quotes or exposing private results.",
        "sections": [
            ("Ethical testimonial policy", "Testimonials are reserved for real approved client words, never placeholder praise."),
            ("Review card layout", "The layout is ready for future approved notes while remaining honest in this presentation version."),
            ("Anonymous testimonial style", "Anonymous summaries can be used only when they protect privacy and still have approval."),
            ("Source verification note", "Each future quote needs a source, permission and review before publication."),
            ("Client experience themes", "The current version names themes such as clarity, care and aftercare without pretending to quote patients."),
            ("No-guarantee disclaimer", "Social proof cannot imply outcome certainty, identical results or treatments without risk."),
        ],
    },
    "journal": {
        "theme": "Educational journal",
        "title": "A calm journal for laser, skin and aftercare education.",
        "lede": "Journal architecture turns Instagram-style education into evergreen, responsible website content.",
        "sections": [
            ("Latest posts grid", "Education topics include laser rejuvenation, Light Sheer Duet, skin cleansing and rosacea awareness."),
            ("Featured article", "A featured article slot leads with evaluation before technique or equipment."),
            ("Professional evaluation articles", "Evaluation articles help clients prepare better questions before booking."),
            ("Laser articles", "Laser content is grouped by hair removal, rejuvenation, Harmony, ND:YAG and aftercare."),
            ("Skin care articles", "Skin content covers cleansing, spots, melasma, rosacea, texture and barrier-minded care."),
            ("Aftercare articles", "Aftercare content keeps responsibility visible after the consultation call to action."),
        ],
    },
    "blog": {
        "theme": "Educational blog",
        "title": "Short-form education with professional boundaries.",
        "lede": "The blog translates public content themes into concise, safe reading paths for people considering care.",
        "sections": [
            ("Article library", "The library balances laser, skin, consultation and aftercare topics without exaggerated promises."),
            ("Professional evaluation articles", "Evaluation posts explain why indication comes before procedure selection."),
            ("Technology articles", "Technology posts mention equipment only as educational references and not as guaranteed solutions."),
            ("Seasonal skin care", "Seasonal guidance focuses on sun care, sensitivity, maintenance and realistic planning."),
            ("FAQ-to-article section", "Common questions become deeper reading without replacing an individual consultation."),
            ("Blog CTA", "Every article path returns to a professional evaluation rather than a hard-sell offer."),
        ],
    },
    "faq": {
        "theme": "Patient questions",
        "title": "Questions answered with clarity, restraint and next steps.",
        "lede": "The FAQ page gives enough information to reduce anxiety without pretending to diagnose online.",
        "sections": [
            ("Evaluation FAQ group", "Questions about first consultation, suitability and planning sit first."),
            ("Laser FAQ group", "Laser questions cover hair removal, rejuvenation, technology and aftercare."),
            ("Skin FAQ group", "Skin questions cover cleansing, melasma, rosacea, texture and sensitive skin education."),
            ("Results FAQ group", "Results questions answer what can vary and why protocols differ."),
            ("Aftercare FAQ group", "Aftercare questions keep safety and follow-up visible."),
            ("Booking FAQ group", "Booking questions direct visitors to WhatsApp and consultation without exposing a full address."),
        ],
    },
    "contact": {
        "theme": "Business-card contact",
        "title": "Contact Franciele Sofiati in Londrina, PR.",
        "lede": "The contact page keeps the business-card elegance of the brand while protecting private address details.",
        "sections": [
            ("WhatsApp CTA", "WhatsApp is the primary direct route for consultation requests and care questions."),
            ("Instagram link", "Instagram is linked for public education, not for copying patient media into the website."),
            ("Email link", "Email remains available for formal questions, approvals and content review."),
            ("Contact details", "Only WhatsApp, email, Instagram, CRBM 6277 and Londrina, PR are published."),
            ("No full address rule", "No street address, apartment detail, interactive route or pinpoint location is included."),
            ("Privacy note", "Visitors are reminded not to send sensitive information through unsecured forms."),
        ],
    },
    "consultation": {
        "theme": "Consultation pathway",
        "title": "Request a professional evaluation before choosing a protocol.",
        "lede": "The consultation journey helps visitors share goals while understanding that indication depends on individual evaluation.",
        "sections": [
            ("Consultation hero", "The page makes the first step feel calm, private and structured."),
            ("Who the evaluation is for", "Evaluation is for people considering laser, skin quality care or advanced aesthetic planning."),
            ("What happens before booking", "Visitors are encouraged to describe goals and relevant care history without oversharing sensitive details."),
            ("What happens during evaluation", "Suitability, contraindications, expectations, protocol options and aftercare are discussed."),
            ("What not to expect", "The page clearly avoids overnight-change rhetoric, sensational promises and outcome certainty."),
            ("Consultation form", "The static form is a presentation component; WhatsApp remains the live contact route."),
        ],
        "disclaimer": True,
        "form": True,
    },
    "legal": {
        "theme": "Professional boundaries",
        "title": "Legal and professional boundaries for the Sofiati presentation.",
        "lede": "Legal content keeps the presentation responsible until final service, regulatory and privacy review.",
        "sections": [
            ("Legal hub", "This page routes to privacy, cookies, accessibility and contact details."),
            ("Professional disclaimer", "Website information is educational and cannot replace individual professional evaluation."),
            ("Terms legal notice", "Static presentation content requires final legal, medical and service review before production."),
            ("No-guarantee disclaimer", "No page may promise fixed results, procedures without risk or identical outcomes."),
            ("No full address rule", "Only Londrina, PR is published; no interactive route or street address is included."),
            ("Accessibility statement link", "Accessibility is treated as part of launch readiness, not an afterthought."),
        ],
    },
    "privacy": {
        "theme": "Privacy notice",
        "title": "Privacy-first content for consultation and education.",
        "lede": "The privacy page protects address details, patient media, form data expectations and future analytics consent.",
        "sections": [
            ("Privacy summary", "The presentation uses minimal data and does not activate real analytics identifiers."),
            ("Data use", "Future form and analytics handling should be confirmed before production."),
            ("Sensitive information note", "Visitors should avoid sending sensitive health details through open website fields."),
            ("Analytics privacy", "Analytics placeholders remain inactive until consent settings and real IDs are approved."),
            ("Instagram content policy", "Public Instagram themes may guide education, but captions, images and patient media need approval."),
            ("Address privacy", "The site publishes Londrina, PR only and avoids pinpoint location or full address language."),
        ],
    },
    "cookies": {
        "theme": "Cookie preferences",
        "title": "Cookie preferences kept simple and visible.",
        "lede": "The cookie page documents the presentation banner and keeps optional tracking inactive until approval.",
        "sections": [
            ("Cookie policy summary", "The current static concept stores only the visitor's cookie preference."),
            ("Necessary cookies", "Necessary preference storage supports the banner and language switcher."),
            ("Analytics cookies", "Analytics cookies are placeholder-only and inactive until real consent and IDs are configured."),
            ("Marketing cookies", "Marketing cookies are not active in this static presentation."),
            ("Managing preferences", "Visitors can change optional preferences through the banner controls."),
            ("No hidden tracking", "No hidden tracking, embedded route or third-party patient media is added."),
        ],
    },
    "accessibility": {
        "theme": "Accessibility promise",
        "title": "Accessible structure for a calm, premium review experience.",
        "lede": "Accessibility choices support keyboard movement, readable text and reduced motion preferences across the 50 concepts.",
        "sections": [
            ("Accessibility statement", "The page documents launch standards for semantic HTML, headings and readable controls."),
            ("Keyboard navigation", "Menus, forms, links and concept controls are built to be reachable by keyboard."),
            ("Visible focus states", "Focus states remain visible against sage, ivory, cream and bronze surfaces."),
            ("Reduced motion", "Motion is subtle and respects reduced-motion preferences where possible."),
            ("Labelled forms", "Contact and consultation form fields use visible labels and clear messaging."),
            ("Accessible mobile menu", "The mobile menu uses open and close controls with accessible labels."),
        ],
    },
    "404": {
        "theme": "Recovery page",
        "title": "Page not found.",
        "lede": "A quiet recovery page helps visitors return to consultation, journal content or the concept selector.",
        "sections": [
            ("Popular paths", "The 404 page immediately offers home, consultation, FAQ and contact routes."),
            ("Consultation route", "Visitors who were looking for treatment information can move to evaluation-first content."),
            ("Journal route", "Education remains available without making procedure claims."),
            ("Legal route", "Privacy, cookies, accessibility and professional boundaries stay one step away."),
            ("Contact route", "WhatsApp, email and Instagram are available without publishing a full address."),
            ("Back to concept", "The page sends reviewers back into the current concept instead of ending the journey."),
        ],
    },
}

STYLE_FAMILIES = [
    "editorial split care journey",
    "business-card contact architecture",
    "botanical clinic magazine",
    "laser technology dossier",
    "quiet luxury skincare journal",
    "mobile story-led pathway",
    "clinical proof and education grid",
    "monogram-centered sanctuary",
    "consultation-first conversion studio",
    "minimal ivory appointment suite",
]

ACCENTS = [
    "#9A6B35",
    "#798A80",
    "#8A946F",
    "#6F8377",
    "#A17B52",
    "#879588",
    "#7C8E9B",
    "#8E7B56",
    "#734011",
    "#A2AE9F",
]


def family_extra_css(number: int, family: int, cycle: int) -> str:
    selector = f"body.concept-{number:02d}"
    extras = [
        f"""
        {selector}.page-home .hero{{align-items:end;border-bottom:1px solid var(--sofiati-line);}}
        {selector}.page-home .hero-copy{{padding-bottom:clamp(18px,4vw,48px);}}
        {selector}.page-home .hero-media{{min-height:clamp(500px,62vw,780px);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-areas:'media copy';}}
        {selector}.page-home .hero-media{{grid-area:media;min-height:clamp(420px,42vw,560px);border-radius:0 var(--hero-radius) var(--hero-radius) 0;}}
        {selector}.page-home .hero-copy{{grid-area:copy;}}
        """,
        f"""
        {selector}.page-home .hero{{width:100%;background:linear-gradient(90deg,color-mix(in srgb,var(--concept-accent) 22%,var(--sofiati-ivory)),var(--sofiati-white));}}
        {selector}.page-home .hero-media{{border-radius:0;box-shadow:none;min-height:clamp(380px,48vw,640px);}}
        {selector}.page-home .trust-capsules li{{background:rgba(255,255,255,.62);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:.72fr 1.28fr;}}
        {selector}.page-home .hero-copy{{border-left:4px solid var(--concept-accent);padding-left:clamp(18px,3vw,34px);}}
        {selector}.page-home .hero-media{{clip-path:inset(0 round 120px 8px 120px 8px);min-height:clamp(430px,50vw,700px);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:1.24fr .76fr;align-items:center;padding-bottom:clamp(30px,5vw,60px);}}
        {selector}.page-home .hero-copy{{max-width:760px;z-index:2;}}
        {selector}.page-home .hero-media{{min-height:clamp(320px,35vw,500px);width:100%;justify-self:end;box-shadow:0 18px 70px rgba(37,35,33,.08);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:.86fr 1.14fr;}}
        {selector}.page-home .hero::before{{content:'{cycle + 1:02d}';position:absolute;left:var(--space-page);top:140px;font-family:Georgia,serif;font-size:clamp(5rem,12vw,11rem);opacity:.05;}}
        {selector}.page-home .hero-media{{border-radius:999px 999px 8px 8px;min-height:clamp(430px,52vw,690px);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:.58fr 1.42fr;}}
        {selector}.page-home .hero-copy{{background:var(--sofiati-white);border:1px solid var(--sofiati-line);padding:clamp(18px,3vw,34px);}}
        {selector}.page-home .hero-media{{min-height:clamp(390px,38vw,560px);}}
        {selector}.page-home .trust-capsules{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:.84fr 1.16fr;}}
        {selector}.page-home .hero-media{{border-radius:50%;aspect-ratio:1;min-height:0;align-self:center;}}
        {selector}.page-home .hero-media figcaption{{left:50%;right:auto;transform:translateX(-50%);white-space:nowrap;}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:1.18fr .82fr;background:color-mix(in srgb,var(--concept-accent) 9%,var(--sofiati-ivory));}}
        {selector}.page-home .hero-actions{{border-top:1px solid var(--sofiati-line);padding-top:14px;}}
        {selector}.page-home .hero-media{{min-height:clamp(360px,42vw,620px);border-radius:var(--radius-small);}}
        """,
        f"""
        {selector}.page-home .hero{{grid-template-columns:1fr 1fr;padding-top:clamp(26px,5vw,62px);}}
        {selector}.page-home .hero-copy{{align-self:center;}}
        {selector}.page-home .hero-media{{min-height:clamp(300px,32vw,500px);align-self:end;}}
        {selector}.page-home .trust-capsules{{max-width:680px;}}
        """,
    ][family]
    return dedent(extras)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def esc(value: object) -> str:
    return escape(str(value), quote=True)


def title_case(value: str) -> str:
    keep_lower = {"and", "with", "for", "of", "the", "a", "an"}
    words = value.replace("-", " ").split()
    result = []
    for index, word in enumerate(words):
        lower = word.lower()
        result.append(lower if index and lower in keep_lower else word[:1].upper() + word[1:])
    return " ".join(result)


def concept_classes(index: int) -> str:
    family = (index - 1) % 10
    cycle = (index - 1) // 10
    return f"concept-family-{family + 1:02d} concept-cycle-{cycle + 1}"


def root_prefix() -> str:
    return "../../../"


def image_src(page: str, concept: dict[str, object]) -> str:
    if page == "home":
        family_images = [
            HERO_IMAGES["home"],
            HERO_IMAGES["contact"],
            HERO_IMAGES["journal"],
            HERO_IMAGES["laser"],
            HERO_IMAGES["skin"],
            HERO_IMAGES["care"],
            HERO_IMAGES["results"],
            HERO_IMAGES["values"],
            HERO_IMAGES["consultation"],
            HERO_IMAGES["about"],
        ]
        family = (int(concept["number"]) - 1) % 10
        return root_prefix() + family_images[family]
    return root_prefix() + HERO_IMAGES[page]


def page_hero_title(page: str, concept: dict[str, object]) -> str:
    if page != "home":
        return str(PAGE_DEFS[page]["title"])
    return f"{concept['name']}: {title_case(str(concept['layoutDirection']))} for laser, skin and advanced care."


def page_hero_lede(page: str, concept: dict[str, object]) -> str:
    if page != "home":
        return str(PAGE_DEFS[page]["lede"])
    return (
        f"A {concept['mood']} Sofiati direction with {concept['headerStyle']}, "
        f"{concept['mobileMenuStyle']} and evaluation-first content for Londrina, PR."
    )


def section_id(page: str, idx: int, title: str) -> str:
    return f"{page}-{idx}-{slugify(title)}"


def supporting_points(title: str, page: str) -> list[str]:
    base = [
        "professional evaluation",
        "personalised care",
        "technology with judgement",
        "aftercare visibility",
        "ethical language",
    ]
    page_specific = {
        "laser": ["laser hair removal", "laser rejuvenation", "phototype considerations", "preparation guidance", "session planning"],
        "skin": ["skin cleansing", "skin quality", "melasma education", "rosacea education", "barrier respect"],
        "results": ["results may vary", "privacy-first imagery", "expectation management", "protocol planning", "aftercare"],
        "contact": ["WhatsApp", "email", "Instagram", "Londrina, PR", "CRBM 6277"],
        "consultation": ["goals", "skin history", "suitability", "protocol options", "next steps"],
        "privacy": ["data minimisation", "address privacy", "content approval", "analytics consent", "data requests"],
        "cookies": ["necessary preference", "inactive analytics", "inactive marketing", "banner choice", "no hidden tracking"],
        "accessibility": ["keyboard access", "focus states", "semantic HTML", "reduced motion", "labelled forms"],
    }
    return [title, *page_specific.get(page, base)][:5]


def render_tiles(title: str, page: str, concept_name: str) -> str:
    cards = []
    for idx, point in enumerate(supporting_points(title, page), start=1):
        cards.append(
            "<div class=\"tile\">"
            f"<span>{idx:02d}</span>"
            f"<strong>{esc(point)}</strong>"
            f"<p class=\"small\">Built for {esc(concept_name)} with Sofiati's evaluation-first tone, botanical clinical calm and responsible boundaries.</p>"
            "</div>"
        )
    return f"<div class=\"tile-grid\">{''.join(cards)}</div>"


def render_timeline(title: str, page: str) -> str:
    items = "".join(f"<li>{esc(point)}</li>" for point in supporting_points(title, page))
    return f"<ol class=\"timeline\">{items}</ol>"


def render_feature_list(title: str, page: str, concept: dict[str, object]) -> str:
    points = supporting_points(title, page)
    rows = []
    for idx, point in enumerate(points, start=1):
        rows.append(
            "<li>"
            f"<span>{idx:02d}</span>"
            f"<strong>{esc(point)}</strong>"
            f"<small>{esc(concept['layoutDirection'])} keeps this page distinct while staying inside the Sofiati identity.</small>"
            "</li>"
        )
    return f"<ul class=\"feature-list\">{''.join(rows)}</ul>"


def render_statement_panel(title: str, page: str, concept: dict[str, object]) -> str:
    return (
        "<div class=\"statement-panel\">"
        f"<p class=\"eyebrow\">{esc(concept['name'])} method</p>"
        f"<strong>{esc(title)}</strong>"
        f"<p>{esc(PAGE_LABELS[page])} uses {esc(concept['layoutDirection'])}, {esc(concept['headerStyle'])}, {esc(concept['mobileMenuStyle'])} and {esc(concept['footerStyle'])} while preserving the Sofiati brand system.</p>"
        "</div>"
    )


def render_articles(page: str, concept_name: str) -> str:
    articles = {
        "journal": [
            ("Laser Harmony and realistic rejuvenation", "A technology note about collagen, texture and professional indication."),
            ("Rosacea, redness and sensitive skin", "Education around redness, triggers and evaluation before technology."),
            ("Skin cleansing as a professional ritual", "A calm guide to cleansing, barrier respect and maintenance."),
        ],
        "blog": [
            ("Why evaluation comes before protocol", "A short article for people comparing treatment categories."),
            ("Aftercare makes the plan visible", "Guidance on sun care, intervals and realistic expectations."),
            ("Melasma and spots need careful language", "A responsible overview that avoids promise-led claims."),
        ],
    }
    cards = []
    for title, copy in articles.get(page, articles["journal"]):
        cards.append(
            "<article class=\"article-card\">"
            f"<span class=\"eyebrow\">{esc(concept_name)} notes</span>"
            f"<h3>{esc(title)}</h3>"
            f"<p>{esc(copy)}</p>"
            "</article>"
        )
    return f"<div class=\"article-grid\">{''.join(cards)}</div>"


def render_faq_group() -> str:
    faqs = [
        ("Do results vary?", "Yes. Results depend on individual characteristics, indication, protocol, number of sessions and aftercare."),
        ("Can I choose a laser directly?", "Laser suitability should be discussed in professional evaluation before any protocol is indicated."),
        ("Is the address public?", "No. The website uses Londrina, PR only and does not publish a full address or pinpoint location."),
        ("Are testimonials real?", "No testimonial text is displayed until written approval and source verification are available."),
    ]
    return "".join(
        f"<details><summary>{esc(question)}</summary><p>{esc(answer)}</p></details>"
        for question, answer in faqs
    )


def render_contact_panel() -> str:
    return dedent(
        """
        <div class="contact-panel">
          <a class="contact-card" href="https://wa.me/5543991043536" rel="noopener" target="_blank"><span>WhatsApp</span><strong>(43) 9 9104-3536</strong></a>
          <a class="contact-card" href="mailto:sofiatimendonca@gmail.com"><span>Email</span><strong>sofiatimendonca@gmail.com</strong></a>
          <a class="contact-card" href="https://www.instagram.com/fransofiati_biomedica/" rel="noopener" target="_blank"><span>Instagram</span><strong>@fransofiati_biomedica</strong></a>
          <div class="contact-card"><span>Location</span><strong>Londrina, PR</strong></div>
        </div>
        """
    ).strip()


def render_form() -> str:
    return dedent(
        """
        <form class="form-panel" data-static-form>
          <div class="form-grid">
            <div class="form-field"><label for="name">Name</label><input id="name" name="name" autocomplete="name" required></div>
            <div class="form-field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
            <div class="form-field"><label for="interest">Treatment interest</label><select id="interest" name="interest"><option>Professional evaluation</option><option>Laser care</option><option>Skin care</option><option>Results education</option></select></div>
            <div class="form-field"><label for="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" autocomplete="tel"></div>
            <div class="form-field full"><label for="message">Message</label><textarea id="message" name="message" required></textarea></div>
          </div>
          <label class="checkbox-line"><input type="checkbox" required> I understand this form is part of a static presentation and does not replace a professional evaluation.</label>
          <button class="button primary" type="submit">Send request</button>
          <p class="form-message" role="status"></p>
        </form>
        """
    ).strip()


def render_right_component(page: str, idx: int, title: str, concept: dict[str, object]) -> str:
    if page == "faq":
        return render_faq_group()
    if page == "contact":
        return render_contact_panel() if idx in {1, 2, 3, 4} else render_feature_list(title, page, concept)
    if page == "consultation" and idx == 6:
        return render_form()
    if page in {"journal", "blog"} and idx in {1, 2, 3}:
        return render_articles(page, str(concept["name"]))
    mode = (int(concept["number"]) + idx + PAGES.index(page)) % 4
    if mode == 0:
        return render_timeline(title, page)
    if mode == 1:
        return render_feature_list(title, page, concept)
    if mode == 2:
        return render_statement_panel(title, page, concept)
    return render_tiles(title, page, str(concept["name"]))


def render_disclaimer(page: str) -> str:
    return (
        "<div class=\"disclaimer-box\" role=\"note\">"
        f"<p>{esc(DISCLAIMERS[0])}</p>"
        f"<p>{esc(DISCLAIMERS[1])}</p>"
        "</div>"
        if PAGE_DEFS[page].get("disclaimer")
        else ""
    )


def render_section(page: str, idx: int, title: str, copy: str, concept: dict[str, object]) -> str:
    sid = section_id(page, idx, title)
    visual = ""
    if idx % 3 == 1:
        visual = (
            "<figure class=\"section-visual\">"
            f"<img src=\"{esc(image_src(page, concept))}\" alt=\"Sofiati {esc(PAGE_LABELS[page])} visual for {esc(title)}\" loading=\"lazy\" decoding=\"async\" width=\"900\" height=\"675\">"
            "</figure>"
        )
    actions = ""
    if idx == len(PAGE_DEFS[page]["sections"]):
        actions = (
            "<div class=\"section-actions mt\">"
            "<a class=\"button primary\" href=\"../consultation/\">Request consultation</a>"
            "<a class=\"button sage\" href=\"https://wa.me/5543991043536\" rel=\"noopener\" target=\"_blank\">WhatsApp</a>"
            "</div>"
        )
    return (
        f"<section class=\"component-section section-{idx % 6} layout-{(int(concept['number']) + idx) % 8}\" id=\"{esc(sid)}\" aria-labelledby=\"heading-{esc(sid)}\">"
        "<div class=\"section-inner\">"
        "<div class=\"section-copy\">"
        f"<p class=\"eyebrow\">{esc(PAGE_DEFS[page]['theme'])}</p>"
        f"<h2 id=\"heading-{esc(sid)}\">{esc(title)}</h2>"
        f"<p class=\"section-body\">{esc(copy)}</p>"
        f"{visual}"
        "</div>"
        "<div class=\"section-component\">"
        f"{render_right_component(page, idx, title, concept)}"
        f"{actions}"
        "</div>"
        "</div>"
        "</section>"
    )


def render_page(concept: dict[str, object], page: str) -> str:
    number = str(concept["number"])
    name = str(concept["name"])
    label = PAGE_LABELS[page]
    page_def = PAGE_DEFS[page]
    title = f"{label} | {number} {name} | Franciele Sofiati"
    description = f"{label} page for the {name} Sofiati concept: English-first advanced aesthetic biomedicine, laser and skin care in Londrina, PR."
    canonical = f"https://www.sofiati.com/concepts/{number}/{page}/"
    sections = "\n".join(
        render_section(page, idx, section_title, copy, concept)
        for idx, (section_title, copy) in enumerate(page_def["sections"], start=1)
    )
    trust = "".join(
        f"<li>{esc(item)}</li>"
        for item in [
            "Franciele Sofiati",
            "CRBM 6277",
            "Advanced Aesthetic Biomedicine",
            "Londrina, PR",
            "Professional evaluation first",
        ]
    )
    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebSite", "@id": "https://www.sofiati.com/#website", "url": "https://www.sofiati.com", "name": "Franciele Sofiati", "inLanguage": "en"},
            {
                "@type": "Person",
                "@id": "https://www.sofiati.com/#franciele-sofiati",
                "name": "Franciele Sofiati",
                "jobTitle": "Advanced Aesthetic Biomedicine Professional",
                "description": "Biomedical professional with clinical pathology background, aesthetics and cosmetology training, laser specialist, CRBM 6277.",
                "url": "https://www.sofiati.com",
                "sameAs": ["https://www.instagram.com/fransofiati_biomedica/"],
            },
            {
                "@type": "ProfessionalService",
                "@id": "https://www.sofiati.com/#service",
                "name": "Franciele Sofiati Advanced Aesthetic Biomedicine",
                "areaServed": "Londrina, PR",
                "url": "https://www.sofiati.com",
                "telephone": "+55 43 99104-3536",
                "email": "sofiatimendonca@gmail.com",
            },
            {
                "@type": "WebPage",
                "@id": f"{canonical}#webpage",
                "url": canonical,
                "name": title,
                "description": description,
                "isPartOf": {"@id": "https://www.sofiati.com/#website"},
                "about": {"@id": "https://www.sofiati.com/#franciele-sofiati"},
                "inLanguage": "en",
            },
        ],
    }
    return dedent(
        f"""\
        <!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{esc(title)}</title>
        <meta name="description" content="{esc(description)}">
        <link rel="canonical" href="{esc(canonical)}">
        <meta property="og:title" content="{esc(title)}">
        <meta property="og:description" content="{esc(description)}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{esc(canonical)}">
        <meta property="og:image" content="https://www.sofiati.com/assets/og/sofiati-open-graph.webp">
        <meta property="og:image:alt" content="Franciele Sofiati botanical clinical luxury brand presentation">
        <meta name="twitter:card" content="summary_large_image">
        <link rel="icon" href="../../../assets/brand/sofiati-favicon.svg" type="image/svg+xml">
        <link rel="stylesheet" href="../../../css/tokens.css">
        <link rel="stylesheet" href="../../../css/base.css">
        <link rel="stylesheet" href="../../../css/typography.css">
        <link rel="stylesheet" href="../../../css/components.css">
        <link rel="stylesheet" href="../../../css/concept-components.css">
        <link rel="stylesheet" href="../../../css/utilities.css">
        <link rel="stylesheet" href="../../../css/animations.css">
        <link rel="stylesheet" href="../../../css/concepts/{number}.css">
        <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False, separators=(",", ":"))}</script>
        </head>
        <body class="concept-page concept-{number} {concept_classes(int(number))} page-{page}" data-concept="{number}" data-concept-name="{esc(name)}" data-page="{page}">
        <a class="skip-link" href="#main">Skip to main content</a>
        <div class="partial-slot" data-partial="header"><header class="site-header"><div class="header-inner"><a class="brand-link" href="../../../index.html"><span class="brand-text"><strong>Franciele Sofiati</strong><small>Advanced Aesthetic Biomedicine</small></span></a><a class="header-cta" href="../consultation/">Consultation</a></div></header></div>
        <div class="partial-slot" data-partial="mobile-menu"></div>
        <main id="main">
        <section class="hero" aria-labelledby="page-title">
          <div class="hero-copy soft-enter">
            <p class="eyebrow">Concept {number} - {esc(name)}</p>
            <h1 id="page-title">{esc(page_hero_title(page, concept))}</h1>
            <p class="lede">{esc(page_hero_lede(page, concept))}</p>
            <div class="hero-actions">
              <a class="button primary" href="../consultation/">Request consultation</a>
              <a class="button sage" href="https://wa.me/5543991043536" rel="noopener" target="_blank">WhatsApp</a>
              <a class="ghost-button" href="../faq/">Read FAQ</a>
            </div>
            <ul class="trust-capsules" aria-label="Trust details">{trust}</ul>
          </div>
          <figure class="hero-media soft-enter">
            <img src="{esc(image_src(page, concept))}" alt="Sofiati {esc(label)} concept visual in sage, ivory and botanical clinical luxury" loading="eager" decoding="async" width="1200" height="1400">
            <figcaption>{esc(concept["mood"])} - {esc(concept["motionStyle"])}</figcaption>
          </figure>
        </section>
        <section class="page-intro">
          <div class="intro-panel">
            <p class="eyebrow">Reference architecture</p>
            <p class="lede">Franciele Sofiati - CRBM 6277 - Advanced Aesthetic Biomedicine - Londrina, PR. {esc(name)} uses {esc(concept["layoutDirection"])}, {esc(concept["headerStyle"])}, {esc(concept["mobileMenuStyle"])} and {esc(concept["footerStyle"])}. The content remains Sofiati-specific, ethical and evaluation-first.</p>
          </div>
        </section>
        {render_disclaimer(page)}
        {sections}
        </main>
        <div class="partial-slot" data-partial="concept-switcher"></div>
        <div class="partial-slot" data-partial="footer"><footer class="site-footer"><div class="footer-inner"><div><h2>Franciele Sofiati</h2><p>Advanced Aesthetic Biomedicine - CRBM 6277 - Londrina, PR</p></div><p>WhatsApp: (43) 9 9104-3536 - sofiatimendonca@gmail.com</p></div></footer></div>
        <script src="../../../js/partials.js" defer data-root="../../../"></script>
        <script src="../../../js/translations.js" defer></script>
        <script src="../../../js/language-switcher.js" defer></script>
        <script src="../../../js/navigation.js" defer></script>
        <script src="../../../js/accessibility.js" defer></script>
        <script src="../../../js/forms.js" defer></script>
        <script src="../../../js/cookies.js" defer></script>
        <script src="../../../js/motion.js" defer></script>
        <script src="../../../js/concept-switcher.js" defer></script>
        <script src="../../../js/app.js" defer></script>
        </body>
        </html>
        """
    )


def render_redirect(concept: dict[str, object]) -> str:
    number = esc(concept["number"])
    name = esc(concept["name"])
    return dedent(
        f"""\
        <!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{name} | Sofiati Concept</title>
        <meta http-equiv="refresh" content="0; url=home/">
        <link rel="canonical" href="https://www.sofiati.com/concepts/{number}/home/">
        </head>
        <body><p><a href="home/">Open {name} home page</a></p></body>
        </html>
        """
    )


def concept_css(concept: dict[str, object]) -> str:
    number = int(concept["number"])
    family = (number - 1) % 10
    cycle = (number - 1) // 10
    accent = ACCENTS[family]
    radius = [8, 4, 18, 2, 0, 28, 6, 999, 14, 10][family]
    hero_cols = [
        "1.12fr .88fr",
        ".78fr 1.22fr",
        "1fr 1fr",
        ".9fr 1.1fr",
        "1.28fr .72fr",
        ".82fr 1.18fr",
        "1fr .9fr",
        ".74fr 1.26fr",
        "1.05fr .95fr",
        "1.18fr .82fr",
    ][family]
    section_cols = [
        ".72fr 1.28fr",
        ".95fr 1.05fr",
        "1.18fr .82fr",
        ".84fr 1.16fr",
        "1.35fr .65fr",
        ".8fr 1.2fr",
        ".62fr 1.38fr",
        "1fr 1fr",
        ".9fr 1.1fr",
        "1.22fr .78fr",
    ][family]
    header_rules = [
        "background:color-mix(in srgb,var(--sofiati-ivory) 76%,transparent);",
        "background:var(--sofiati-white);",
        "background:linear-gradient(90deg,var(--concept-accent),var(--sofiati-sage)); color:var(--sofiati-white);",
        "background:color-mix(in srgb,var(--sofiati-cream) 92%,white 8%);",
        "background:var(--sofiati-ivory);",
        "background:color-mix(in srgb,var(--sofiati-sage) 24%,var(--sofiati-white));",
        "background:rgba(248,247,242,.92);",
        "background:radial-gradient(circle at center,var(--sofiati-white),var(--sofiati-ivory));",
        "background:color-mix(in srgb,var(--concept-accent) 16%,var(--sofiati-white));",
        "background:linear-gradient(180deg,var(--sofiati-white),var(--sofiati-cream));",
    ][family]
    footer_bg = [
        "var(--sofiati-charcoal)",
        "var(--sofiati-sage-deep)",
        "var(--concept-accent)",
        "color-mix(in srgb,var(--sofiati-charcoal) 88%,var(--concept-accent))",
        "var(--sofiati-soft-black)",
        "var(--sofiati-sage)",
        "#243033",
        "color-mix(in srgb,var(--concept-accent) 72%,var(--sofiati-charcoal))",
        "#30251D",
        "#36423B",
    ][family]
    return dedent(
        f"""\
        body.concept-{number:02d}{{
          --concept-accent:{accent};
          --hero-radius:{radius}px;
          --concept-offset:{cycle};
        }}
        body.concept-{number:02d} .site-header{{{header_rules} border-bottom-color:color-mix(in srgb,var(--concept-accent) 34%,transparent);}}
        body.concept-{number:02d} .utility-bar{{background:color-mix(in srgb,var(--concept-accent) {10 + cycle * 5}%,var(--sofiati-white));}}
        body.concept-{number:02d} .hero{{grid-template-columns:{hero_cols};}}
        body.concept-{number:02d} .hero-media{{border-radius:var(--hero-radius); transform:translateY({(cycle - 2) * 4}px);}}
        body.concept-{number:02d} .hero-media::after{{content:'';position:absolute;inset:0;background:linear-gradient({50 + family * 13}deg,transparent 42%,color-mix(in srgb,var(--concept-accent) 24%,transparent));pointer-events:none;}}
        body.concept-{number:02d} .intro-panel{{grid-template-columns:{section_cols};}}
        body.concept-{number:02d} .component-section .section-inner{{grid-template-columns:{section_cols};}}
        body.concept-{number:02d} .component-section:nth-of-type(3n){{background:color-mix(in srgb,var(--concept-accent) {5 + cycle * 2}%,var(--sofiati-ivory));}}
        body.concept-{number:02d} .component-section:nth-of-type(4n) .section-inner{{grid-template-columns:{hero_cols};}}
        body.concept-{number:02d} .tile{{border-radius:{max(4, min(radius, 18))}px;}}
        body.concept-{number:02d} .tile span,body.concept-{number:02d} .feature-list span{{background:color-mix(in srgb,var(--concept-accent) 28%,white);}}
        body.concept-{number:02d} .article-card{{border-top:3px solid var(--concept-accent);}}
        body.concept-{number:02d} .statement-panel{{background:linear-gradient(135deg,color-mix(in srgb,var(--concept-accent) 18%,var(--sofiati-white)),var(--sofiati-white));}}
        body.concept-{number:02d} .mobile-menu{{background:linear-gradient({135 + family * 7}deg,var(--sofiati-sage-deep),color-mix(in srgb,var(--concept-accent) 72%,var(--sofiati-charcoal)));}}
        body.concept-{number:02d} .site-footer{{background:{footer_bg};}}
        {family_extra_css(number, family, cycle)}
        @media(max-width:980px){{body.concept-{number:02d} .hero,body.concept-{number:02d} .component-section .section-inner,body.concept-{number:02d} .intro-panel{{grid-template-columns:1fr;}}body.concept-{number:02d}.page-home .hero{{grid-template-columns:1fr;}}body.concept-{number:02d}.page-home .hero-media{{clip-path:none;}}}}
        @media(max-width:560px){{body.concept-{number:02d}.page-home .hero{{padding-top:24px;gap:18px;}}body.concept-{number:02d}.page-home .hero-media{{min-height:{180 + (family % 4) * 22}px;order:{-1 if family in {1, 2, 4, 7, 9} else 0};width:100%;}}body.concept-{number:02d}.page-home .hero-media figcaption{{font-size:.72rem;white-space:normal;}}body.concept-{number:02d}.page-home .trust-capsules{{grid-template-columns:repeat(2,minmax(0,1fr));}}}}
        """
    )


def readme(concept: dict[str, object]) -> str:
    return dedent(
        f"""\
        # {concept['number']} - {concept['name']}

        Standalone Sofiati concept inspired by reference {concept['inspirationReferenceNumber']}: {concept['inspirationUrl']}

        - Layout direction: {concept['layoutDirection']}
        - Header: {concept['headerStyle']}
        - Mobile menu: {concept['mobileMenuStyle']}
        - Footer: {concept['footerStyle']}
        - Motion: {concept['motionStyle']}

        Pages: {', '.join(PAGES)}

        Ethical note: the concept uses educational language, no fake testimonials, no unapproved results imagery and only Londrina, PR as location.
        """
    )


def write_concept(concept: dict[str, object]) -> None:
    number = str(concept["number"])
    concept_dir = CONCEPTS_DIR / number
    concept_dir.mkdir(parents=True, exist_ok=True)
    (concept_dir / "index.html").write_text(render_redirect(concept), encoding="utf-8")
    (concept_dir / "README.md").write_text(readme(concept), encoding="utf-8")
    for page in PAGES:
        page_dir = concept_dir / page
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "index.html").write_text(render_page(concept, page), encoding="utf-8")
    CSS_DIR.mkdir(parents=True, exist_ok=True)
    (CSS_DIR / f"{number}.css").write_text(concept_css(concept), encoding="utf-8")


def main() -> None:
    concepts = json.loads(CONCEPTS_PATH.read_text(encoding="utf-8"))
    for concept in concepts:
        write_concept(concept)
    print(f"Generated {len(concepts)} concepts and {len(concepts) * len(PAGES)} pages")


if __name__ == "__main__":
    main()
