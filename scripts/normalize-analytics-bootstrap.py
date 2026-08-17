#!/usr/bin/env python3
"""Remove legacy per-page Google snippets in favour of the consent-gated GTM loader.

This migration is intentionally idempotent.  The three local analytics scripts
remain on each page and are the single bootstrap for both Portuguese and
English routes.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = re.compile(r"<script\b[^>]*>.*?</script\s*>", re.DOTALL | re.IGNORECASE)
NOSCRIPT = re.compile(r"<noscript\b[^>]*>.*?</noscript\s*>", re.DOTALL | re.IGNORECASE)
RESIDUAL_NOSCRIPT = re.compile(
    r"(?im)^[ \t]*(?:end\s+)?(?:google\s+tag\s+manager\s*)?\(?\s*noscript\s*\)?[ \t]*\n?"
)
METADATA_LEAKS = (
    "Google Tag Manager",
    "Fim Google Gerente de etiquetas.",
    "Google tag (gtag.js)",
    "Google Tag Manager (Noscript)",
    "End Google Tag Manager (noscript)",
    "Eventos de análise de consentimento e ponte de consentimento Google.",
    "URLs canônicas e de linguagem: atualizar juntos sempre que uma rota de produção muda.",
    "Os metadados de compartilhamento social usam ativos locais verificados e suas dimensões reais.",
    "Dados estruturados: entidades verificadas somente; não adicione avaliações, horas, preços ou um endereço sem confirmação do cliente.",
)


def main() -> int:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if any(part in {"node_modules", "dist"} for part in path.parts):
            continue
        source = path.read_text(encoding="utf-8")
        if not any(marker in source for marker in (*METADATA_LEAKS, "GTM-P9PF3SV4", "G-S41CQ1303W", "GT-P8Z9PB5L", "noscript", "Noscript")):
            continue
        def keep_script(match: re.Match[str]) -> str:
            script = match.group(0)
            legacy_markers = (
                "GTM-P9PF3SV4",
                "googletagmanager.com/gtm.js",
                "googletagmanager.com/gtag/js",
                "function gtag",
                "gtag('js'",
                'gtag("js"',
            )
            return "" if any(marker in script for marker in legacy_markers) else script

        def keep_noscript(match: re.Match[str]) -> str:
            return "" if "GTM-P9PF3SV4" in match.group(0) else match.group(0)

        normalized = SCRIPT.sub(keep_script, source)
        normalized = NOSCRIPT.sub(keep_noscript, normalized)
        normalized = RESIDUAL_NOSCRIPT.sub("", normalized)
        for leaked_text in METADATA_LEAKS:
            normalized = normalized.replace(leaked_text, "")
        if normalized != source:
            path.write_text(normalized, encoding="utf-8")
            changed += 1
    print(f"Normalized {changed} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
