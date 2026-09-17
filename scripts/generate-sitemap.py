#!/usr/bin/env python3
"""Backward-compatible entrypoint for the unified search discovery utility."""
from __future__ import annotations
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("search_discovery", ROOT / "scripts" / "search_discovery.py")
module = importlib.util.module_from_spec(spec)
assert spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)

def render_sitemap() -> str:
    pages, _ = module.discover(module.origin())
    return module.render_sitemap(pages)

def main() -> int:
    return module.main(["--rebuild", "--no-notify"])

if __name__ == "__main__":
    raise SystemExit(main())
