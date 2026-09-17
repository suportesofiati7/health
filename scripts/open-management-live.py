#!/usr/bin/env python3
"""Open the management app in a browser using its latest production build."""

from __future__ import annotations

import runpy
import os
from pathlib import Path
import shutil
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "management"
LAUNCHER = Path(__file__).resolve().parent / "run-local.py"


def main() -> int:
    # File managers often execute text files without attaching a terminal.
    # Re-open this launcher in a visible terminal so build errors and the live
    # server URL remain visible after a double-click.
    if not sys.stdin.isatty() and os.environ.get("MANAGEMENT_LIVE_TERMINAL") != "1":
        terminal = shutil.which("x-terminal-emulator") or shutil.which("gnome-terminal") or shutil.which("konsole")
        if terminal:
            environment = {**os.environ, "MANAGEMENT_LIVE_TERMINAL": "1"}
            subprocess.Popen([terminal, "-e", sys.executable, str(Path(__file__).resolve())], env=environment)
            return 0

    if not LAUNCHER.is_file():
        print(f"Management launcher not found: {LAUNCHER}")
        return 1

    # run-local.py owns the build, test, preview-server, port-selection,
    # browser-opening, and previous-server cleanup behavior.
    runpy.run_path(str(LAUNCHER), run_name="__main__")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
