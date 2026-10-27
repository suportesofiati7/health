# Service-led content growth plan

Audit date: 2026-10-27  
Scope: public Portuguese website, source repository, 20 service routes, `/tratamentos`, `/laser`, `/pele`, `/consulta`, `/cuidados`, FAQ, sitemap and 219 Portuguese journal HTML pages present in this checkout.  
Purpose: a durable editorial and landing-page roadmap. This document proposes work; it does not assert that every candidate should become a URL.

## Executive direction

Build toward **about 20 distinct, useful pages in each of the 20 service clusters** (about 400 service-to-page assignments, including each primary service hub). Preserve each current `/servicos/...` route as the one commercial-intent destination for that service. Supporting pages must answer different, substantial reader questions and lead naturally to the relevant hub and consultation. A shared guide can serve multiple clusters when its intent genuinely fits; do not create duplicate versions just to fill a count.

The repository currently contains 20 service pages and 219 Portuguese journal HTML pages, as well as broader skin/laser/consultation pages; the checked source does not establish separate paid-campaign landing journeys. Each service page has a short description, general planning/suitability/recovery sections, consultation links and links to relevant articles. The current roadmap maps 219 unique supporting Portuguese routes to 314 hub-to-resource assignments across the 20 clusters. This remains short of the requested scale.

The live treatment directory presents eight categories and says indication varies by person. The local directory's JSON-LD now lists all 20 services. The service pages use the established design, analytics hooks, and consultation conversion path. Keep those contracts.

**Requested target:** build toward about 20 distinct pages in each of the 20 service clusters, counting the primary service hub. The current map has 20 hubs and 219 supporting Portuguese routes assigned 314 times (shared guides may support more than one relevant cluster). Including the hubs, that is 334 of 400 target cluster-page assignments, leaving 66. That is a working gap estimate, not permission to publish thin pages. Each new route still needs a distinct reader task, adequate evidence, and practitioner review for practice-specific claims. See the [20-page-per-service build tracker](service-content-20-per-service-roadmap.md).

For implementation-ready, page-by-page briefs with proposed titles, routes, intents, outlines, and existing-page decisions, see [the page blueprint plan](service-content-page-blueprints.md). The current five-per-service extension is tracked in the [expanded intent inventory](service-content-expanded-intent-inventory.md): 100 additional candidate briefs, each still subject to overlap, demand and evidence review.

## Audit findings

### What is already in place

- One existing commercial landing page for each of the 20 listed treatments.
- A shared `/tratamentos` directory and broader `/laser`, `/pele`, `/consulta`, and `/cuidados` pages.
- About 70 Portuguese journal articles with relevant material on CO₂ recovery, laser hair-removal intervals and hormones, pigmentation, peels, microneedling, microdermabrasion, Ultraformer, radiofrequency, plasma, toxins, scalp care, PEIM and consultations.
- Established canonical URLs, service schema, breadcrumbs, consultation routes, image systems, analytics and layout conventions.
- Cross-links between 20 service pages and 34 relevant existing articles were added in the preceding branch work. See [the initial cluster map](service-content-cluster-map.md).

### Gaps that matter

1. **Hub depth:** most service pages are short and share the same section structure. They do not yet function as complete decision guides with a tailored mechanism explanation, alternatives, evidence limits, practical preparation, aftercare, expected variation and service-specific FAQs.
2. **Discoverability:** contextual links exist in article bodies, but there is not yet a consistent, easy-to-scan hub module that groups the supporting resources by purpose. The directory's category labels are broader than some people’s search language.
3. **Comparisons:** several legitimate choices exist within the current service list (e.g. mechanical exfoliation methods, peel types, laser/light approaches, collagen-oriented devices). These need balanced, evidence-reviewed comparisons. Avoid assuming all are interchangeable or suitable for the same concern.
4. **Evidence and safety:** some article pages already cover caution well, but references and claim quality need a clinical/editorial pass before those articles are used as authoritative evidence hubs. Search visibility must not outrun clinical accuracy.
5. **Demand evidence:** repository and public search results establish the current services and existing content, but do not establish query volume, Search Console performance, Ads campaigns, conversion rates or the order clients ask questions. Use Search Console, Google Ads Keyword Planner, Business Profile query insights and actual consultation questions before turning the lower-priority candidate list into URLs.
6. **Localization:** Londrina is relevant on service and booking pages. Do not create city/area permutations, translated duplicates, or nearly identical commercial pages. Localize only where it helps a real visitor.

### What should not become a page by default

- A separate URL for every FAQ, body area, device setting, skin type, age, season, neighborhood, or minor keyword variation.
- A page asserting diagnoses, prescriptions, guaranteed efficacy, fixed session counts, recovery durations or candidacy without verified protocol and appropriate evidence.
- A comparison claiming one service is superior or that Franciele offers a treatment not present in the verified service inventory.
- Google Ads pages until a real campaign and distinct visitor journey are confirmed. Use the relevant service hub otherwise.

## Verified service inventory and current cluster assignment

| # | Existing hub (preserve URL) | Current evidence/content already on site | Initial decision |
|---:|---|---|---|
| 1 | [`Ultraformer MPT`](../servicos/ultraformer-mpt.html) | [`ultraformer-mpt-e-objetivos`](../blog/ultraformer-mpt-e-objetivos.html); shared ultrasound/radiofrequency article. | Expand hub; add a careful comparison only after evidence and protocol review. |
| 2 | [`Limpeza de pele profunda`](../servicos/limpeza-de-pele-profunda.html) | [`limpeza-de-pele-e-barreira`](../blog/limpeza-de-pele-e-barreira.html), [`professional-skin-cleansing-guide`](../blog/professional-skin-cleansing-guide.html), comedone/extraction and skin-barrier resources. | Expand hub; focus on realistic scope, extraction decisions and home-care boundaries. |
| 3 | [`Redução de pelos a laser com LightSheer Duet`](../servicos/reducao-de-pelos-a-laser-com-lightsheer-duet.html) | Preparation/expectations, hair-cycle interval, facial hair/hormones, laser hair-removal guide. | Strong cluster; consolidate overlap and expand by skin/hair interaction without promising response. |
| 4 | [`Laser AcuPulse CO₂`](../servicos/laser-acupulse-co2.html) | Three recovery/photoprotection/event resources, acne-scar and technology resources. | Highest-priority hub; clarify fractional/ablative terms, realistic objectives, planning and recovery. |
| 5 | [`Mesoterapia capilar`](../servicos/mesoterapia-capilar.html) | [`mesoterapia-capilar-e-plano`](../blog/mesoterapia-capilar-e-plano.html), hair-thinning and when-to-investigate resources. | Expand with a strong boundary between cosmetic care and medical evaluation; verify protocol claims. |
| 6 | [`Microagulhamento`](../servicos/microagulhamento.html) | Assessment, active-acne caution, pigmentation and scar resources. | Expand distinctions by concern and risk; do not imply the technique treats all scars or pigment. |
| 7 | [`MMP — microinfusão de medicamentos na pele`](../servicos/mmp-microinfusao-de-medicamentos-na-pele.html) | MMP scalp questions plus related microneedling material. | Establish what the actual service protocol uses; distinguish MMP from conventional microneedling and scalp mesotherapy. |
| 8 | [`Peeling de ATA`](../servicos/peeling-de-ata.html) | General chemical-peel safety and sun/recovery guidance; other pigmentation resources. | Expand only with verified concentration/depth protocol; no universal indication claims. |
| 9 | [`Peeling de cristal / microdermoabrasão`](../servicos/peeling-de-cristal-microdermoabrasao.html) | Microdermabrasion realistic-goals article. | Merge shared microdermabrasion education; clarify how this service differs from diamond-tip treatment in actual practice. |
| 10 | [`Peeling de diamante`](../servicos/peeling-de-diamante.html) | Diamond-tip assessment article and surface-renewal content. | Add a comparison within one shared resource; avoid duplicate claims against crystal exfoliation. |
| 11 | [`Peeling de Jessner`](../servicos/peeling-de-jessner.html) | Jessner caution/indication article and chemical-peel safety. | Expand tailored chemistry, indication limits and recovery with evidence review. |
| 12 | [`Peeling retinoico`](../servicos/peeling-retinoico.html) | Retinoic-peel recovery-planning article and general recovery content. | Clarify professional peel versus home retinoid use; verify formulation/protocol before detail. |
| 13 | [`Peeling ultrassônico`](../servicos/peeling-ultrassonico.html) | Ultrasonic exfoliation article. | Set modest expectations; a standalone deeper hub may be low priority unless demand supports it. |
| 14 | [`PEIM para microvasos`](../servicos/peim-tratamento-estetico-para-microvasos.html) | PEIM before-assessment and microvessel appearance/assessment articles. | Expand assessment boundaries, questions to bring and aftercare only from verified protocol. |
| 15 | [`Plataforma Harmony de laser e luz`](../servicos/plataforma-harmony-de-laser-e-luz.html) | IPL assessment, laser/tan, pigment, redness and broad `/laser` page. | Treat this as a technology-family hub; identify only verified handpieces/indications and link to service pages. |
| 16 | [`Protocolo profissional de despigmentação`](../servicos/protocolo-profissional-de-despigmentacao.html) | Melasma, post-inflammatory pigmentation, sun and skincare resources. | Build a shared pigmentation pillar and differentiate evaluation/support from a promised cure. |
| 17 | [`Radiofrequência`](../servicos/radiofrequencia.html) | Radiofrequency/collagen timeline and ultrasound comparison resource. | Expand evidence limits and modality comparison; avoid lifting equivalence claims. |
| 18 | [`Tecnologia de plasma`](../servicos/tecnologia-de-plasma.html) | Plasma before-deciding article. | Expand risk/recovery questions only after device and protocol verification. |
| 19 | [`Toxina botulínica — platisma e terço inferior`](../servicos/toxina-botulinica-platisma-e-terco-inferior.html) | Lower-face conversation and naturalness/planning resources. | Tailor to this offered area; separate it from upper-face intent and clarify limits. |
| 20 | [`Toxina botulínica — terço superior`](../servicos/toxina-botulinica-terco-superior-da-face.html) | First-consultation, asymmetry and broader Botox guide. | Make the existing upper-face hub the commercial destination; review the broader Botox guide for overlap and evidence. |

The verified 20 routes are: Ultraformer MPT; deep cleansing; LightSheer Duet hair reduction; AcuPulse CO₂; scalp mesotherapy; microneedling; MMP; ATA peel; crystal microdermabrasion; diamond peel; Jessner peel; retinoic peel; ultrasonic peel; PEIM; Harmony laser/light platform; professional depigmentation protocol; radiofrequency; plasma technology; botulinum toxin for platysma/lower face; and botulinum toxin for upper face.

## Content architecture

### Layer 1: service hubs (20 existing URLs)

Each hub should become a genuinely treatment-specific landing page. A reusable editorial outline is appropriate, but the answers must be individually written:

1. What the actual service is, device/procedure terminology and what it is not.
2. The question or goal it may address, separated from diagnosed disease claims.
3. A plain-language mechanism tied to verified protocol; no borrowed mechanism from a similar device.
4. What evidence can and cannot support; uncertainty and individual variation.
5. How consultation assesses suitability and when evaluation/medical referral matters.
6. What happens in an appointment, only where the actual practice confirms it.
7. Preparation, aftercare and recovery, with procedure-specific approved instructions.
8. Comparison with relevant services Franciele actually offers, where legitimate.
9. A concise set of high-value FAQs, not a page per question.
10. Related resources grouped under “Understand the concern,” “Compare options,” and “Prepare and recover,” plus consultation CTA.

### Layer 2: shared topic pillars

Use a small number of authoritative resources for cross-service questions: pigmentation and melasma; acne marks versus atrophic scars; laser/light and skin tone/tan; skin barrier and procedure timing; collagen/firmeza technologies; scalp thinning and when to seek medical assessment; visible vessels and assessment; consultation/preparation/consent; recovery warning signs and contacting the professional. Link from multiple hubs instead of duplicating them.

### Layer 3: focused supporting resources

Publish a new URL only when it has a distinct question, enough verified information to answer it substantially, a clear hub parent, and evidence of visitor/search value. Otherwise add a section to a hub or shared pillar.

### Layer 4: campaign pages

No separate ad page is currently justified by the checked evidence. If a real campaign is later documented, keep one destination per materially distinct campaign journey, preserve tracking parameters and ensure the page matches the ad. Do not create location/keyword clones.

## Candidate register: 93 seed ideas to qualify, combine or reject

“Candidate” does not mean “publish.” Existing material is identified to prevent duplicates. Titles are working topics, not final SEO titles. Confirm search demand and professional accuracy before scheduling. Shared candidates should have one canonical URL and multiple relevant hub links.

### CO₂ resurfacing — 8 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| CO₂ laser: fractional versus fully ablative treatment | Understand terminology and depth | Shared explainer; verify actual AcuPulse modes used. |
| CO₂ laser for acne scars: why scar type changes the plan | Evaluate suitability | Existing acne-scar resources; deepen only if distinct from current page. |
| CO₂ laser versus microneedling for texture concerns | Compare options | Balanced comparison; no universal winner. |
| CO₂ laser preparation: what to disclose and ask | Prepare for consultation | Consolidate current preparation content; no prescription instructions. |
| CO₂ laser recovery by stage: what can vary | Plan time away/care | Existing recovery resources; clinical review and no fixed timeline unless approved. |
| CO₂ laser and post-inflammatory pigmentation risk | Assess a safety concern | Shared pigmentation pillar; evidence and skin-tone nuance required. |
| CO₂ laser around travel, sun and important events | Scheduling | Existing event/photoprotection articles; consolidate rather than clone. |
| CO₂ laser: signs that should prompt professional contact | Aftercare escalation | Link to shared post-procedure warning-sign resource. |

### LightSheer Duet hair reduction — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Laser hair reduction: what determines response | Understand candidacy factors | Expand service hub with hair/skin pigment interaction and variation. |
| Laser versus IPL for hair reduction | Compare listed technology options | Shared laser/light comparison; verify available Harmony handpiece and service availability. |
| Facial hair and laser: why hormonal context matters | Understand recurrence/maintenance | Existing article; strengthen only if evidence/query data supports. |
| Laser hair reduction on different skin tones | Safety and suitability | High evidence burden; avoid broad guarantees. |
| Shaving, waxing and timing before a laser session | Preparation | Verify current practice protocol before publishing instructions. |
| Why treatment intervals vary across body areas | Plan a course | Existing interval article; add verified local practice context, not fixed promises. |
| What maintenance means after laser hair reduction | Set expectations | Existing process article; distinguish reduction from permanent removal. |

### Harmony laser and light platform — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Laser, IPL and other light: how the terms differ | Understand technology | Shared glossary; avoid conflating distinct modalities. |
| Pigment, vessels or hair: how the target changes light treatment | Understand target selection | One educational resource with clear boundaries; only verified indications. |
| Laser/light and recently tanned skin | Assess timing/safety | Existing article; connect to verified protocol. |
| Choosing a laser wavelength: what the device name cannot tell you | Evaluate technology claims | Technical article; handpiece and actual settings require professional confirmation. |
| Laser/light for redness: appearance versus medical assessment | Understand a concern | Shared redness/vessels resource; referral boundary. |
| Laser/light for pigmentation: why the cause matters | Consider treatment | Existing pigmentation cluster; do not diagnose or promise clearing. |
| Laser/light consultation checklist | Prepare | Can become a concise section in shared consultation guide. |

### Pigmentation and professional depigmentation — 8 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Melasma versus post-inflammatory marks: why they need different plans | Distinguish intents | Shared pillar; existing resources need consolidation. |
| What can trigger recurring pigmentation | Understand recurrence | Evidence review; no diagnosis from photos. |
| Pigmentation treatment: home care, peel and device roles | Compare categories | Include only services actually available; balanced limitations. |
| Why sun protection is part of pigmentation management | Practical prevention | Existing resources; shared authoritative page. |
| Pigmentation and darker skin tones: questions for a consultation | Safety/equity | High evidence burden and careful language. |
| Why a mark may darken after irritation or a procedure | Understand adverse change | Link to post-inflammatory pigment and escalation guide. |
| When a changing pigmented lesion needs medical assessment | Safety/referral | Medical review; clearly outside aesthetic diagnosis. |
| How a professional depigmentation plan is monitored | Understand process | Verify follow-up practice and products; no unapproved active ingredient advice. |

### Peels and exfoliation — 10 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Chemical versus mechanical exfoliation: different depths and purposes | Compare broad methods | Shared guide; do not equate superficial mechanical methods with peels. |
| Jessner peel versus retinoic peel | Compare named services | Verify current formulations and protocols before a comparison. |
| ATA peel: what concentration and depth mean for recovery | Understand terminology | Protocol-confirmed professional review required; omit recipes/dosing. |
| Jessner peel: why layers and skin response are individualized | Understand process | Existing Jessner article; expand only with verified professional details. |
| Retinoic professional peel versus retinoid skincare | Avoid confusion | Strong distinct intent; clarify non-equivalence and professional supervision. |
| Peeling and melasma: why more peeling is not automatically better | Safety/expectation | Shared pigmentation resource; evidence review required. |
| Peeling and active acne: when the priority may be different | Suitability | Medical/clinical review; avoid acne treatment claim without evidence. |
| Peeling recovery: how to plan around sun, work and events | Planning | Shared resource linked by peel hubs; not one page per peel. |
| Crystal versus diamond microdermabrasion | Compare listed methods | Verify actual equipment and meaningful differences before publishing. |
| Ultrasonic exfoliation: realistic scope and limits | Evaluate a less invasive option | Existing article; likely hub section unless query data shows a distinct need. |

### Cleansing, comedones and skin barrier — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Professional cleansing versus treating acne | Set scope | Existing cleansing guide; distinguish cosmetic extraction from medical acne care. |
| Blackheads: what extraction can and cannot change | Understand comedones | Existing resource; strengthen as a service-supporting guide. |
| When manual extraction may not be appropriate | Safety | Use verified protocol; no blanket rules. |
| Cleansing, exfoliation and a sensitive skin barrier | Avoid over-treatment | Shared barrier resource; link to cleansing and peel hubs. |
| How to prepare for a professional skin cleansing | Practical preparation | Confirm actual instructions; likely hub section. |
| Redness or irritation after cleansing: what to do next | Aftercare | Only verified care and escalation advice. |
| Diamond/crystal exfoliation versus deep cleansing | Compare purpose | Publish only if this is a real client question and protocols differ meaningfully. |

### Microneedling and MMP — 8 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Microneedling versus MMP: purpose, delivery and limits | Clarify similar terms | High-priority distinction; exact MMP method and products must be confirmed. |
| Microneedling for acne scars: why scar pattern matters | Evaluate options | Existing scar resources; avoid outcome guarantees. |
| Microneedling with active acne or irritation | Safety/timing | Existing article; retain and medically review. |
| Microneedling and pigmentation risk | Safety by skin response | Existing article; expand only with strong evidence. |
| Microneedling preparation: medication and skin history to discuss | Prepare | Do not publish medication stop/start instructions. |
| Microneedling recovery: normal variation and contact signs | Aftercare | Shared post-procedure resource plus service-specific details. |
| MMP for scalp concerns: questions before considering the technique | Evaluate service | Existing MMP scalp article; confirm scope and approved substances. |
| Needling depth and treatment purpose: what a consultation determines | Understand process | Avoid giving self-treatment/device-setting guidance. |

### Ultraformer MPT, radiofrequency and plasma — 9 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Microfocused ultrasound versus radiofrequency | Compare offered services | Existing shared article; make a balanced comparison with evidence limits. |
| Ultrasound and radiofrequency versus surgery | Set expectations | Clear non-equivalence; professional review. |
| What “collagen stimulation” does and does not mean | Understand marketing language | Shared evidence resource for multiple hubs. |
| Ultraformer MPT: how treatment depth relates to planning | Understand technology | Device-specific documentation and actual protocols required. |
| Ultraformer MPT: discomfort, downtime and response variability | Practical expectations | Verify practice data; avoid fixed recovery promises. |
| Radiofrequency: what device type and temperature change | Understand modality | Verify device in practice; distinguish monopolar/multipolar only if relevant. |
| Plasma technology versus laser resurfacing | Compare offered technologies | Device/protocol/evidence gate; no blanket superiority. |
| Plasma treatment: recovery, pigment and scar questions | Safety | High scrutiny; verify device, risks and aftercare. |
| When a non-surgical firmness procedure may not meet a person’s goal | Decision support | Shared expectations page, not a new page per technology unless distinct intent. |

### Botulinum toxin: upper face and lower face/platysma — 8 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Upper-face botulinum toxin: movement, priorities and limits | Evaluate treatment | Existing first-consultation article; link to upper-face hub. |
| Glabellar, forehead and eye-area planning: why they are assessed together | Understand areas | Clinical review; no injection maps/dosing. |
| Botulinum toxin versus filler: different purposes | Compare common alternatives | Clarify filler is not listed as a service and avoid implying it is offered. |
| Lower-face and platysma treatment: what movement is assessed | Understand service | Tailor to actual offered area; qualified review essential. |
| Why facial asymmetry is not a promise of perfect symmetry | Set expectations | Existing article; maintain claims and distinction. |
| First botulinum-toxin consultation: what history to share | Prepare | Existing article; confirm locally relevant consent/process. |
| How temporary effects and follow-up are discussed | Set expectations | Verify authorized product, labeling and local protocol; no fixed duration if unsupported. |
| Questions to ask about alternatives, risks and consent | Decision support | Can be a shared consultation checklist. |

### Scalp mesotherapy and MMP — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Hair shedding versus progressive thinning: why the distinction matters | Understand concern | Existing scalp content; clinician-reviewed boundary. |
| Hair loss warning signs that merit medical assessment | Safety/referral | Existing article; medical review and clear scope. |
| Scalp mesotherapy: what is known about the approach | Evidence | High evidence burden; disclose uncertainty and exact protocol. |
| Scalp mesotherapy versus MMP: are they the same procedure? | Compare terminology | Verify actual tools, delivery and products. |
| What to ask before an injectable scalp procedure | Prepare | Existing MMP questions; medication/product disclosure, no prescription advice. |
| Why identifying a cause matters before choosing a hair protocol | Decision support | Shared authoritative resource; avoid diagnosing alopecia. |
| Tracking hair change with consistent photographs | Monitor change | Existing photography article; avoid interpreting it as diagnosis. |

### PEIM and visible vessels — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| Visible small vessels: appearance, symptoms and assessment | Understand concern | Existing article; medical review. |
| PEIM: what the procedure is and what it is not | Understand service | Verify professional scope, agent and authorized protocol before detail. |
| PEIM versus light-based treatment for visible vessels | Compare offered options | Confirm which Harmony indications are actually offered and suitable. |
| What information to bring to a microvessel consultation | Prepare | Existing PEIM article; expand only with verified practice workflow. |
| Recovery and aftercare after PEIM | Prepare for aftercare | Exact protocol required; no universal compression or activity advice unless verified. |
| When leg-vessel symptoms need medical evaluation | Safety/referral | Medical review; not an aesthetic diagnosis page. |
| Facial redness versus visible vessels: why the concern matters | Clarify intent | Shared redness/vessels resource; do not imply one treatment fits both. |

### Cross-service patient decision resources — 7 candidates

| Candidate | Search/user intent | Relationship and gate |
|---|---|---|
| How to compare two suggested aesthetic treatments | Informed choice | Shared guide; neutral comparison framework. |
| What should be covered in informed consent for an aesthetic procedure | Safety/consent | Legal/clinical review; do not present as legal advice. |
| How to prepare for an aesthetic consultation | Book/prepare | Existing article; improve as one canonical checklist. |
| How to plan procedures around sun exposure, travel and events | Schedule | Shared guide linked from laser and peel hubs. |
| What to do when recovery differs from expectations | Aftercare | Shared contact/escalation guide and practice workflow verification. |
| How to read before-and-after images responsibly | Evaluate claims | Existing article; link from relevant service hubs. |
| When a treatment plan should pause or change | Decision support | Shared principle; service-specific contraindications stay in reviewed hubs. |

## Prioritization and delivery

Score each candidate from 1–5 on: (a) observed query/client demand, (b) relevance to a verified service, (c) evidence quality, (d) distinctness from existing URLs, (e) usefulness for the next informed decision, (f) realistic ability to maintain the information. Do not total scores mechanically: any weak evidence, clinical uncertainty, or substantial overlap is a hold/reject condition.

### Phase 0 — evidence and measurement (before publishing a large batch)

- Export 12–16 months of Search Console queries and landing-page performance by service URL.
- Review Google Ads search terms and destinations if campaigns exist; otherwise mark ads as not established.
- Review Business Profile queries and anonymized recurring questions from consultations/messages.
- Build a query-to-page map and record current clicks, impressions, leads and conversions as baselines.
- Ask the practitioner to verify device models/handpieces, actual protocols, products/substances, preparation, aftercare, referral boundaries, appointment flow and statements that cannot be published.
- Assign an evidence owner/reviewer for each clinical claim; record source, date, strength and limitation.

### Phase 1 — make the existing 20 hubs authoritative

Prioritize CO₂, LightSheer, Harmony, pigmentation, microneedling/MMP, toxins, scalp services and PEIM because they span multiple existing resources and distinct user questions. Rework in small batches, retain URLs and functional hooks, add a visible resource index to each hub, and update links from `/tratamentos`, `/laser`, `/pele` and `/blog`. Fill service-specific sections before publishing new URLs.

### Phase 2 — publish the first 15–25 net-new resources

Start with validated gaps that satisfy all gates: (1) microneedling versus MMP, (2) CO₂ fractional/ablative terminology and candidacy boundaries, (3) pigmentation types and treatment decisions, (4) Harmony laser/IPL/target terminology, (5) mechanical exfoliation comparison if real protocol differences exist, (6) botulinum toxin upper/lower-face decision resources, (7) PEIM assessment versus other listed technologies, (8) scalp procedure distinctions and medical-evaluation boundary, (9) one shared preparation guide, (10) one shared recovery escalation guide. Some of these should be integrated into hubs rather than separate URLs if demand or depth is weak.

### Phase 3 — expand by measured demand

Publish the next 15–25 resources after a 8–12 week readout. Add only when Search Console, Ads terms, client questions or internal search reveal a meaningful unmet intent. Reassess cannibalization and merge overlapping pages. Use no predetermined service-by-service quota.

### Phase 4 — maintain the network

Quarterly, check links, outdated evidence, changed service availability, page overlap, lead quality, local contact consistency and search landing data. Update or consolidate content where the evidence or practice changes. Keep an editorial changelog for health claims.

## URL, navigation, SEO and measurement rules

- Preserve all established service URLs as commercial-intent hubs.
- Use a predictable journal route for true educational articles; a new route must have a unique intended query/task and a clear parent hub.
- Add page pairs in `data/page-pairs.json` only when an English equivalent is actually reviewed; do not create legacy `/pt/` routes.
- Keep canonicals, hreflang, robots, breadcrumbs, titles and descriptions coherent; add schema only for visible content and true entities.
- No fabricated reviews/ratings, medical claims, awards, relationships, or unverified local service areas.
- Use clear descriptive anchor text. Each new resource should link to its parent service hub and at most a few genuinely related resources; avoid sitewide link grids.
- Track leads and consultation CTA interactions using existing consent-aware analytics. Do not send sensitive health details to analytics.
- Report discovery (impressions/clicks), engagement, qualified inquiries and conversion trends. Do not claim ranking or business impact before measurement.

## Completion criteria for each future page

1. A verified service or shared resource owns the page.
2. A query or consultation question demonstrates a distinct visitor need.
3. It answers that need beyond what the hub already says.
4. Every clinical statement has a reliable source and professional approval; uncertain evidence is labeled.
5. It explains limitations, variability and when another kind of evaluation may be appropriate.
6. It includes no invented service, device, qualifications, outcomes, prices, protocol or testimonial.
7. It has one clear parent, contextual internal links, canonical metadata and the established visual/analytics system.
8. It passes link, metadata, schema, accessibility, responsive and build checks before release.

## Audit limitations

This audit verifies the live public directory and the checked repository content. It cannot verify Search Console/Analytics/Ads or Business Profile data, private practice protocols, equipment inventory beyond visible claims, licensing details, current consent forms, consultation logs, or editorial approval. These are explicit Phase 0 inputs. Search result snippets are discovery signals, not a substitute for demand exports or clinical evidence review.
