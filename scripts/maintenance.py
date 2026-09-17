#!/usr/bin/env python3
"""Run the regular site, translation, SEO, build and optional backend routine.

Safe default:
    python3 scripts/maintenance.py

Remote Supabase migrations and Edge Function deployment are explicit:
    python3 scripts/maintenance.py --backend

Useful options:
    --dry-run              preview indexing and translation changes
    --notify-indexnow      submit changed URLs to IndexNow
    --skip-translate       skip the local Argos translation phase
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


@dataclass
class Result:
    name: str
    code: int


def run_phase(name: str, command: list[str], cwd: Path = ROOT) -> Result:
    print(f"\n{'=' * 8} {name} {'=' * 8}")
    print("Command:", " ".join(command))
    completed = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    output = (completed.stdout + "\n" + completed.stderr).strip()
    if output:
        print(output)
    if completed.returncode == 0:
        print(f"RESULT: {name} completed successfully; no unhandled errors.")
    else:
        print(f"RESULT: {name} needs attention (exit {completed.returncode}).")
    return Result(name, completed.returncode)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run regular public-site and management maintenance.")
    parser.add_argument("--backend", action="store_true", help="Apply linked Supabase migrations and deploy all Edge Functions.")
    parser.add_argument("--dry-run", action="store_true", help="Preview indexing and translation changes without writing those files.")
    parser.add_argument("--notify-indexnow", action="store_true", help="Submit changed URLs to IndexNow after indexing.")
    parser.add_argument("--skip-translate", action="store_true", help="Skip the local translation synchronization phase.")
    args = parser.parse_args(argv)

    results: list[Result] = []
    index_args = [sys.executable, str(ROOT / "scripts/index-site.py")]
    index_args += ["--dry-run" if args.dry_run else "--rebuild"]
    if not args.notify_indexnow:
        index_args.append("--no-notify")
    results.append(run_phase("Discovery files and IndexNow", index_args))

    if not args.skip_translate:
        translate_args = [sys.executable, str(ROOT / "scripts/translate-site.py")]
        if args.dry_run:
            translate_args.append("--dry-run")
        results.append(run_phase("Bilingual page synchronization", translate_args))
    else:
        print("\n======== Bilingual page synchronization ========\nRESULT: skipped by --skip-translate")

    results.append(run_phase("Complete SEO and link audit", [sys.executable, str(ROOT / "scripts/seo.py"), "--no-external"]))
    results.append(run_phase("Public production build", ["npm", "run", "build"]))
    management = ROOT / "management"
    results.append(run_phase("Management tests", ["npm", "test"], management))
    results.append(run_phase("Management production build", ["npm", "run", "build"], management))

    if args.backend:
        results.append(run_phase("Supabase migrations and Edge Functions", ["bash", "scripts/sync-backend.sh"], management))
    else:
        print("\n======== Supabase migrations and Edge Functions ========\nRESULT: not run; use --backend when a remote sync is intended.")

    failed = [result.name for result in results if result.code]
    print("\n" + "=" * 52)
    print("MAINTENANCE SUMMARY")
    for result in results:
        print(f"{'PASS' if result.code == 0 else 'REVIEW'} · {result.name}")
    if failed:
        print("Attention required:", "; ".join(failed))
        return 1
    print("All requested maintenance phases completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
