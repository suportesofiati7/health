#!/usr/bin/env python3
"""Render reviewed Portuguese journal articles from explicit editorial source."""
from __future__ import annotations
import json
from html import escape
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = json.loads((ROOT / "data" / "journal-editorial.json").read_text(encoding="utf-8"))["articles"]
IMAGES = json.loads((ROOT / "data" / "service-image-sources.json").read_text(encoding="utf-8"))
OUT = ROOT / "blog"; OUT.mkdir(exist_ok=True)

def image(article, index):
    record = IMAGES[article["service"]][index]
    width, height = Image.open(ROOT / record["file"]).size
    alt = f"Imagem editorial relacionada a {article['title'].lower()}, publicada por Franciele Sofiati em Londrina, imagem {index + 1}."
    return f'<img src="../{record["file"]}" width="{width}" height="{height}" loading="{"eager" if index == 0 else "lazy"}" alt="{escape(alt)}" data-description="Fotografia editorial licenciada para o artigo {escape(article["slug"])}; não representa resultado clínico.">', record, alt

routes = []
for article in ARTICLES:
    slug = article["slug"]; routes.append(f"blog/{slug}.html")
    canonical = f"https://www.francielesofiati.com/blog/{slug}"
    hero, hero_record, hero_alt = image(article, 0)
    detail, _, detail_alt = image(article, 1)
    close, _, close_alt = image(article, 2)
    sections = "\n".join(f'''<section class="sja-reading-section">
  <h2>{escape(heading)}</h2>
  <p>{escape(body)}</p>
</section>''' for heading, body in article["sections"])
    references = "\n".join(f'<li><a href="{escape(url)}" rel="noopener noreferrer" target="_blank">Fonte consultada</a></li>' for url in article["references"])
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
  <link rel="alternate" hreflang="x-default" href="{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{escape(article['title'])} | Franciele Sofiati">
  <meta property="og:description" content="{escape(article['description'])}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://www.francielesofiati.com/{hero_record['file']}">
  <meta property="og:image:secure_url" content="https://www.francielesofiati.com/{hero_record['file']}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="{Image.open(ROOT / hero_record['file']).size[0]}">
  <meta property="og:image:height" content="{Image.open(ROOT / hero_record['file']).size[1]}">
  <meta property="og:image:alt" content="{escape(hero_alt)}">
  <meta property="og:site_name" content="Franciele Sofiati">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(article['title'])} | Franciele Sofiati">
  <meta name="twitter:description" content="{escape(article['description'])}">
  <meta name="twitter:image" content="https://www.francielesofiati.com/{hero_record['file']}">
  <meta name="twitter:image:alt" content="{escape(hero_alt)}">
  <link rel="stylesheet" href="../css/site.css">
  <!-- Article schema identifies the author, publisher and the exact public URL. -->
  <script type="application/ld+json">{{"@context":"https://schema.org","@graph":[{{"@type":"WebSite","@id":"https://www.francielesofiati.com/#website","url":"https://www.francielesofiati.com/","name":"Franciele Sofiati"}},{{"@type":"Person","@id":"https://www.francielesofiati.com/#franciele","name":"Franciele Sofiati","identifier":{{"@type":"PropertyValue","propertyID":"CRBM","value":"6277"}}}},{{"@type":"HealthAndBeautyBusiness","@id":"https://www.francielesofiati.com/#practice","name":"Franciele Sofiati Biomédica","url":"https://www.francielesofiati.com/"}},{{"@type":"BlogPosting","@id":"{canonical}#article","url":"{canonical}","headline":"{escape(article['title'])}","description":"{escape(article['description'])}","inLanguage":"pt-BR","articleSection":"{escape(article['section'])}","author":{{"@id":"https://www.francielesofiati.com/#franciele"}},"publisher":{{"@id":"https://www.francielesofiati.com/#practice"}},"image":"https://www.francielesofiati.com/{hero_record['file']}"}},{{"@type":"WebPage","@id":"{canonical}#webpage","url":"{canonical}","name":"{escape(article['title'])} | Franciele Sofiati"}},{{"@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"Início","item":"https://www.francielesofiati.com/"}},{{"@type":"ListItem","position":2,"name":"Journal","item":"https://www.francielesofiati.com/blog"}},{{"@type":"ListItem","position":3,"name":"{escape(article['title'])}","item":"{canonical}"}}]}}]}}</script>
</head>
<body class="sf-site sf-page sf-family-content sf-journal-article" data-page="journal" data-site-root="../">
  <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
  <template data-sf-partial="topbar"></template>
  <template data-sf-partial="header"></template>
  <template data-sf-partial="mobile-menu"></template>
  <main class="sf-main sja-main" id="main">
    <nav class="sf-breadcrumbs sf-container" aria-label="Navegação estrutural"><ol><li><a href="../index.html">Início</a></li><li><a href="../blog.html">Journal</a></li><li><span aria-current="page">{escape(article['title'])}</span></li></ol></nav>
    <article class="sja-article">
      <header class="sja-hero sja-hero--portrait-led sf-container">
        <div class="sja-hero__intro"><p class="sja-publication">JOURNAL <span aria-hidden="true">/</span> {escape(article['section'])}</p><h1>{escape(article['title'])}</h1><p class="sja-standfirst">{escape(article['intro'])}</p><div class="sja-byline"><span>Por Franciele Sofiati · CRBM 6277</span><span>Leitura clínica orientativa</span></div></div>
        <figure class="sja-hero__feature">{hero}<figcaption>Imagem editorial licenciada · não representa resultado clínico.</figcaption></figure>
      </header>
      <a class="skip-past-hero" href="#main-content">Continuar <span aria-hidden="true">↓</span></a><span class="sf-main-content-target" id="main-content" tabindex="-1"></span>
      <div class="sja-reading-grid sf-container"><aside class="sja-at-glance"><div><p>Leitura responsável</p><h2>Antes de decidir</h2><ol><li>Conteúdo educativo, não diagnóstico.</li><li>Indicação e cuidados dependem de avaliação.</li><li>Resultados e recuperação variam.</li></ol><a href="../servicos/{article['service']}.html">Ver serviço relacionado →</a></div></aside><div class="sja-prose">{sections}<figure class="sja-inline-figure">{detail}<figcaption>{escape(detail_alt)}</figcaption></figure><section class="sja-reading-section"><h2>Referências e próximo passo</h2><p>As fontes abaixo ajudam a entender princípios de segurança e evidência. Elas não substituem a avaliação presencial, nem autorizam automedicação ou mudanças de tratamento por conta própria.</p><ul class="sja-editorial-list">{references}</ul><p><a href="../servicos/{article['service']}.html">Conhecer o serviço relacionado →</a> · <a href="../consulta.html">Agendar consulta em Londrina →</a></p></section><figure class="sja-inline-figure">{close}<figcaption>{escape(close_alt)}</figcaption></figure></div></div>
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

registry = json.loads((ROOT / "data" / "content-pages.json").read_text(encoding="utf-8"))
service_routes = [route for route in registry.get("routes", []) if route.startswith("servicos/")]
(ROOT / "data" / "content-pages.json").write_text(json.dumps({"routes": service_routes + routes}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
