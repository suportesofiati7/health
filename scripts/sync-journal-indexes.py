#!/usr/bin/env python3
"""Keep both Journal indexes complete and remove the redundant article register."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
pt_path = ROOT / "blog.html"
en_path = ROOT / "en" / "blog.html"

pt = BeautifulSoup(pt_path.read_text(encoding="utf-8"), "html.parser")
for node in pt.select(".sj-register"):
    node.decompose()
pt_path.write_text(str(pt), encoding="utf-8")

# Use the same continuation story sequence in English; every card points to its
# matching /en/blog/ route and no secondary summary register is retained.
pt = BeautifulSoup(pt_path.read_text(encoding="utf-8"), "html.parser")
continuation = pt.select_one("#journal-library")
en = BeautifulSoup(en_path.read_text(encoding="utf-8"), "html.parser")
for node in en.select(".sj-register, #journal-library"):
    node.decompose()
if continuation:
    fragment = BeautifulSoup(str(continuation), "html.parser")
    section = fragment.select_one("#journal-library")
    section["data-section-name"] = "Journal continuation"
    section.select_one(".sj-section-label").string = "CONTINUATION · ARTICLES 11–60"
    section.select_one("h2").string = "Continue the Journal, article by article."
    section.select_one(".sj-section-heading__intro").string = "The same editorial edition continues here, with direct access to every guide."
    for link in section.select("a[href]"):
        link["href"] = link["href"].replace("blog/", "blog/")
    for story in section.select(".sj-row-story"):
        href = story.select_one("a[href]")["href"]
        article_path = ROOT / "en" / href
        if article_path.is_file():
            article = BeautifulSoup(article_path.read_text(encoding="utf-8"), "html.parser")
            story.select_one(".sj-story__title").string = article.select_one("h1").get_text(" ", strip=True)
            story.select_one(".sj-story__excerpt").string = article.select_one('meta[name="description"]')["content"]
            category = article.select_one(".sja-publication").get_text(" ", strip=True).replace("JOURNAL / ", "")
            story.select_one(".sj-story__eyebrow span").string = category
        story.select_one(".sj-story__meta").clear()
        story.select_one(".sj-story__meta").append("Educational reading · ")
        story.select_one(".sj-story__meta").append(f"Article {story.select_one('.sj-story__eyebrow span:nth-of-type(2)').get_text(strip=True)}")
        story.select_one(".sj-story__read").clear()
        story.select_one(".sj-story__read").append("Read the article →")
    for image in section.select("img[src]"):
        image["src"] = "../" + image["src"]
    anchor = en.select_one('template[data-sf-partial="quick-contact"]')
    if anchor:
        anchor.insert_before(section)
en_path.write_text(str(en), encoding="utf-8")
print("Synced complete Journal continuations and removed summary registers.")
