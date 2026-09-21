#!/usr/bin/env python3
"""Encode one source picture as a web-sized webp.

    python3 scripts/to-webp.py <source> <destination.webp>

Two rules that `sips -Z` gets wrong, and both of them bit a real import:

* **Honour the camera's rotation.** A phone photo taken upright is stored
  landscape with an EXIF orientation flag. sips reports — and resizes — the
  stored frame, and cwebp does not carry the flag, so an upright photo
  arrives on the site lying on its side. `exif_transpose` bakes the rotation
  into the pixels, which is what a webp needs.
* **Never enlarge.** `sips -Z 1600` scales UP anything smaller, so a 1200px
  master shipped as a soft 1600px file. The cap is a ceiling, not a target.
"""
import sys
from PIL import Image, ImageOps

MAX = 1600
QUALITY = 72

src, dst = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src))
if max(im.size) > MAX:
    im.thumbnail((MAX, MAX), Image.LANCZOS)
if im.mode not in ("RGB", "RGBA"):
    im = im.convert("RGB")
im.save(dst, format="WEBP", quality=QUALITY, method=6)
print(f"{im.size[0]}x{im.size[1]}")
