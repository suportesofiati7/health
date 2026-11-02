#!/usr/bin/env python3
"""Derive a faithful, email-safe transparent gold FS monogram.

The original artwork contains opaque blue/purple and dark-brown artifact pixels.
This produces a separate transparent asset; the original brand files stay intact.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/brand/logotipo-franciele-sofiati-saude-da-pele-estetica-avancada-gleba-palhano.webp"
OUTPUT = ROOT / "assets/brand/email/monograma-fs-dourado-transparente.png"

def smooth(value, low, high):
    scaled = np.clip((value - low) / (high - low), 0, 1)
    return scaled * scaled * (3 - 2 * scaled)

def build():
    original = np.asarray(Image.open(SOURCE).convert("RGBA"), dtype=np.float32)
    red, green, blue, original_alpha = (original[:, :, i] for i in range(4))

    # Retain the warm metallic highlights, with gentle antialiasing at edges.
    # Eliminate dark-brown fills and the blue/violet artifacts that are present
    # in the raw source, without redrawing or rearranging the FS emblem.
    gold_mask = (
        smooth(red, 110, 195)
        * smooth(green, 65, 150)
        * smooth(red - blue, 35, 90)
    )
    original[:, :, 3] = original_alpha * gold_mask
    clean = Image.fromarray(original.astype(np.uint8), "RGBA")
    clean.thumbnail((400, 420), Image.Resampling.LANCZOS)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    clean.save(OUTPUT, "PNG", optimize=True)

    # Fail CI rather than publishing a squared-off or chromatically corrupted logo.
    pixels = np.asarray(clean.convert("RGBA"), dtype=np.int16)
    alpha = pixels[:, :, 3]
    assert int((alpha > 10).sum()) > 10000, "FS drawing is missing"
    assert int(alpha[0, :].max()) < 15 and int(alpha[:, 0].max()) < 15, "non-transparent margins"
    bad_blue = (pixels[:, :, 2] > 1.35 * pixels[:, :, 0]) & (alpha > 25)
    assert not bad_blue.any(), "residual blue/purple visible in new logo"
    print(f"CLEAN LOGO OK: {OUTPUT.relative_to(ROOT)}, {clean.width} x {clean.height}, {OUTPUT.stat().st_size} bytes")

if __name__ == "__main__":
    build()
