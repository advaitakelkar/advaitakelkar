#!/usr/bin/env python3
"""Alpha-aware image optimizer for public/images (uses Pillow).

  • Resizes anything over 1600px on its longest side (logos: 640px).
  • Flattens to JPEG q72 unless the image has *real* transparency — an
    unused alpha channel (fully opaque) is dropped and the file becomes JPEG,
    which is where most of the weight hides (e.g. 2 MB "PNG" renders).
  • Genuinely transparent PNGs (logos, cut-outs) stay PNG so the logo CSS
    masks keep working.
  • Filenames never change, so nothing in the YAMLs breaks.
  • Only rewrites a file when the result is actually smaller.

Run: python3 scripts/optimize-images.py
"""
import io
import os
import sys
from PIL import Image

ROOT = "public/images"
PHOTO_MAX = 1600
LOGO_MAX = 640
EXTS = (".png", ".jpg", ".jpeg")


def has_real_transparency(im: Image.Image) -> bool:
    if im.mode in ("RGBA", "LA"):
        return im.convert("RGBA").getchannel("A").getextrema()[0] < 255
    if im.mode == "P" and "transparency" in im.info:
        return im.convert("RGBA").getchannel("A").getextrema()[0] < 255
    return False


def optimize(path: str) -> int:
    """Return bytes saved (0 if unchanged)."""
    orig = os.path.getsize(path)
    try:
        im = Image.open(path)
        im.load()
    except Exception:
        return 0

    cap = LOGO_MAX if f"{os.sep}logos{os.sep}" in path else PHOTO_MAX
    w, h = im.size
    if max(w, h) > cap:
        scale = cap / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    buf = io.BytesIO()
    if has_real_transparency(im):
        im.save(buf, format="PNG", optimize=True)
    else:
        im.convert("RGB").save(buf, format="JPEG", quality=72, optimize=True, progressive=True)

    data = buf.getvalue()
    if len(data) < orig:
        with open(path, "wb") as fh:
            fh.write(data)
        return orig - len(data)
    return 0


def main() -> None:
    total_before = total_saved = count = 0
    for dirpath, _dirs, files in os.walk(ROOT):
        for name in files:
            if name == ".DS_Store":
                os.remove(os.path.join(dirpath, name))
                continue
            if not name.lower().endswith(EXTS):
                continue
            p = os.path.join(dirpath, name)
            total_before += os.path.getsize(p)
            saved = optimize(p)
            if saved:
                total_saved += saved
                count += 1

    mb = lambda n: f"{n / 1048576:.1f}MB"
    print(f"Rewrote {count} images.")
    print(f"public/images: {mb(total_before)} → {mb(total_before - total_saved)} (saved ~{mb(total_saved)})")


if __name__ == "__main__":
    try:
        import PIL  # noqa: F401
    except ImportError:
        sys.exit("Pillow not installed — run: python3 -m pip install Pillow")
    main()
