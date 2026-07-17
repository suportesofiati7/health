#!/usr/bin/env python3
"""Export all public English interface copy into one mockup-ready Markdown deck."""

from __future__ import annotations

import re
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "ENGLISH_VISIBLE_CONTENT_AND_MOCKUP_BRIEFS.md"

PAGES = (
    ("index.html", "Home"),
    ("about.html", "About Franciele"),
    ("mission.html", "Mission"),
    ("values.html", "Values"),
    ("care.html", "Care & Aftercare"),
    ("skin.html", "Skin"),
    ("laser.html", "Laser"),
    ("treatments.html", "Treatments"),
    ("results.html", "Results"),
    ("testimonials.html", "Patient Experiences"),
    ("journal.html", "Journal"),
    ("blog.html", "Blog"),
    ("consultation.html", "Consultation"),
    ("contact.html", "Contact"),
    ("faq.html", "FAQ"),
    ("accessibility.html", "Accessibility"),
    ("privacy.html", "Privacy Notice"),
    ("cookies.html", "Cookie Notice"),
    ("legal.html", "Legal Information"),
    ("thank-you.html", "Thank You"),
    ("404.html", "Page Not Found"),
)

SHARED_PARTIALS = (
    ("partials/top-bar.html", "Top information bar"),
    ("partials/header.html", "Desktop header and primary navigation"),
    ("partials/mobile-menu.html", "Mobile menu"),
    ("partials/footer.html", "Footer"),
    ("partials/cookie-banner.html", "Cookie banner and preference state"),
    ("partials/floating-widgets.html", "Floating quick actions"),
)

SKIP_TAGS = {"script", "style", "svg", "path", "template", "noscript"}
BLOCK_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "blockquote", "table"}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def visible_text(tag: Tag) -> str:
    clone = BeautifulSoup(str(tag), "html.parser").find()
    if clone is None:
        return ""
    for hidden in clone.select(
        "script, style, svg, template, noscript, .sf-visually-hidden, .sf-honeypot, [aria-hidden='true']"
    ):
        hidden.decompose()
    return clean(clone.get_text(" ", strip=True))


def is_hidden(tag: Tag) -> bool:
    classes = set(tag.get("class", []))
    return (
        tag.name in SKIP_TAGS
        or "sf-visually-hidden" in classes
        or "sf-honeypot" in classes
        or tag.get("aria-hidden") == "true"
        or tag.get("type") == "hidden"
    )


def emit_children(container: Tag, lines: list[str], depth: int = 0) -> None:
    for child in container.children:
        if isinstance(child, NavigableString) or not isinstance(child, Tag):
            continue
        emit_tag(child, lines, depth)


def emit_tag(tag: Tag, lines: list[str], depth: int = 0) -> None:
    if is_hidden(tag):
        return

    name = tag.name
    classes = set(tag.get("class", []))
    text = visible_text(tag)

    if name in {"h1", "h2"}:
        if text:
            lines.extend((f"### {text}", ""))
        return
    if name == "h3":
        if text:
            lines.extend((f"#### {text}", ""))
        return
    if name in {"h4", "h5", "h6"}:
        if text:
            lines.extend((f"##### {text}", ""))
        return
    if name == "p":
        if not text:
            return
        if "sf-eyebrow" in classes:
            lines.extend((f"**{text}**", ""))
        elif "sf-small-copy" in classes or "sf-meta" in classes:
            lines.extend((f"_{text}_", ""))
        else:
            lines.extend((text, ""))
        return
    if name == "blockquote":
        if text:
            lines.extend((f"> {text}", ""))
        return
    if name in {"ul", "ol"}:
        ordered = name == "ol"
        for index, item in enumerate(tag.find_all("li", recursive=False), start=1):
            item_text = visible_text(item)
            if item_text:
                marker = f"{index}." if ordered else "-"
                lines.append(f"{marker} {item_text}")
        if tag.find_all("li", recursive=False):
            lines.append("")
        return
    if name == "table":
        rows = []
        for row in tag.find_all("tr"):
            cells = [visible_text(cell) for cell in row.find_all(["th", "td"], recursive=False)]
            if cells:
                rows.append(cells)
        if rows:
            width = max(len(row) for row in rows)
            rows = [row + [""] * (width - len(row)) for row in rows]
            lines.append("| " + " | ".join(rows[0]) + " |")
            lines.append("| " + " | ".join("---" for _ in range(width)) + " |")
            for row in rows[1:]:
                lines.append("| " + " | ".join(row) + " |")
            lines.append("")
        return
    if name == "img":
        alt = clean(tag.get("alt", ""))
        if alt:
            lines.extend((f"_Current visual context: {alt}_", ""))
        return
    if name == "button":
        label = text or clean(tag.get("aria-label", ""))
        if label:
            lines.extend((f"**Button:** {label}", ""))
        return
    if name == "input":
        if tag.parent and tag.parent.name == "label":
            return
        placeholder = clean(tag.get("placeholder", ""))
        if placeholder:
            lines.extend((f"_Placeholder: “{placeholder}”_", ""))
        return
    if name == "textarea":
        placeholder = clean(tag.get("placeholder", ""))
        if placeholder:
            lines.extend((f"_Placeholder: “{placeholder}”_", ""))
        return
    if name == "select":
        options = [clean(option.get_text(" ", strip=True)) for option in tag.find_all("option")]
        options = [option for option in options if option]
        if options:
            lines.extend((f"_Options: {' · '.join(options)}_", ""))
        return
    if name == "label":
        label = text
        if label:
            lines.extend((f"**Field:** {label}", ""))
        return
    if name == "a":
        if tag.find(BLOCK_TAGS):
            emit_children(tag, lines, depth + 1)
        else:
            label = text or clean(tag.get("aria-label", ""))
            if label:
                lines.extend((f"**Link:** {label}", ""))
        return
    if name == "span":
        if text and not tag.find(BLOCK_TAGS):
            lines.extend((text, ""))
        return

    emit_children(tag, lines, depth + 1)


def compact_blank_lines(lines: list[str]) -> list[str]:
    result: list[str] = []
    for line in lines:
        if not line and (not result or not result[-1]):
            continue
        result.append(line.rstrip())
    while result and not result[-1]:
        result.pop()
    return result


def shared_copy() -> list[str]:
    lines = ["# Shared website interface copy", ""]
    lines.extend(
        (
            "The following strings appear sitewide or in shared interactive states. They are listed once rather than repeated under every page.",
            "",
        )
    )
    for relative, label in SHARED_PARTIALS:
        soup = BeautifulSoup((ROOT / relative).read_text(encoding="utf-8"), "html.parser")
        if relative == "partials/mobile-menu.html":
            mobile_root = soup.select_one("#sf-mobile-menu-inline")
            if mobile_root:
                mobile_root.attrs.pop("aria-hidden", None)
        lines.extend((f"## {label}", "", f"_Source: `{relative}`_", ""))
        emit_children(soup, lines)
    return compact_blank_lines(lines)


def page_copy(filename: str, label: str) -> tuple[list[str], int]:
    soup = BeautifulSoup((ROOT / filename).read_text(encoding="utf-8"), "html.parser")
    main = soup.find("main")
    if main is None:
        raise RuntimeError(f"{filename}: missing main")
    lines = [f"# {label}", "", f"_Route: `{filename}`_", ""]
    emit_children(main, lines)
    content = compact_blank_lines(lines)
    words = len(re.findall(r"\b[\w’'-]+\b", visible_text(main)))
    return content, words


ANALYSIS = r"""
# Content and visual-direction analysis

## Executive diagnosis

The site has a clear and unusually responsible point of view: consultation before intervention, context before comparison, restraint before escalation, and aftercare as part of treatment. That is the brand. The strongest mockups should make this judgment-led approach visible rather than defaulting to generic luxury-clinic imagery.

The current copy is comprehensive, reassuring and ethically careful. Its main design challenge is volume and recurrence. Twenty-one routes repeatedly use ten-chapter structures, card collections, paired contrasts and cautionary statements. If every idea receives the same card treatment, equally weighted sections make the experience feel longer and flatter than the underlying content deserves. The redesign opportunity is not “more decoration”; it is sharper hierarchy, more evidence-specific imagery and more distinct page identities.

## What the content says the brand actually is

1. **A guide, not a seller.** The dominant verbs are understand, assess, explain, prepare, review and adapt. Imagery should show listening, observation and planning as often as procedures.
2. **Clinically careful but not hospital-cold.** The copy combines safety limits with warm human language. The visual world should combine precise framing, honest light and tactile natural materials.
3. **Anti-hype and anti-erasure.** Results are discussed as individual, time-dependent and contextual. Avoid glossy “perfect skin,” dramatic transformation tropes and visual language that suggests guaranteed outcomes.
4. **Continuity is a service.** Preparation, recovery, contact and review recur throughout the site. Timelines, care cards, annotated sequences and follow-up moments can make continuity tangible.
5. **Franciele’s judgment is the differentiator.** Technology and treatment names are tools. The professional’s evaluation is the connecting story. Portraits should therefore feel attentive and working, not merely posed.

## Content strengths to preserve

- Headings frequently work as memorable principles: “Care without punishment,” “Improvement is not erasure,” and “The image is only one layer.” These are strong editorial anchors.
- The copy answers anxious, real-world questions about timing, discomfort, suitability, recovery and uncertainty.
- Safety language is specific enough to be useful without turning the whole brand alarmist.
- The treatment content consistently explains limits, which creates credibility.
- Cross-links support exploratory visitors who know their concern but not the name of a procedure.
- Forms collect useful context and explain why information is requested.

## Content risks the mockups should solve

### 1. Repetition can make important distinctions disappear

Words such as context, clarity, individual, responsible, pressure, promise and understanding recur across many pages. They belong to the brand, but when every chapter uses the same visual weight, readers may remember the tone while missing the practical difference between pages.

**Mockup response:** give each major page family one unmistakable visual grammar. Skin can feel observational and editorial; Laser can feel precise and light-led; Results can resemble an evidence ledger; Care can use time and recovery sequencing; About can feel biographical and personal.

### 2. Ten-section pages produce uniform narrative pacing

The pages contain good material, but ten similarly sized chapters can feel like ten equal stops. Visitors need a visible distinction between the core answer, supporting explanation, evidence, safety limits and next action.

**Mockup response:** design three pacing levels: one dominant opening proposition, two or three expanded teaching chapters, and compact supporting chapters. Use image-led pauses or concise diagrams between dense text groups.

### 3. The visual evidence is less specific than the written evidence

The copy is precise about assessment, technologies, treatment intervals and photography integrity, while much of the current imagery is portrait or interior photography. That creates a gap between what the site says and what it proves visually.

**Mockup response:** add procedure-specific but restrained evidence: consultation notes, device handpieces, protective preparation, standardized photography setup, treatment-room details and aftercare materials. Never show invasive detail merely for drama.

### 4. Negative constructions dominate some chapters

“Not,” “without,” “cannot,” “should not” and “do not” are valuable for setting safe limits, but too many consecutive warnings can make the experience feel defensive.

**Mockup response:** pair boundaries with a positive visual route. A caution card can sit beside “what we do instead,” a preparation checklist, a review path or a calm human moment.

### 5. Conversion moments are repeated but not differentiated

“Request a consultation,” “Contact the clinic” and similar actions appear often. The actions are appropriate, but visitors may not understand when a simple message is enough and when a consultation is the better next step.

**Mockup response:** use a consistent two-route decision component: **I have a practical question** versus **I want an individual assessment**. Show response expectations, information needed and urgency limits directly in the component.

### 6. Trust is stated more often than demonstrated

Credentials, responsible language and patient words are present, but they can be integrated into richer proof.

**Mockup response:** create an evidence strip with credentials, years/areas of practice if supportable, clinic location, photography standards, aftercare access and sourced patient feedback. Only include verifiable facts; do not invent numbers.

## Recommended page-family hierarchy

| Page family | Primary visitor question | Best visual grammar | Avoid |
| --- | --- | --- | --- |
| Home | “Can I trust this approach, and where do I begin?” | Care atlas, attentive portrait, three clear routes | A treatment catalogue above the philosophy |
| About / Mission / Values | “Who is guiding me and what do they believe?” | Working portrait, personal timeline, annotated principles | Repeating formal headshots in every section |
| Skin / Journal / Blog | “What might explain what I am seeing?” | Editorial field guide, macro texture, notes and diagrams | Diagnostic-looking certainty from photographs |
| Treatments / Laser | “Which tools exist and how are they selected?” | Clinical atlas, device details, target-to-tool mapping | Equipment glamour or power claims without context |
| Results / Testimonials | “What can change, and what can I reasonably expect?” | Evidence ledger, consistent photo framing, patient voice | Dramatic before/after sliders with unequal conditions |
| Care | “How do I prepare and recover safely?” | Timeline, day-by-day objects, aftercare checklist | Generic spa imagery unrelated to recovery |
| Consultation / Contact | “Which route should I use next?” | Quiet intake, two-route decision, transparent response steps | Long form shown before explaining why it is useful |
| FAQ / Policies | “Where is the exact answer or rule?” | Searchable knowledge library, compact chapters | Large decorative imagery that slows retrieval |
| Thank-you / 404 | “What happens now?” | One clear state illustration and next action | Full ten-chapter treatment of a simple utility state |

## Page-by-page mockup and image map

| Page | Mockup role | Recommended hero or anchor image | Most useful secondary visual |
| --- | --- | --- | --- |
| Home | Brand and navigation prototype | Attentive working portrait during consultation, with negative space for the core promise | Clinic atlas linking concern, treatment education and consultation |
| About | Biographical editorial | Candid planning portrait rather than another formal pose | Credential/timeline details, notebook or authentic working objects |
| Mission | Manifesto page | Quiet portrait in the clinic with direct, calm eye line | One abstract transition from pressure/noise to clarity/space |
| Values | Annotated principles | Hands reviewing a plan or explaining options | Ten principles condensed into a visual code rather than ten equal cards |
| Care | Recovery sequence | Follow-up or aftercare conversation | Before/aftercare object timeline and activity matrix |
| Skin | Observation field guide | Natural unretouched skin detail with non-diagnostic framing | Routine, climate, barrier and pigment influence diagrams |
| Laser | Light laboratory | Controlled light/optics study plus authentic device detail | Target-to-technology map and preparation/recovery sequence |
| Treatments | Clinical atlas | Organized treatment-preparation still life | Filtered concern-to-tool directory with one image per family |
| Results | Evidence ledger | Standardized photography setup, not a dramatic result | Identical comparison frames with treatment/timing metadata |
| Patient Experiences | Voice archive | Quiet clinic atmosphere with no identifiable patient required | Large quotations grouped by communication, environment and follow-up |
| Journal | Editorial magazine index | One strong essay image using real texture or clinic observation | Topic covers with distinct visual subjects, not repeated portraits |
| Blog | Search-led knowledge library | Minimal editorial still life or no hero image | Search/filter mockup and article thumbnail system |
| Consultation | Staged decision journey | Conversation at a table, attention focused on the patient | Five-stage timeline and progressive form preview |
| Contact | Channel-choice utility | Reception or personal response moment | Two-route decision, response expectations and urgent guidance drawer |
| FAQ | Retrieval prototype | No portrait; use typography/search as the hero | Category chips, answer preview and exact-question accordions |
| Accessibility | Inclusive utility page | No required photography; demonstrate the interface itself | Keyboard, readable-mode and alternate-contact examples |
| Privacy | Calm policy library | No hero portrait; optional restrained paper/light texture | Data journey showing collect, use, protect, retain and contact |
| Cookies | Preference-control prototype | No hero photography | Clear essential/optional control states and consent summary |
| Legal | Terms library | No hero photography | Compact contents rail with responsibility/limits callouts |
| Thank You | Confirmation state | Warm human response or simple authentic clinic detail | What-happens-next timeline with reply channel and expectations |
| Page Not Found | Recovery state | One restrained wayfinding illustration or empty doorway | Popular routes and concern-based navigation |

## A coherent photography shot list

One disciplined shoot can supply most of the authentic assets needed for the mockups without repeating the same portrait everywhere:

1. **Consultation conversation:** wide, medium and detail crops; Franciele listening, explaining and taking notes; patient identity optional or kept outside frame.
2. **Working portraits:** three distinct moods—welcoming, analytical and reflective—with natural skin texture and consistent colour treatment.
3. **Clinic architecture:** reception, treatment room, consultation surface, doorway and quiet material details; level architectural lines and both horizontal/vertical crops.
4. **Assessment details:** non-diagnostic observation, note-taking, calendar/timing discussion and preparation explanation.
5. **Technology families:** accurate handpieces, protective preparation and device controls photographed consistently; no simulated treatment effect.
6. **Standardized result photography:** neutral background, fixed light, camera position, distance marker and metadata card.
7. **Aftercare continuity:** written guidance, sunscreen, clean towel, calendar, phone follow-up and review conversation.
8. **Editorial skin/routine still life:** neutral objects and diverse natural skin detail, with no brand sponsorship implied.

Shoot every essential setup in landscape, portrait and close-detail crops. Reserve clean negative space on both left and right so the same authentic material can support responsive editorial layouts without aggressive cropping.

# Proposed mockup image set

These are design mockups, not a request to publish synthetic clinical evidence. Any image representing a real treatment, practitioner, clinic or result should use authentic photography and appropriate consent. AI-generated imagery is best limited to layout exploration, neutral editorial objects, botanical textures and abstract light studies.

## Mockup 01 — Home: “The care atlas”

- **Canvas:** desktop 1440 × 1200 and mobile 390 × 1100.
- **Use:** Home hero plus the first route-selection chapter.
- **Composition:** left-aligned hero statement with one attentive working portrait; below it, three large routes labelled “Understand my concern,” “Explore a treatment,” and “Plan a consultation.” A thin connective line makes the routes feel like an atlas rather than a product grid.
- **Visual asset:** Franciele seated at a consultation table, looking toward a person outside the frame; notebook and softly lit clinic architecture visible; honest daylight; warm ivory, deep forest and restrained rose.
- **Content overlay:** “You do not need to know which treatment you need” and the consultation-first statement.
- **Why it improves the site:** it turns the central brand idea into navigation and reduces the feeling of six equally weighted cards.
- **Exploration prompt:** “Editorial website hero mockup for a consultation-led Brazilian aesthetic clinic, attentive female biomedical practitioner seated at a warm minimal consultation table, looking toward an unseen patient, ivory plaster, pale oak, forest-green typography area, authentic daylight, calm clinical precision, generous negative space, no procedure, no beauty retouching, no text rendered into image.”

## Mockup 02 — About: “Judgment at work”

- **Canvas:** desktop 1440 × 1600.
- **Use:** About, Mission and Values family prototype.
- **Composition:** one large candid portrait spans the opening; a narrow credential rail intersects a biographical timeline; principle statements appear as marginal annotations rather than repeated cards.
- **Visual asset:** Franciele reviewing notes or explaining a plan, with hands and eye line visible. Include one archival-feeling detail such as notebook pages, clinic plans or tools, provided it is authentic.
- **Content overlay:** “Care guided by attention, judgment and honesty.”
- **Why it improves the site:** it shows the professional making decisions and gives the philosophy pages a human identity distinct from treatment pages.
- **Exploration prompt:** “Luxury editorial profile layout for a biomedical aesthetic practitioner, candid consultation-planning portrait, natural skin texture, warm clinic daylight, notebook details, elegant serif and restrained grid, documentary credibility, Brazilian contemporary interior, no glamour pose, no artificial perfection.”

## Mockup 03 — Treatments: “Concern → assessment → tool”

- **Canvas:** desktop 1600 × 1400 and tablet 768 × 1200.
- **Use:** Treatments directory and relevant home links.
- **Composition:** a left-side concern index filters a central treatment atlas; each treatment drawer opens into three clearly separated areas: purpose, suitability questions and recovery. A single authentic equipment/detail photograph anchors each treatment family.
- **Visual asset:** a consistent set of close details—handpiece, preparation tray, clinician hands, protective eyewear, skin-cleaning materials—photographed on the same background and lighting setup.
- **Content overlay:** “Options are tools—not automatic answers.”
- **Why it improves the site:** it makes the large catalogue scannable while preserving the copy’s assessment-first message.
- **Exploration prompt:** “High-end clinical treatment directory website mockup, modular concern-to-tool taxonomy, close-up device and preparation photography on ivory background, deep green navigation rail, subtle sage cards, precise editorial grid, medically responsible, calm and human, no dramatic procedure imagery.”

## Mockup 04 — Laser: “The light laboratory”

- **Canvas:** desktop 1440 × 1500.
- **Use:** Laser page.
- **Composition:** a dark forest opening with a controlled beam/optical diagram, followed by a light comparison table mapping target, technology, preparation and recovery. Device imagery remains secondary to the target-selection logic.
- **Visual asset:** abstract but physically plausible light passing through glass or translucent material; authentic close-up of protective preparation and a device handpiece; no visible treatment result claim.
- **Content overlay:** “The right laser begins with the right question.”
- **Why it improves the site:** it gives Laser a distinct technical identity without turning equipment into spectacle.
- **Exploration prompt:** “Editorial web mockup for responsible laser aesthetics, controlled warm light study through optical glass, dark forest green and ivory interface, scientific target-to-technology diagram, authentic handpiece detail, quiet sophistication, no sci-fi glow, no claims, no before-and-after.”

## Mockup 05 — Skin: “Observation field guide”

- **Canvas:** desktop 1440 × 1600 and mobile 390 × 1400.
- **Use:** Skin, Journal and Blog system.
- **Composition:** an editorial index organizes texture, congestion, sensitivity, pigmentation, acne and seasonal change. Macro images sit beside annotated factors such as routine, climate, inflammation and time. Labels clearly say “possible influences,” not diagnoses.
- **Visual asset:** natural, unretouched skin details representing diversity of tone and texture; neutral macro crops; product/routine still life; seasonal light/shadow.
- **Content overlay:** “Skin is a living surface—not a fixed category.”
- **Why it improves the site:** it turns educational density into a browseable reference and visually supports the site’s refusal to diagnose from one image.
- **Exploration prompt:** “Modern dermatology-inspired editorial website field guide, diverse natural skin macro photography with real texture, annotation lines for possible influences, warm neutral paper, sage taxonomy tabs, scientific yet gentle, non-diagnostic, no retouching, no medical labels embedded in image.”

## Mockup 06 — Results: “The evidence ledger”

- **Canvas:** desktop 1440 × 1700.
- **Use:** Results and Photography Integrity chapters.
- **Composition:** standardized empty photo frames demonstrate identical lighting, angle, crop, expression and interval metadata. A side ledger lists treatment context, session count, timing and limitations. Real patient images would replace placeholders only with consent.
- **Visual asset:** a genuine standardized photography setup—neutral wall, floor mark, soft fixed light, camera position—and a metadata card. The mockup can use blank silhouettes instead of fabricated patients.
- **Content overlay:** “A comparison should not create a false difference.”
- **Why it improves the site:** it makes the photography-integrity promise visible and creates trust without relying on dramatic transformations.
- **Exploration prompt:** “Responsible aesthetic results website mockup designed like an evidence ledger, paired neutral portrait placeholders with identical lighting and crop, metadata for interval and sessions, ivory and forest editorial system, transparent documentation, no fabricated patient result, no beauty retouching.”

## Mockup 07 — Testimonials: “Patient words with context”

- **Canvas:** desktop 1440 × 1300.
- **Use:** Testimonials and the Home patient-words chapter.
- **Composition:** large typographic quotations with small context tags such as consultation, communication, environment or aftercare. Use no patient portrait unless explicitly consented; atmosphere details can separate groups.
- **Visual asset:** quiet clinic textures, chair, doorway, folded linen or handwritten thank-you fragments with personal details removed.
- **Content overlay:** authentic testimonial excerpts already present in the site content.
- **Why it improves the site:** it gives short quotations breathing room and avoids presenting isolated praise as clinical proof.
- **Exploration prompt:** “Editorial patient-experience webpage mockup, oversized serif quotations, warm clinic detail photography, contextual tags for communication and aftercare, privacy-respecting, soft ivory and sage, restrained rose rules, no patient faces, no rating gimmicks.”

## Mockup 08 — Care: “Recovery is a sequence”

- **Canvas:** desktop 1440 × 1800 and mobile 390 × 1500.
- **Use:** Care & Aftercare.
- **Composition:** horizontal desktop timeline that becomes a vertical mobile sequence: before, immediately after, first days, review point and return to routine. Place exercise, heat, swimming, makeup and sun guidance in a clear activity matrix.
- **Visual asset:** authentic aftercare objects—clean towel, sunscreen, water, written guidance, phone contact, calendar—plus one calm follow-up interaction.
- **Content overlay:** “Aftercare is not an extra step. It is part of responsible treatment.”
- **Why it improves the site:** it converts many separate cards into a memorable time model and makes continuity tangible.
- **Exploration prompt:** “Premium aftercare timeline website mockup, authentic recovery objects arranged in chronological editorial still life, written instructions, sunscreen, calendar, phone follow-up, warm daylight, ivory and blush background, calm clinical guidance, no product branding, no treatment claims.”

## Mockup 09 — Consultation: “A decision made in stages”

- **Canvas:** desktop 1440 × 1500.
- **Use:** Consultation and the primary conversion route.
- **Composition:** opening two-column explanation, five-step consultation timeline and a progressive form preview. The form begins with the visitor’s question, then reveals practical details. A persistent reassurance panel explains that submitting does not commit them to treatment.
- **Visual asset:** consultation conversation, notes and a subtle plan diagram; avoid treatment-room imagery in the opening.
- **Content overlay:** “Begin with a consultation before decisions.”
- **Why it improves the site:** it lowers form anxiety and reflects the staged decision process described in the copy.
- **Exploration prompt:** “Calm consultation booking website mockup, staged intake flow with conversational first question, attentive practitioner and patient hands at a table, discreet progress indicator, ivory card on blush background, trustworthy medical-adjacent design, no pressure language.”

## Mockup 10 — Contact: “Choose the right route”

- **Canvas:** desktop 1440 × 1200 and mobile 390 × 1000.
- **Use:** Contact.
- **Composition:** two dominant route cards—practical message and individual consultation—with WhatsApp, email and location as secondary channels. Urgent-symptom guidance sits in a high-contrast, clearly labelled safety drawer outside the routine form.
- **Visual asset:** clinic reception or a human response moment rather than another formal portrait.
- **Content overlay:** “A message creates direction. Assessment creates the personal plan.”
- **Why it improves the site:** it clarifies channel choice before visitors encounter a long form and prevents routine contact from appearing to be emergency support.
- **Exploration prompt:** “Human clinic contact page mockup, two-route choice between practical question and personal consultation, warm reception detail, clear response-time steps, discreet urgent guidance drawer, refined forest and ivory interface, accessible mobile-first composition.”

## Mockup 11 — FAQ and policy library: “Exact answers first”

- **Canvas:** desktop 1440 × 1100.
- **Use:** FAQ, Accessibility, Privacy, Cookies and Legal.
- **Composition:** searchable answer library with category chips, concise accordion summaries and a visible “last reviewed” line where appropriate. Policies use a compact contents rail and readable text column, with no decorative hero portrait.
- **Visual asset:** generally none; one restrained abstract paper/light texture is enough.
- **Content overlay:** the real question headings and policy chapter titles from this document.
- **Why it improves the site:** it optimizes retrieval and gives policy pages a deliberate utility identity rather than treating them like marketing pages.
- **Exploration prompt:** “Accessible premium knowledge-base website mockup for an aesthetic clinic, searchable FAQ, category chips, readable legal column, calm paper texture, forest typography, high contrast, clear focus states, minimal decoration, no stock portrait.”

## Mockup 12 — Mobile system contact sheet

- **Canvas:** twelve 390 × 844 screens arranged as a presentation board.
- **Use:** validate the entire redesign language before producing all pages.
- **Screens:** Home hero, care atlas, About principle, treatment filter, Laser mapping, Skin field guide, Results ledger, Care timeline, consultation step, contact choice, FAQ search and cookie controls.
- **Why it improves the site:** it tests whether page identities remain distinct once desktop asymmetry collapses into a single column.
- **Exploration prompt:** “Presentation board of twelve cohesive mobile website mockups for a consultation-led Brazilian aesthetic clinic, each screen distinct but unified by ivory, forest, sage and dusty rose, editorial serif headings, readable sans body, authentic clinical photography, generous spacing, accessible controls, no embedded text artifacts.”

# Recommended production order

1. Prototype Mockups 01, 03, 06 and 09 first. Together they test brand, catalogue, evidence and conversion.
2. Build the mobile contact sheet before expanding desktop pages; this will reveal where long copy needs progressive disclosure.
3. Commission one coherent authentic photo library from a shot list derived from these mockups: consultation, working portrait, clinic environment, standardized photography setup, device/preparation details and aftercare/follow-up.
4. Reuse layout systems, not identical compositions. Home, Treatments, Results and Consultation should remain visibly different.
5. Test all mockups with the longest real headings and Portuguese expansion even though this deck contains English copy.

# Guardrails for image creation

- Do not fabricate before-and-after results, testimonials, credentials or clinical settings and present them as real.
- Preserve natural skin texture and individual features; avoid beauty-filter aesthetics.
- Obtain specific consent for identifiable patients, treatment moments and result photography.
- Keep equipment accurate and secondary to professional judgment.
- Do not use imagery that implies one technology is suitable for everyone.
- Pair safety copy with clear action, not alarming imagery.
- Maintain consistent lighting, angle, crop and timing metadata for any real comparison.
- Write useful alt text during production and treat decorative textures as decorative.
"""


def main() -> int:
    lines = [
        "# English visible content and mockup briefs",
        "",
        f"Generated from the public English HTML on {date.today().isoformat()}.",
        "",
        "This is a mockup-ready copy deck for the complete English site. It contains shared interface copy once, followed by all 21 public page bodies. Expanded disclosure content, form labels, placeholders, selectable options, buttons and meaningful image descriptions are included. Metadata, scripts and purely decorative graphics are excluded.",
        "",
        "## Document map",
        "",
        "1. Shared website interface copy",
        "2. Complete page-by-page copy",
        "3. Content and visual-direction analysis",
        "4. Twelve mockup briefs, production order and image guardrails",
        "",
        "---",
        "",
    ]
    lines.extend(shared_copy())
    lines.extend(("", "---", "", "# Complete page-by-page English copy", ""))

    totals: list[tuple[str, str, int]] = []
    for filename, label in PAGES:
        content, words = page_copy(filename, label)
        totals.append((filename, label, words))
        lines.extend(("", "---", ""))
        lines.extend(content)

    total_words = sum(words for _, _, words in totals)
    inventory = [
        "",
        "---",
        "",
        "# Copy inventory",
        "",
        f"Main-content total: **{total_words:,} words across {len(totals)} public English routes.**",
        "",
        "| Page | Route | Main words |",
        "| --- | --- | ---: |",
    ]
    inventory.extend(f"| {label} | `{filename}` | {words:,} |" for filename, label, words in totals)
    lines.extend(inventory)
    lines.extend(("", "---", ""))
    lines.extend(ANALYSIS.strip().splitlines())
    lines.append("")

    OUTPUT.write_text("\n".join(compact_blank_lines(lines)) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(PAGES)} pages, {total_words:,} main words).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
