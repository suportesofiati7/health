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
NON_PUBLIC_PATHS = ("/.git/", "/.codex/", "/.agents/", "/__pycache__/", "/backups/", "/docs/", "/management/", "/node_modules/", "/qa/", "/reports/", "/scripts/", "/tests/", "/tmp/", "/.search-discovery-state.json", "/.env", "/.gitignore", "/README.md")

def render_robots() -> str:
    return module.render_robots(module.origin())

if __name__ == "__main__":
    raise SystemExit(module.main(["--rebuild", "--no-notify"]))
