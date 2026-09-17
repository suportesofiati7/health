#!/usr/bin/env python3
"""Regenerate robots, sitemap, llms.txt and submit changed URLs to IndexNow."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "scripts" / "search_discovery.py"
spec = importlib.util.spec_from_file_location("sofiati_search_discovery", TARGET)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Unable to load {TARGET}")
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


if __name__ == "__main__":
    raise SystemExit(module.main(sys.argv[1:] or ["--rebuild"]))
