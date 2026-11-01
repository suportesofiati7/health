"""Search and AI discovery must cover the canonical public article collection."""
import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
from contextlib import redirect_stdout
import io
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("search_discovery_test", ROOT / "scripts/search_discovery.py")
discovery = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = discovery
spec.loader.exec_module(discovery)


class SearchDiscoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.origin = discovery.origin()
        cls.pages, cls.excluded = discovery.discover(cls.origin)

    def test_every_blog_article_is_in_the_page_sitemap_and_ai_guide(self):
        urls = {page.canonical for page in self.pages}
        articles = list((ROOT / "blog").glob("*.html"))
        sitemap = ElementTree.fromstring(discovery.render_sitemap(self.pages))
        locations = {node.text for node in sitemap.findall("{*}url/{*}loc")}
        guide = discovery.render_llms(self.origin, self.pages)
        for article in articles:
            url = discovery.public_url(article.relative_to(ROOT).as_posix(), self.origin)
            with self.subTest(article=article.name):
                self.assertIn(url, urls)
                self.assertIn(url, locations)
                self.assertEqual(guide.count(f"]({url})"), 1)

    def test_new_articles_automatically_enter_the_ai_guide(self):
        page = discovery.Page(ROOT / "blog/new-guide.html", self.origin + "/blog/new-guide",
                              "New guide", "A maintained article.", "pt-BR", "hash", None, ())
        self.assertIn(f"]({page.canonical})", discovery.render_llms(self.origin, [page]))

    def test_explicit_resubmission_includes_unchanged_urls(self):
        previous = {"urls": {page.canonical: {"status": "current", "content_hash": page.content_hash}
                             for page in self.pages}}
        with patch.object(discovery, "discover", return_value=(self.pages, [])), \
             patch.object(discovery, "state_load", return_value=previous), \
             patch.object(discovery, "submit_indexnow", return_value=("DRY-RUN", "test")) as submit, \
             redirect_stdout(io.StringIO()):
            self.assertEqual(discovery.main(["--dry-run", "--resubmit"]), 0)
        self.assertEqual(set(submit.call_args.args[0]), {page.canonical for page in self.pages})
        self.assertTrue(submit.call_args.args[2])

    def test_search_crawlers_can_read_articles_but_private_paths_stay_disallowed(self):
        policy = RobotFileParser()
        policy.parse(discovery.render_robots(self.origin).splitlines())
        for agent in ["Googlebot", "bingbot", "OAI-SearchBot", "GPTBot", "Claude-SearchBot"]:
            with self.subTest(agent=agent):
                self.assertTrue(policy.can_fetch(agent, self.origin + "/blog/afinamento-capilar-e-fotografias"))
                self.assertFalse(policy.can_fetch(agent, self.origin + "/management/"))
                self.assertFalse(policy.can_fetch(agent, self.origin + "/.env"))
        self.assertIn(self.origin + "/sitemap-index.xml", policy.site_maps())


if __name__ == "__main__":
    unittest.main()
