#!/usr/bin/env python3
"""Rebuild the site, sync Supabase, deploy every Edge Function, and preview management.

Run from the repository root or from any directory:

    python3 scripts/rebuild-and-sync.py

The script deliberately uses the linked Supabase project configured by the local
CLI. It does not translate content or deploy to Cloudflare. It does not read or
print secrets. Set SUPABASE_PROJECT_REF only when the linked project is different
from the repository default.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANAGEMENT = ROOT / "management"
FUNCTIONS = MANAGEMENT / "supabase" / "functions"
DEFAULT_PROJECT_REF = "naypgbhwnlbyqqqfftgn"

# These functions are public HTTP entry points in the existing deployment
# contract. The remaining functions require an authenticated staff JWT.
PUBLIC_FUNCTIONS = {"intake", "formulario", "staff", "files", "email-backup"}


def log(message: str) -> None:
    print(f"\n[rebuild-and-sync] {message}", flush=True)


def command_text(command: list[str]) -> str:
    return " ".join(command)


def run(command: list[str], *, cwd: Path = ROOT, label: str) -> None:
    log(label)
    print(f"$ {command_text(command)}", flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def require_tools() -> None:
    missing = [tool for tool in ("node", "npm", "npx") if shutil.which(tool) is None]
    if missing:
        raise RuntimeError(f"Missing required command(s): {', '.join(missing)}")


def edge_functions() -> list[str]:
    if not FUNCTIONS.is_dir():
        raise RuntimeError(f"Supabase functions directory not found: {FUNCTIONS}")
    names = sorted(
        path.name
        for path in FUNCTIONS.iterdir()
        if path.is_dir() and (path / "index.ts").is_file()
    )
    if not names:
        raise RuntimeError(f"No Edge Functions found in {FUNCTIONS}")
    return names


def sync_backend(project_ref: str) -> None:
    functions = edge_functions()
    unknown_public = PUBLIC_FUNCTIONS - set(functions)
    if unknown_public:
        raise RuntimeError(f"Configured public function(s) missing locally: {', '.join(sorted(unknown_public))}")

    run(
        ["npx", "supabase", "db", "push", "--linked", "--yes"],
        cwd=MANAGEMENT,
        label="Applying all pending Supabase migrations",
    )
    run(
        ["npx", "supabase", "migration", "list", "--project-ref", project_ref],
        cwd=MANAGEMENT,
        label="Verifying local and remote migration status",
    )

    log(f"Deploying {len(functions)} Edge Function(s): {', '.join(functions)}")
    for name in functions:
        command = ["npx", "supabase", "functions", "deploy", name, "--project-ref", project_ref]
        if name in PUBLIC_FUNCTIONS:
            command.append("--no-verify-jwt")
        run(command, cwd=MANAGEMENT, label=f"Deploying Edge Function: {name}")


def preview_management() -> None:
    launcher = ROOT / "scripts" / "run-local.py"
    run(
        [sys.executable, str(launcher)],
        cwd=ROOT,
        label="Starting the rebuilt management preview and opening the browser",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--skip-public",
        action="store_true",
        help="Skip public-site validation/build.",
    )
    parser.add_argument(
        "--skip-backend",
        action="store_true",
        help="Skip migration push and Edge Function deployment.",
    )
    parser.add_argument(
        "--skip-preview",
        action="store_true",
        help="Do not start the local management preview.",
    )
    parser.add_argument(
        "--project-ref",
        default=os.environ.get("SUPABASE_PROJECT_REF", DEFAULT_PROJECT_REF),
        help="Supabase project ref; defaults to SUPABASE_PROJECT_REF or the linked project.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        require_tools()

        if not args.skip_public:
            # Translation is intentionally excluded. Existing translations are
            # validated as part of the public maintenance run but never written.
            maintenance = [sys.executable, str(ROOT / "scripts" / "maintenance.py"), "--skip-translate"]
            run(
                maintenance,
                cwd=ROOT,
                label="Running full public-site maintenance, bilingual sync, SEO, validation, and builds",
            )
        else:
            run(["npm", "test"], cwd=MANAGEMENT, label="Running management tests")
            run(["npm", "run", "build"], cwd=MANAGEMENT, label="Building the management application")

        if not args.skip_backend:
            sync_backend(args.project_ref)

        if not args.skip_preview:
            preview_management()

        log("Complete. The public site and management build are current.")
        if not args.skip_backend:
            log("Supabase migrations and all discovered Edge Functions are synchronized.")
        if not args.skip_preview:
            log("The management preview launcher opened the rebuilt app in your browser.")
        return 0
    except subprocess.CalledProcessError as error:
        log(f"FAILED: command exited with status {error.returncode}: {command_text(error.cmd)}")
        return error.returncode or 1
    except (OSError, RuntimeError) as error:
        log(f"FAILED: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
