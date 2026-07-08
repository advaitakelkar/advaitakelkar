#!/bin/bash
# ── Optimize every image in public/images ─────────────────────────────
# Double-click after adding new project photos. Safe to run any time:
#  • resizes anything over 1600px (longest side) to 1600px (logos: 640px)
#  • flattens to JPEG q72 UNLESS the image has real transparency — an unused
#    alpha channel is dropped (that's where most of the weight hides)
#  • genuinely transparent PNGs (logos, cut-outs) stay PNG, so the logo CSS
#    masks keep working
#  • keeps the SAME filenames — nothing in the project YAMLs breaks
#  • leaves .webp untouched; deletes stray .DS_Store files
#
# Prefers the Python/Pillow optimizer (best results); falls back to macOS
# `sips` if Pillow isn't installed.

cd "$(dirname "$0")" || exit 1
echo "── Optimizing public/images ──────────────────────────"
find public/images -name .DS_Store -delete

if python3 -c "import PIL" >/dev/null 2>&1; then
  python3 scripts/optimize-images.py
else
  echo "(Pillow not found — using the built-in sips fallback)"
  before=$(du -sk public/images | cut -f1)
  count=0
  while IFS= read -r -d '' f; do
    w=$(sips -g pixelWidth  "$f" 2>/dev/null | tail -1 | awk '{print $2}')
    h=$(sips -g pixelHeight "$f" 2>/dev/null | tail -1 | awk '{print $2}')
    [ -z "$w" ] && continue
    case "$f" in
      */logos/*) max=640 ;;
      *)         max=1600 ;;
    esac
    if [ "$w" -gt "$max" ] || [ "$h" -gt "$max" ]; then
      sips -Z "$max" "$f" >/dev/null 2>&1
    fi
    # sips can't tell an unused alpha channel from a real one, so it plays it
    # safe: any transparent PNG is resized only, never flattened.
    alpha=$(sips -g hasAlpha "$f" 2>/dev/null | tail -1 | awk '{print $2}')
    ext=$(echo "${f##*.}" | tr '[:upper:]' '[:lower:]')
    if [ "$ext" = "png" ] && [ "$alpha" = "yes" ]; then
      count=$((count + 1)); continue
    fi
    if sips -s format jpeg -s formatOptions 72 "$f" --out "$f.tmp.jpg" >/dev/null 2>&1; then
      mv "$f.tmp.jpg" "$f"; count=$((count + 1))
    else
      rm -f "$f.tmp.jpg"
    fi
  done < <(find public/images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)
  after=$(du -sk public/images | cut -f1)
  echo "Processed ${count} images.  $((before / 1024))MB → $((after / 1024))MB"
fi

echo ""
echo "Done. Push with 4-push.command to deploy."
read -n 1 -s -r -p "Press any key to close..."
