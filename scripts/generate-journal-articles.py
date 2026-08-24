#!/usr/bin/env python3
"""Render Portuguese journal articles from editorial source.

After running this renderer, run ``enrich-business-schema.py`` and then
``generate-social-previews.py`` to restore the verified business schema and
the 1200×630 social metadata that those scripts own.
"""
from __future__ import annotations
import json
import re
from html import escape
from pathlib import Path
from PIL import Image
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = json.loads((ROOT / "data" / "journal-editorial.json").read_text(encoding="utf-8"))["articles"]
VOLUME_TWO = json.loads((ROOT / "data" / "journal-editorial-volume-2.json").read_text(encoding="utf-8"))["articles"]
IMAGES = json.loads((ROOT / "data" / "service-image-sources.json").read_text(encoding="utf-8"))
OUT = ROOT / "blog"; OUT.mkdir(exist_ok=True)
EN_OUT = ROOT / "en" / "blog"; EN_OUT.mkdir(parents=True, exist_ok=True)

def article_from_brief(brief):
    slug, title, description, section, service, focus, context, caution = brief
    return {
        "slug": slug,
        "title": title,
        "description": description,
        "section": section,
        "service": service,
        "intro": f"{title.split(':', 1)[0]} parece uma questão simples quando aparece em uma busca. Na prática, {focus} pede contexto: histórico, rotina, condição atual da pele e objetivos ajudam a organizar uma decisão mais segura.",
        "sections": [
            ("Comece pelo contexto", f"Antes de procurar uma solução pronta, vale olhar para {context}. Essa observação não substitui uma avaliação, mas torna as perguntas mais úteis e evita que uma tendência defina sozinha o próximo passo."),
            ("A técnica vem depois da pergunta", f"Em estética, a mesma queixa pode ter prioridades diferentes conforme a pessoa. Uma consulta responsável explica possibilidades, preparação, limites e recuperação antes de indicar um recurso ou uma sequência de sessões."),
            ("O que vale observar na rotina", f"Anotar mudanças, produtos em uso, exposição solar, desconfortos e o tempo de evolução ajuda a transformar uma impressão em uma conversa mais precisa. O objetivo não é chegar com um diagnóstico, e sim com informações úteis para a avaliação."),
            ("Segurança também é saber esperar", f"{caution} Se houver dúvida, a orientação da profissional que avaliou o caso deve prevalecer sobre comparações, receitas caseiras ou expectativas construídas por imagens online."),
            ("Como a consulta organiza o próximo passo", f"Em Londrina, a consulta permite entender se {focus} pede cuidado estético, preparo prévio, acompanhamento, tempo de observação ou outro encaminhamento. Uma recomendação responsável pode incluir tratar, ajustar ou simplesmente esperar.")
        ],
        "references": [
            "https://www.gov.br/anvisa/pt-br/comunicacao/campanhas/estetica/procedimento-seguro",
            "https://www.aad.org/public/everyday-care/skin-care-basics"
        ]
    }

ARTICLES += [article_from_brief(brief) for brief in VOLUME_TWO]

ENGLISH_SECTIONS = {
    "Saúde da pele": "Skin health", "Textura e cicatrizes": "Texture and scars",
    "Pigmentação": "Pigmentation", "Renovação da pele": "Skin renewal",
    "Laser e tecnologia": "Laser and technology", "Laser e recuperação": "Laser and recovery",
    "Vasos e circulação": "Vessels and circulation", "Planejamento facial": "Facial planning",
    "Cabelo e couro cabeludo": "Hair and scalp", "Consulta e cuidado": "Consultation and care",
    "Recuperação e segurança": "Recovery and safety", "Tecnologia e cuidado": "Technology and care",
}

# These are editorial headlines, not literal machine translations.  They keep
# the English Journal readable while preserving the corresponding Portuguese
# route and topic.
ENGLISH_TITLES = {
    "fotoprotecao-que-cabe-na-rotina": "Sun protection that fits real life",
    "barreira-cutanea-sinais-de-sobrecarga": "When an overworked skin barrier needs a pause",
    "acidos-na-rotina-ordem-e-cautela": "Acids in a skincare routine: order, tolerance and care",
    "limpeza-de-pele-e-barreira": "Daily cleansing: removing what is needed, preserving what matters",
    "maquiagem-e-pele-sensivel": "Make-up and sensitive skin: what to notice without blaming products",
    "poros-textura-e-expectativas": "Pores and texture: why there is no permanent ‘closing’ solution",
    "cravos-e-extracao-segura": "Blackheads and extraction: when persistence at home can harm the skin",
    "acne-ativa-prioridade-antes-da-textura": "Active acne before texture: why the order of care matters",
    "marcas-pos-acne-e-cicatrizes": "Post-acne marks and scars: two different skin stories",
    "vermelhidao-persistente-quando-investigar": "Persistent redness: when to observe and when to investigate",
    "melasma-calor-luz-e-rotina": "Melasma, heat and light: looking beyond direct sun exposure",
    "mancha-pos-inflamatoria-o-que-muda": "Post-inflammatory pigmentation: why the cause belongs in the plan",
    "pele-e-gravidez-perguntas-seguras": "Skin during pregnancy: safer questions before changing a routine",
    "peeling-caseiro-risco-e-contexto": "At-home peels: why concentration without context can be costly",
    "esfoliacao-fisica-quando-menos-ajuda": "Physical exfoliation: when feeling the grains stops being renewal",
    "microdermoabrasao-objetivos-realistas": "Microdermabrasion: realistic goals for surface renewal",
    "peeling-de-diamante-o-que-avaliar": "Diamond-tip exfoliation: what to assess before seeking instant effects",
    "peeling-ultrassonico-em-uma-rotina": "Ultrasonic exfoliation: where it can fit within thoughtful care",
    "peeling-retinoico-recuperacao-planejada": "Retinoic peels: recovery planning starts before application",
    "peeling-de-jessner-cautela-e-indicacao": "Jessner peels: indication and caution before chasing peeling",
    "laser-e-pele-bronzeada": "Laser and tanned skin: why waiting can be the safer choice",
    "depilacao-laser-rosto-e-hormonios": "Facial laser hair removal: why hormonal context belongs in the conversation",
    "depilacao-laser-intervalos-e-ciclo": "Laser hair removal intervals: what the hair cycle explains",
    "laser-co2-e-eventos-importantes": "CO₂ laser and important events: planning without someone else’s calendar",
    "laser-co2-e-fotoprotecao-pos": "After CO₂ laser: sun protection is recovery, not an afterthought",
    "laser-e-cicatrizes-de-acne": "Laser and acne scars: why a technology name does not decide suitability",
    "luz-intensa-pulsada-e-avaliacao": "Intense pulsed light: why skin, goals and season all matter",
    "radiofrequencia-e-colageno-tempo": "Radiofrequency and collagen: why time belongs in the expectation",
    "ultraformer-mpt-e-objetivos": "Ultraformer MPT: clear goals before talking about lifting",
    "tecnologia-de-plasma-antes-de-decidir": "Plasma technology: why assessment and aftercare cannot be shortcuts",
    "microvasos-queixas-e-avaliacao": "Visible small vessels: appearance, symptoms and assessment are not the same",
    "peim-o-que-informar-antes": "PEIM: information that matters before treating small vessels",
    "toxina-botulinica-primeira-consulta": "A first botulinum toxin consultation: movement, priorities and limits",
    "toxina-botulinica-e-assimetrias": "Botulinum toxin and asymmetry: observation is not a promise of perfection",
    "terco-inferior-da-face-conversa-cuidadosa": "The lower face: a careful conversation about movement and contour",
    "naturalidade-e-planejamento-facial": "Natural-looking facial planning: proportion, not trend",
    "microagulhamento-e-manchas": "Microneedling and pigmentation: why risk changes the indication",
    "microagulhamento-e-acne-inflamada": "Microneedling with inflamed acne: why a pause may be part of care",
    "couros-cabeludo-e-queda-sinais-de-alerta": "Hair shedding: warning signs before choosing a protocol",
    "afinamento-capilar-e-fotografias": "Hair thinning and photographs: documenting change without rushing to conclusions",
    "mmp-couro-cabeludo-perguntas": "MMP for the scalp: questions that come before the technique",
    "mesoterapia-capilar-e-plano": "Scalp mesotherapy: why a protocol is not a universal treatment",
    "consulta-estetica-como-se-preparar": "How to prepare for an aesthetic consultation without deciding everything first",
    "perguntas-antes-de-um-procedimento": "Useful questions to ask before an aesthetic procedure",
    "pos-procedimento-sinais-para-contato": "After a procedure: signs that call for contact, not online remedies",
    "sol-e-recuperacao-cutanea": "Sun exposure and skin recovery: why recent exposure changes more than a tan",
    "fotos-antes-depois-leitura-critica": "Before-and-after photographs: curiosity without turning an image into a promise",
    "privacidade-em-tratamentos-esteticos": "Privacy in aesthetic care: why consent remains central",
    "rotina-minima-pele-sobrecarga": "A minimal routine for overwhelmed skin: why simplifying can be progress",
    "expectativa-e-tempo-biologico": "Biological time and expectations: aesthetic care is not express delivery",
}

def english_editorial(article):
    title = ENGLISH_TITLES.get(article["slug"], f"A considered guide to {ENGLISH_SECTIONS.get(article['section'], 'aesthetic care').lower()}")
    category = ENGLISH_SECTIONS.get(article["section"], "Considered care")
    description = f"A practical, considered guide to {title.lower()}, including what to assess before choosing professional care in Londrina."
    intro = f"{title} can sound simple in a search. In practice, a responsible decision depends on history, current skin or scalp condition, routine and the goal behind the question."
    sections = [
        ("Start with the context", f"Before choosing a solution, it helps to place {title.lower()} in context. Your history, current routine, recent changes and priorities make the questions more useful and keep a trend from deciding the next step alone."),
        ("The technique comes after the question", "The same concern can require different priorities for different people. A thoughtful consultation explains possibilities, preparation, limitations and recovery before suggesting a technology or a course of sessions."),
        ("What is useful to observe", "Changes over time, products in use, sun exposure, discomfort and photographs taken consistently can turn an impression into a clearer conversation. The aim is not to arrive with a diagnosis, but with useful information."),
        ("Safety can include waiting", "A more intensive approach is not automatically the better one. When there is uncertainty, irritation, an active condition or a conflicting commitment, waiting, simplifying or seeking another assessment can be the most careful decision."),
        ("How a consultation clarifies the next step", "In Londrina, a consultation can help determine whether the concern calls for aesthetic care, preparation, monitoring, time for observation or a different referral. A responsible recommendation may be to treat, adjust or simply wait."),
    ]
    return title, category, description, intro, sections

CTA_COPY = {
    "laser-acupulse-co2": ("Conversar sobre laser CO₂ em Londrina", "Ver cuidados antes e depois do laser"),
    "reducao-de-pelos-a-laser-com-lightsheer-duet": ("Avaliar depilação a laser em Londrina", "Entender o preparo para o laser"),
    "microagulhamento": ("Conversar sobre textura e microagulhamento", "Ver cuidados para textura da pele"),
    "protocolo-profissional-de-despigmentacao": ("Avaliar manchas e melasma em Londrina", "Entender o cuidado com pigmentação"),
    "mesoterapia-capilar": ("Conversar sobre queda e afinamento capilar", "Conhecer cuidados para o couro cabeludo"),
    "peim-tratamento-estetico-para-microvasos": ("Avaliar microvasos em Londrina", "Entender quando investigar vasos"),
    "toxina-botulinica-terco-superior-da-face": ("Planejar toxina botulínica com naturalidade", "Conhecer o planejamento facial"),
}

# The first editorial edition was authored as ten long-form English articles.
# Their Portuguese routes use the same stable filenames so the language switch
# can always resolve a like-for-like article rather than falling back to home.
ORIGINAL_ARTICLE_PAIRS = [
    "why-aesthetic-care-begins-with-consultation",
    "rebuilding-an-overwhelmed-skin-barrier",
    "professional-skin-cleansing-guide",
    "understanding-facial-pigmentation",
    "understanding-acne-scar-treatment",
    "persistent-facial-redness-and-vessels",
    "fractional-co2-laser-recovery-and-aftercare",
    "ultrasound-radiofrequency-collagen-treatment",
    "laser-hair-removal-process-and-maintenance",
    "hair-thinning-causes-and-scalp-care",
]
def cta(article):
    primary, secondary = CTA_COPY.get(article["service"], (f"Agendar avaliação de {article['section'].lower()} em Londrina", f"Conhecer o serviço de {article['section'].lower()}"))
    return f'''<section class="sja-conversion"><p>Próximo passo</p><h2>Uma consulta transforma informação em um plano possível.</h2><div><a class="sf-button sf-button--primary" href="../consulta.html" data-track="cta">{escape(primary)}</a><a class="sf-button sf-button--outline" href="../servicos/{article['service']}.html" data-track="cta">{escape(secondary)}</a></div></section>'''

def image(article, variant):
    """Use the established service image inventory, never generated cover art."""
    record = IMAGES[article["service"]][variant % len(IMAGES[article["service"]])]
    width, height = Image.open(ROOT / record["file"]).size
    alt = f"Imagem relacionada a {article['service'].replace('-', ' ')}, no Journal de Franciele Sofiati em Londrina."
    return (
        f'<img src="../{record["file"]}" width="{width}" height="{height}" loading="eager" '
        f'alt="{escape(alt)}">', record, alt
    )

routes = []
article_pairs = []
for article_position, article in enumerate(ARTICLES):
    slug = article["slug"]; routes.append(f"blog/{slug}.html")
    article_pairs.append({"id": f"journal-{slug}", "pt-BR": f"blog/{slug}.html", "en": f"en/blog/{slug}.html"})
    canonical = f"https://francielesofiati.com/blog/{slug}"
    hero, hero_record, hero_alt = image(article, article_position)
    sections = "\n".join(f'''<section class="sja-reading-section">
  <h2>{escape(heading)}</h2>
  <p>{escape(body)}</p>
</section>''' for heading, body in article["sections"])
    references = "\n".join(f'<li><a href="{escape(url)}" rel="noopener noreferrer" target="_blank">Fonte consultada</a></li>' for url in article["references"])
    variant = article_position % 5
    html = f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <title>{escape(article['title'])} | Franciele Sofiati</title>
  <meta name="description" content="{escape(article['description'])}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="pt-BR" href="{canonical}">
  <link rel="alternate" hreflang="en" href="https://francielesofiati.com/en/blog/{slug}">
  <link rel="alternate" hreflang="x-default" href="{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{escape(article['title'])} | Franciele Sofiati">
  <meta property="og:description" content="{escape(article['description'])}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://francielesofiati.com/{hero_record['file']}">
  <meta property="og:image:secure_url" content="https://francielesofiati.com/{hero_record['file']}">
  <meta property="og:image:type" content="image/webp">
  <meta property="og:image:width" content="{Image.open(ROOT / hero_record['file']).size[0]}">
  <meta property="og:image:height" content="{Image.open(ROOT / hero_record['file']).size[1]}">
  <meta property="og:image:alt" content="{escape(hero_alt)}">
  <meta property="og:site_name" content="Franciele Sofiati">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(article['title'])} | Franciele Sofiati">
  <meta name="twitter:description" content="{escape(article['description'])}">
  <meta name="twitter:image" content="https://francielesofiati.com/{hero_record['file']}">
  <meta name="twitter:image:alt" content="{escape(hero_alt)}">
  <link rel="stylesheet" href="../css/site.css">
  <!-- Article schema identifies the author, publisher and the exact public URL. -->
  <script type="application/ld+json">{{"@context":"https://schema.org","@graph":[{{"@type":"WebSite","@id":"https://francielesofiati.com/#website","url":"https://francielesofiati.com/","name":"Franciele Sofiati"}},{{"@type":"Person","@id":"https://francielesofiati.com/#franciele","name":"Franciele Sofiati","identifier":{{"@type":"PropertyValue","propertyID":"CRBM","value":"6277"}}}},{{"@type":"HealthAndBeautyBusiness","@id":"https://francielesofiati.com/#practice","name":"Franciele Sofiati Biomédica","url":"https://francielesofiati.com/"}},{{"@type":"BlogPosting","@id":"{canonical}#article","url":"{canonical}","headline":"{escape(article['title'])}","description":"{escape(article['description'])}","inLanguage":"pt-BR","articleSection":"{escape(article['section'])}","author":{{"@id":"https://francielesofiati.com/#franciele"}},"publisher":{{"@id":"https://francielesofiati.com/#practice"}},"image":"https://francielesofiati.com/{hero_record['file']}"}},{{"@type":"WebPage","@id":"{canonical}#webpage","url":"{canonical}","name":"{escape(article['title'])} | Franciele Sofiati"}},{{"@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"Início","item":"https://francielesofiati.com/"}},{{"@type":"ListItem","position":2,"name":"Journal","item":"https://francielesofiati.com/blog"}},{{"@type":"ListItem","position":3,"name":"{escape(article['title'])}","item":"{canonical}"}}]}}]}}</script>
</head>
<body class="sf-site sf-page sf-family-content sf-journal-article" data-page="journal" data-site-root="../">
  <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
  <template data-sf-partial="topbar"></template>
  <template data-sf-partial="header"></template>
  <template data-sf-partial="mobile-menu"></template>
  <main class="sf-main sja-main" id="main">
    <nav class="sf-breadcrumbs sf-container" aria-label="Navegação estrutural"><ol><li><a href="../index.html">Início</a></li><li><a href="../blog.html">Journal</a></li><li><span aria-current="page">{escape(article['title'])}</span></li></ol></nav>
    <article class="sja-article sja-article--variant-{variant}">
      <header class="sja-hero sja-hero--portrait-led sf-container">
        <div class="sja-hero__intro"><p class="sja-publication">JOURNAL <span aria-hidden="true">/</span> {escape(article['section'])}</p><h1>{escape(article['title'])}</h1><p class="sja-standfirst">{escape(article['intro'])}</p><div class="sja-byline"><span>Por Franciele Sofiati · CRBM 6277</span><span>Leitura clínica orientativa</span></div></div>
        <figure class="sja-hero__feature">{hero}</figure>
      </header>
      <a class="skip-past-hero" href="#main-content">Continuar <span aria-hidden="true">↓</span></a><span class="sf-main-content-target" id="main-content" tabindex="-1"></span>
      <div class="sja-reading-grid sf-container"><aside class="sja-at-glance"><div><p>Leitura responsável</p><h2>Antes de decidir</h2><ol><li>Conteúdo educativo, não diagnóstico.</li><li>Indicação e cuidados dependem de avaliação.</li><li>Resultados e recuperação variam.</li></ol><a href="../servicos/{article['service']}.html">Ver serviço relacionado →</a></div></aside><div class="sja-prose">{sections}<section class="sja-reading-section"><h2>Referências</h2><p>As fontes abaixo apoiam uma conversa responsável. Elas não substituem avaliação presencial, diagnóstico ou orientação individual.</p><ul class="sja-editorial-list">{references}</ul></section>{cta(article)}</div></div>
    </article>
  </main>
  <template data-sf-partial="newsletter-strip"></template>
  <template data-sf-partial="footer"></template>
  <template data-sf-partial="cookie-banner"></template>
  <template data-sf-partial="floating-widgets"></template>
  <script defer src="../js/analytics-config.js"></script><script defer src="../js/consent-manager.js"></script><script defer src="../js/analytics.js"></script><script type="module" src="../js/main.js"></script>
</body>
</html>
'''
    (OUT / f"{slug}.html").write_text(html, encoding="utf-8")
    # English route is a real editorial counterpart, not a language-switch fallback.
    english_title, english_section, english_description, english_intro, english_sections = english_editorial(article)
    english_html = html.replace('lang="pt-BR"', 'lang="en" data-default-lang="pt-BR"')
    english_html = english_html.replace(f'https://francielesofiati.com/blog/{slug}', f'https://francielesofiati.com/en/blog/{slug}')
    english_html = english_html.replace('hreflang="pt-BR"', 'hreflang="en"').replace('pt_BR', 'en_US')
    english_html = english_html.replace(f'<title>{escape(article["title"])} | Franciele Sofiati</title>', f'<title>{escape(english_title)} | Franciele Sofiati</title>')
    english_html = english_html.replace('Pular para o conteúdo', 'Skip to content').replace('Início', 'Home').replace('Leitura responsável', 'Responsible reading').replace('Antes de decidir', 'Before deciding').replace('Referências', 'References').replace('Próximo passo', 'Next step').replace('Continuar', 'Continue')
    english_html = english_html.replace('../index.html', '../../index.html').replace('../blog.html', '../blog.html').replace('../servicos/', '../../servicos/').replace('../consulta.html', '../../consulta.html').replace('../assets/', '../../assets/').replace('../css/', '../../css/').replace('../js/', '../../js/')
    english_html = english_html.replace('data-site-root="../"', 'data-site-root="../../"')
    english_canonical = f"https://francielesofiati.com/en/blog/{slug}"
    portuguese_canonical = f"https://francielesofiati.com/blog/{slug}"
    # Build reciprocal language annotations explicitly.  String substitutions
    # above are for editorial UI; they must not leave duplicate hreflang tags.
    english_html = re.sub(
        r'<link rel="canonical" href="[^"]+">(?:\s*<link rel="alternate"[^>]+>){3}',
        f'<link rel="canonical" href="{english_canonical}">\n'
        f'  <link rel="alternate" hreflang="en" href="{english_canonical}">\n'
        f'  <link rel="alternate" hreflang="pt-BR" href="{portuguese_canonical}">\n'
        f'  <link rel="alternate" hreflang="x-default" href="{portuguese_canonical}">',
        english_html,
        count=1,
    )
    english_page = BeautifulSoup(english_html, "html.parser")
    english_page.title.string = f"{english_title} | Franciele Sofiati"
    english_page.select_one('meta[name="description"]')["content"] = english_description
    english_page.select_one('meta[property="og:title"]')["content"] = f"{english_title} | Franciele Sofiati"
    english_page.select_one('meta[property="og:description"]')["content"] = english_description
    english_page.select_one('meta[name="twitter:title"]')["content"] = f"{english_title} | Franciele Sofiati"
    english_page.select_one('meta[name="twitter:description"]')["content"] = english_description
    english_page.select_one("h1").string = english_title
    breadcrumbs = english_page.select_one(".sf-breadcrumbs")
    breadcrumbs["aria-label"] = "Breadcrumb"
    breadcrumbs.select_one('[aria-current="page"]').string = english_title
    english_page.select_one(".sja-publication").string = f"JOURNAL / {english_section}"
    english_page.select_one(".sja-standfirst").string = english_intro
    for node, (heading, paragraph) in zip(english_page.select(".sja-reading-section"), english_sections):
        node.select_one("h2").string = heading
        node.select_one("p").string = paragraph
    references_section = english_page.select(".sja-reading-section")[-1]
    references_section.select_one("h2").string = "References"
    references_section.select_one("p").string = "The sources below support a responsible conversation. They do not replace an in-person assessment, diagnosis or individual guidance."
    for link in references_section.select("a"):
        link.string = "Source consulted"
    for span, value in zip(english_page.select(".sja-byline span"), ("By Franciele Sofiati · CRBM 6277", "Educational clinical reading")):
        span.string = value
    overview = english_page.select_one(".sja-at-glance")
    overview.select_one("p").string = "Responsible reading"
    overview.select_one("h2").string = "Before deciding"
    for item, value in zip(overview.select("li"), ("Educational content, not a diagnosis.", "Suitability and aftercare depend on assessment.", "Results and recovery vary.")):
        item.string = value
    overview.select_one("a").string = "View related treatment →"
    conversion = english_page.select_one(".sja-conversion")
    conversion.select_one("p").string = "Next step"
    conversion.select_one("h2").string = "A consultation turns information into a realistic plan."
    buttons = conversion.select("a")
    buttons[0].string = "Book a consultation in Londrina"
    buttons[1].string = "Explore the related treatment"
    for image_node in english_page.select("img"):
        image_node["alt"] = "Editorial image related to aesthetic care by Franciele Sofiati in Londrina."
    schema = english_page.select_one('script[type="application/ld+json"]')
    schema_text = schema.string
    schema_text = schema_text.replace(escape(article["title"]), escape(english_title))
    schema_text = schema_text.replace(escape(article["description"]), escape(english_description))
    schema_text = schema_text.replace('"inLanguage":"pt-BR"', '"inLanguage":"en"')
    schema_text = schema_text.replace(escape(article["section"]), escape(english_section))
    schema.string = schema_text
    (EN_OUT / f"{slug}.html").write_text(str(english_page), encoding="utf-8")

registry = json.loads((ROOT / "data" / "content-pages.json").read_text(encoding="utf-8"))
service_routes = [route for route in registry.get("routes", []) if route.startswith("servicos/")]
(ROOT / "data" / "content-pages.json").write_text(json.dumps({"routes": service_routes + routes}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

pairs_path = ROOT / "data" / "page-pairs.json"
pairs_data = json.loads(pairs_path.read_text(encoding="utf-8"))
pairs_data["pages"] = [pair for pair in pairs_data["pages"] if not pair.get("id", "").startswith(("journal-", "original-journal-"))] + article_pairs + [
    {"id": f"original-journal-{slug}", "pt-BR": f"blog/{slug}.html", "en": f"en/blog/{slug}.html"}
    for slug in ORIGINAL_ARTICLE_PAIRS
]
pairs_path.write_text(json.dumps(pairs_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

index = ROOT / "blog.html"
service_occurrences = {}
def continuation_item(article, number):
    occurrence = service_occurrences.get(article["service"], 0)
    service_occurrences[article["service"]] = occurrence + 1
    record = IMAGES[article["service"]][occurrence % len(IMAGES[article["service"]])]
    width, height = Image.open(ROOT / record["file"]).size
    return f'''<article class="sj-row-story sj-row-story--continuation sj-row-story--variation-{number % 5}"><a class="sj-story__link" href="blog/{escape(article['slug'])}.html"><figure class="sj-story__image"><img src="{escape(record['file'])}" width="{width}" height="{height}" loading="lazy" alt="Imagem relacionada a {escape(article['service'].replace('-', ' '))}"/></figure><div class="sj-story__copy"><p class="sj-story__eyebrow"><span>{escape(article['section'])}</span><span aria-hidden="true">{number:02d}</span></p><h3 class="sj-story__title">{escape(article['title'])}</h3><p class="sj-story__excerpt">{escape(article['description'])}</p><p class="sj-story__meta"><span>Leitura orientativa</span><span aria-hidden="true">·</span><span>Artigo {number:02d}</span></p><span class="sj-story__read">Leia o artigo <span aria-hidden="true">→</span></span></div></a></article>'''

items = "\n".join(
    continuation_item(article, number)
    for number, article in enumerate(ARTICLES[len(ARTICLES) - len(VOLUME_TWO):], start=11)
)
library = f'''<!-- GENERATED JOURNAL LIBRARY: START -->
<section aria-labelledby="journal-library-title" class="sj-rows sf-container sj-rows--continuation" data-section-name="Continuação do Journal" data-section-number="8" data-track-section="" id="journal-library">
<header class="sj-section-heading sj-section-heading--rule"><div><p class="sj-section-label">Continuação · artigos 11–60</p><h2 id="journal-library-title">Continue o Journal, artigo por artigo.</h2></div><p class="sj-section-heading__intro">A mesma edição segue daqui: novos temas, a mesma leitura cuidadosa, com imagem relacionada e acesso direto a cada guia.</p></header>
<div class="sj-rows__list">{items}</div>
</section>
<!-- GENERATED JOURNAL LIBRARY: END -->'''
source = index.read_text(encoding="utf-8")
start = "<!-- GENERATED JOURNAL LIBRARY: START -->"
end = "<!-- GENERATED JOURNAL LIBRARY: END -->"
if start in source and end in source:
    source = source[:source.index(start)] + source[source.index(end) + len(end):]
# The first 10 editorial features are followed immediately by articles 11–60.
source = source.replace('<template data-sf-partial="quick-contact"></template>', library + '\n<template data-sf-partial="quick-contact"></template>')
index.write_text(source, encoding="utf-8")
