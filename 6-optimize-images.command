#!/bin/bash
# ── Optimize every image in public/images ─────────────────────────────
# Double-click after adding new project photos. Safe to run any time:
#  • resizes anything larger than 1600px (longest side) down to 1600px
#  • recompresses JPG/PNG to JPEG quality 72
#  • keeps the SAME filenames — nothing in the project YAMLs breaks
#  • leaves .webp files untouched (already optimized; sips can't write webp)
#  • deletes stray .DS_Store files
# Uses only macOS's built-in `sips` — nothing to install.

cd "$(dirname "$0")" || exit 1

echo "── Optimizing public/images ──────────────────────────"
find public/images -name .DS_Store -delete

before=$(du -sk public/images | cut -f1)
count=0

while IFS= read -r -d '' f; do
  w=$(sips -g pixelWidth  "$f" 2>/dev/null | tail -1 | awk '{print $2}')
  h=$(sips -g pixelHeight "$f" 2>/dev/null | tail -1 | awk '{print $2}')
  [ -z "$w" ] && continue

  if [ "$w" -gt 1600 ] || [ "$h" -gt 1600 ]; then
    sips -Z 1600 "$f" >/dev/null 2>&1
  fi

  if sips -s format jpeg -s formatOptions 72 "$f" --out "$f.tmp.jpg" >/dev/null 2>&1; then
    mv "$f.tmp.jpg" "$f"
    count=$((count + 1))
  else
    rm -f "$f.tmp.jpg"
  fi
done < <(find public/images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

after=$(du -sk public/images | cut -f1)
saved=$(( (before - after) / 1024 ))

echo "Processed ${count} images."
echo "public/images: $((before / 1024))MB → $((after / 1024))MB  (saved ~${saved}MB)"
echo ""
echo "Done. Push with 4-push.command to deploy."
read -n 1 -s -r -p "Press any key to close..."
