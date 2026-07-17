from __future__ import annotations

import json
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from pt_translation.generator import (  # noqa: E402
    GenerationConfig,
    PortugueseSiteGenerator,
    Terminal,
    atomic_write,
)
from pt_translation.html_document import extract_blocks  # noqa: E402


SOURCE = """<!doctype html>
<html lang="en"><head>
<title>Hello world</title>
<meta name="description" content="A skin consultation">
<link rel="alternate" hreflang="en" href="https://www.francielesofiati.com/index.html">
<link rel="alternate" hreflang="pt-BR" href="https://www.francielesofiati.com/pt/">
</head><body>
<main id="content" class="page" aria-label="Page content">
<p id="intro" class="copy" data-hook="intro">Hello world</p>
<a id="link" href="contact.html" data-action="contact">Contact</a>
<a id="journal-link" href="journal/article.html">Journal</a>
<img id="photo" src="assets/photo.jpg" alt="Treatment room">
</main></body></html>
"""


class FakeEngine:
    identifier = "fake:en->pb:test"

    def __init__(self, fail_on: str | None = None):
        self.fail_on = fail_on

    def translate(self, text: str) -> str:
        if self.fail_on and self.fail_on in text:
            raise RuntimeError("intentional translation failure")
        return f"PT:{text}"


class GeneratorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        (self.root / "index.html").write_text(SOURCE, encoding="utf-8")
        data = self.root / "data" / "translation"
        data.mkdir(parents=True)
        (data / "pt-BR-glossary.json").write_text(json.dumps({
            "locale": "pt-BR",
            "exact": {"Contact": "Contato"},
            "preferred_terms": {"skin": "pele"},
            "post_replacements": {},
        }), encoding="utf-8")
        (data / "pt-BR-overrides.json").write_text(
            json.dumps({"version": 1, "locale": "pt-BR", "blocks": {}}), encoding="utf-8"
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def run_generator(self, mode: str = "incremental", *, preserve: bool = True, engine=None):
        config = GenerationConfig(
            self.root, mode=mode, preserve_overrides=preserve, yes=True, color=False
        )
        with redirect_stdout(StringIO()):
            return PortugueseSiteGenerator(config, engine or FakeEngine(), Terminal(False)).run()

    def test_unchanged_page_is_skipped_and_output_is_idempotent(self) -> None:
        self.run_generator("full")
        output = self.root / "pt" / "index.html"
        before = output.read_bytes()
        manifest_before = (self.root / ".translation-cache.json").read_bytes()
        result = self.run_generator("incremental")
        self.assertEqual(result.skipped, 1)
        self.assertEqual(output.read_bytes(), before)
        self.assertEqual((self.root / ".translation-cache.json").read_bytes(), manifest_before)

    def test_incremental_update_rebuilds_changed_source(self) -> None:
        self.run_generator("full")
        source = self.root / "index.html"
        source.write_text(SOURCE.replace("Hello world", "A new welcome"), encoding="utf-8")
        result = self.run_generator("incremental")
        self.assertEqual(result.updated, 1)
        self.assertIn("PT:A new welcome", (self.root / "pt" / "index.html").read_text(encoding="utf-8"))

    def test_complete_regeneration_creates_backup(self) -> None:
        self.run_generator("full")
        result = self.run_generator("full", preserve=False)
        self.assertIsNotNone(result.backup)
        self.assertTrue((result.backup / "pt" / "index.html").exists())

    def test_direct_manual_edit_is_preserved(self) -> None:
        self.run_generator("full")
        output = self.root / "pt" / "index.html"
        output.write_text(output.read_text(encoding="utf-8").replace("PT:Hello world", "Texto aprovado"), encoding="utf-8")
        result = self.run_generator("incremental")
        self.assertGreaterEqual(result.overrides, 1)
        self.assertIn("Texto aprovado", output.read_text(encoding="utf-8"))

    def test_changed_english_with_manual_override_creates_conflict(self) -> None:
        self.run_generator("full")
        output = self.root / "pt" / "index.html"
        output.write_text(output.read_text(encoding="utf-8").replace("PT:Hello world", "Texto aprovado"), encoding="utf-8")
        source = self.root / "index.html"
        source.write_text(SOURCE.replace("Hello world", "Hello changed"), encoding="utf-8")
        result = self.run_generator("incremental")
        self.assertTrue(result.conflicts)
        self.assertIn("Texto aprovado", output.read_text(encoding="utf-8"))

    def test_dry_run_reports_override_conflict_without_writing(self) -> None:
        self.run_generator("full")
        output = self.root / "pt" / "index.html"
        output.write_text(output.read_text(encoding="utf-8").replace("PT:Hello world", "Texto aprovado"), encoding="utf-8")
        (self.root / "index.html").write_text(SOURCE.replace("Hello world", "Hello changed"), encoding="utf-8")
        before = output.read_bytes()
        result = self.run_generator("dry-run")
        self.assertTrue(result.conflicts)
        self.assertGreaterEqual(result.overrides, 1)
        self.assertEqual(output.read_bytes(), before)

    def test_structure_attributes_and_glossary_are_preserved(self) -> None:
        self.run_generator("full")
        output = (self.root / "pt" / "index.html").read_text(encoding="utf-8")
        self.assertIn('class="page"', output)
        self.assertIn('id="intro"', output)
        self.assertIn('data-hook="intro"', output)
        self.assertIn('href="contact.html"', output)
        self.assertIn('href="../journal/article.html"', output)
        self.assertIn("Contato", output)
        self.assertIn("PT:A pele consulta", output)
        blocks = extract_blocks(output)
        self.assertTrue(any(block.kind == "attribute:alt" and block.source.startswith("PT:") for block in blocks.values()))

    def test_failed_translation_does_not_write_partial_page(self) -> None:
        result = self.run_generator("full", engine=FakeEngine("Hello world"))
        self.assertTrue(result.failures)
        self.assertFalse((self.root / "pt" / "index.html").exists())

    def test_partials_are_regenerated_with_portuguese_runtime_paths(self) -> None:
        partial_root = self.root / "partials"
        partial_root.mkdir()
        (partial_root / "header.html").write_text(
            """<header id="shared"><img src="assets/logo.webp" alt="Clinic logo">
<a href="about.html">About</a>
<a href="index.html" data-lang="en">EN</a>
<a href="pt/index.html" data-lang="pt">PT</a>
<button data-label-open="Open menu" data-label-close="Close menu">Menu</button>
</header>""",
            encoding="utf-8",
        )
        self.run_generator("full")
        output = self.root / "partials" / "pt-BR" / "header.html"
        generated = output.read_text(encoding="utf-8")
        self.assertIn('src="../assets/logo.webp"', generated)
        self.assertIn('href="about.html"', generated)
        self.assertIn('data-lang="en" href="../index.html"', generated)
        self.assertIn('data-lang="pt" href="index.html"', generated)
        self.assertIn('data-label-open="PT:Open menu"', generated)
        self.assertIn('data-label-close="PT:Close menu"', generated)

        output.write_text(generated.replace("PT:About", "Alteração manual"), encoding="utf-8")
        result = self.run_generator("incremental")
        self.assertEqual(result.updated, 1)
        self.assertNotIn("Alteração manual", output.read_text(encoding="utf-8"))

    def test_atomic_write_keeps_original_when_replace_is_interrupted(self) -> None:
        target = self.root / "atomic.txt"
        target.write_text("original", encoding="utf-8")
        with patch.object(os, "replace", side_effect=OSError("interrupted")):
            with self.assertRaises(OSError):
                atomic_write(target, "replacement")
        self.assertEqual(target.read_text(encoding="utf-8"), "original")


if __name__ == "__main__":
    unittest.main()
