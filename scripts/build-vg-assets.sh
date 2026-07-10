#!/usr/bin/env bash
#
# Virtual Gods asset pipeline.
#
# Reads the raw masters from source-files/virtual-gods/ (~1.3 GB, gitignored,
# Drive-synced) and writes the web assets the exhibition actually ships.
#
# The masters live OUTSIDE public/ on purpose: Astro copies public/ into dist/
# verbatim, so anything parked there is uploaded to Firebase whether or not the
# site references it. Only the converted vg/ tree below belongs in public/.
#
#   public/images/virtual-gods/vg/
#     modules/<person>.mp4|.webm|.jpg      individual rotating module + poster
#     modules/<person>/<view>.webp         orthographic stills (front/back/...)
#     mergers/<pair>.mp4|.webm|.jpg        pair fusion loop + poster
#     mergers/<pair>/<view>.webp           merged orthographic stills
#     films/<name>.mp4|.webm|.jpg          1080p films + poster
#     posters/*.webp                       methodology strips, final renders
#     wheel.webp                           the source circular diagram (reference)
#
# The masters use inconsistent names (spaces, "Advait"/"Advaita", "Janvi"/
# "Janhavi", "Sohail"/"Sohil", "Sid"/"Siddhesh") and several GIFs have no
# extension at all. Every mapping below is explicit for that reason — do not
# replace it with a slugify() helper, the inputs are not self-describing.
#
# Idempotent: existing outputs are skipped. Delete vg/ to force a full rebuild.
#
# Requires: ffmpeg, cwebp  (brew install ffmpeg webp)

set -euo pipefail

SRC="source-files/virtual-gods"
OUT="public/images/virtual-gods/vg"
WEB="$SRC/VG_Web Content"
FINAL="$SRC/VG04_Final for Web"

# Encoder budget. The loops are 900px line-art squares that render at ~300px on
# screen; 640 is generous and roughly halves the bitrate. Films cap at 1280.
#
# H.264 only, no VP9/WebM: on this material (flat-shaded line art and renders)
# VP9 produced consistently LARGER files than x264 at visually equal quality,
# and a browser picks the first playable <source>, not the smallest one.
LOOP_W=640          # module + merger loops
FILM_W=1280         # films
LOOP_CRF=32         # x264: higher = smaller. Line art tolerates this well.
FILM_CRF=28

command -v ffmpeg >/dev/null || { echo "need ffmpeg: brew install ffmpeg"; exit 1; }
command -v cwebp  >/dev/null || { echo "need cwebp: brew install webp"; exit 1; }
[ -d "$WEB" ] || { echo "raw masters missing at '$WEB' (Drive not synced?)"; exit 1; }

mkdir -p "$OUT"/{modules,mergers,films,posters}

log() { printf '  %s\n' "$*"; }

# ── GIF → looping mp4 + webm + poster jpg ───────────────────────────────────
# yuv420p + the pad filter: H.264 needs even dimensions; some GIFs are odd.
gif2vid() {
  local in="$1" out="$2"
  [ -f "$in" ] || { log "MISSING  $in"; return 0; }
  [ -f "$out.mp4" ] && { log "skip     $(basename "$out")"; return 0; }
  # Downscale then force even dimensions — H.264 rejects odd ones.
  local scale="scale='min($LOOP_W,iw)':-2,pad=ceil(iw/2)*2:ceil(ih/2)*2"
  ffmpeg -v error -y -i "$in" \
    -movflags +faststart -pix_fmt yuv420p -vf "$scale" \
    -c:v libx264 -crf $LOOP_CRF -preset slow -an "$out.mp4"
  # first frame as the poster (what shows before the video decodes)
  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale='min($LOOP_W,iw)':-2" -q:v 6 "$out.jpg"
  log "video    $(basename "$out")"
}

# ── .mov → 1080p mp4 + webm + poster ────────────────────────────────────────
mov2vid() {
  local in="$1" out="$2"
  [ -f "$in" ] || { log "MISSING  $in"; return 0; }
  [ -f "$out.mp4" ] && { log "skip     $(basename "$out")"; return 0; }
  local scale="scale='min($FILM_W,iw)':-2,pad=ceil(iw/2)*2:ceil(ih/2)*2"
  ffmpeg -v error -y -i "$in" \
    -movflags +faststart -pix_fmt yuv420p -vf "$scale" \
    -c:v libx264 -crf $FILM_CRF -preset medium -an "$out.mp4"
  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale='min($FILM_W,iw)':-2" -q:v 6 "$out.jpg"
  log "film     $(basename "$out")"
}

# ── still (jpg/png/gif) → resized webp ──────────────────────────────────────
still2webp() {
  local in="$1" out="$2" max="${3:-1600}"
  [ -f "$in" ] || { log "MISSING  $in"; return 0; }
  [ -f "$out" ] && { log "skip     $(basename "$out")"; return 0; }
  mkdir -p "$(dirname "$out")"
  # -resize W 0 preserves aspect; only downscales when wider than $max
  cwebp -quiet -q 76 -resize "$max" 0 "$in" -o "$out" 2>/dev/null \
    || cwebp -quiet -q 76 "$in" -o "$out"
  log "still    $(basename "$(dirname "$out")")/$(basename "$out")"
}

echo "── individual modules (rotating GIFs) ──"
# source-name → canonical slug. Varun and Sneha each contributed TWO modules
# (they appear in two quadrants), hence the -01/-02 suffixes.
gif2vid "$WEB/Individual Gifs/Advait.gif"   "$OUT/modules/advaita"
gif2vid "$WEB/Individual Gifs/Anuj.gif"     "$OUT/modules/anuj"
gif2vid "$WEB/Individual Gifs/Devarsh.gif"  "$OUT/modules/devarsh"
gif2vid "$WEB/Individual Gifs/Ishita.gif"   "$OUT/modules/ishita"
gif2vid "$WEB/Individual Gifs/Janvi.gif"    "$OUT/modules/janhavi"
gif2vid "$WEB/Individual Gifs/Kuldeep.gif"  "$OUT/modules/kuldeep"
gif2vid "$WEB/Individual Gifs/Nayan.gif"    "$OUT/modules/nayan"
gif2vid "$WEB/Individual Gifs/Shravan.gif"  "$OUT/modules/shravan"
gif2vid "$WEB/Individual Gifs/Siddhesh.gif" "$OUT/modules/siddhesh"
gif2vid "$WEB/Individual Gifs/Sneha.gif"    "$OUT/modules/sneha-01"
gif2vid "$WEB/Individual Gifs/Sneha02"      "$OUT/modules/sneha-02"   # no extension
gif2vid "$WEB/Individual Gifs/Varun.gif"    "$OUT/modules/varun-01"
gif2vid "$WEB/Individual Gifs/Varun02.gif"  "$OUT/modules/varun-02"
# No individual GIF exists for: yash, sohil, jinal.

echo "── individual orthographic stills ──"
for pair in \
  "Advait:advaita" "Anuj:anuj" "Ishita:ishita" "Janvi:janhavi" \
  "Kuldeep:kuldeep" "Nayan:nayan" "Shravan:shravan" "Siddhesh:siddhesh" \
  "Sneha 01:sneha-01" "Sneha 02:sneha-02" "Varun 01:varun-01" "Varun 02:varun-02"
do
  src="${pair%%:*}"; slug="${pair##*:}"
  dir="$WEB/Individual Stills/$src"
  [ -d "$dir" ] || { log "MISSING  stills/$src"; continue; }
  for f in "$dir"/*.jpg "$dir"/*.png; do
    [ -e "$f" ] || continue
    base="$(basename "$f")"; base="${base%.*}"
    # strip the person prefix: "Advaita_Front" → "front", "Varun2_Top" → "top"
    view="$(printf '%s' "${base##*_}" | tr '[:upper:]' '[:lower:]')"
    case "$view" in isometric) view=iso ;; esac
    still2webp "$f" "$OUT/modules/$slug/$view.webp" 900
  done
done

echo "── pair mergers (fusion GIFs) ──"
gif2vid "$WEB/Merger Gifs/Advait x Yash"     "$OUT/mergers/advaita-yash"
gif2vid "$WEB/Merger Gifs/Devarsh x Jhanvi"  "$OUT/mergers/devarsh-janhavi"
gif2vid "$WEB/Merger Gifs/Kuldeep x Ishita"  "$OUT/mergers/kuldeep-ishita"
gif2vid "$WEB/Merger Gifs/Nayan x Sneha"     "$OUT/mergers/nayan-sneha"
gif2vid "$WEB/Merger Gifs/Sid x Anuj.gif"    "$OUT/mergers/siddhesh-anuj"
gif2vid "$WEB/Merger Gifs/Sohail x Jinal"    "$OUT/mergers/sohil-jinal"
gif2vid "$WEB/Merger Gifs/Varun x Shravan"   "$OUT/mergers/varun-shravan"
gif2vid "$WEB/Merger Gifs/Varun x Sneha"     "$OUT/mergers/varun-sneha"

echo "── merged orthographic stills (animated GIF sets) ──"
for pair in \
  "Nayan X Sneha:nayan-sneha" "Sneha X Varun :varun-sneha" \
  "Sohail X Jinal:sohil-jinal" "VarunXShravan:varun-shravan"
do
  src="${pair%%:*}"; slug="${pair##*:}"
  dir="$WEB/Merger Stills/$src"
  [ -d "$dir" ] || { log "MISSING  merger stills/$src"; continue; }
  for f in "$dir"/*; do
    [ -f "$f" ] || continue
    base="$(basename "$f")"; base="${base%.*}"
    view="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
    case "$view" in isometric) view=iso ;; esac
    # these are GIFs — a single still frame is all we need per view
    out="$OUT/mergers/$slug/$view.webp"
    [ -f "$out" ] && { log "skip     $slug/$view"; continue; }
    mkdir -p "$(dirname "$out")"
    tmp="$(mktemp -t vgstill).png"
    ffmpeg -v error -y -i "$f" -frames:v 1 "$tmp"
    still2webp "$tmp" "$out" 900
    rm -f "$tmp"
  done
done

echo "── deep-dive pair studies (SP_ folders: jpg stills + A–D module gifs) ──"
for pair in \
  "SP_Advait x Yash:advaita-yash" \
  "SP_Devarsh  x Janvi:devarsh-janhavi" \
  "SP_Sohail x Jinal:sohil-jinal"
do
  src="${pair%%:*}"; slug="${pair##*:}"
  for f in "$WEB/$src/Merger Stills"/*.jpg; do
    [ -e "$f" ] || continue
    base="$(basename "$f" .jpg)"
    view="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
    case "$view" in isometric) view=iso ;; esac
    still2webp "$f" "$OUT/mergers/$slug/$view.webp" 900
  done
  # Each SP folder numbers its fusion steps differently — A–F, 01–12, or (for
  # Devarsh × Janvi) just the two makers' names. Most files carry no extension.
  # So: take every file, and skip the two person-named ones, which are simply
  # copies of the individual modules we already converted above.
  for f in "$WEB/$src/Modules"/*; do
    [ -f "$f" ] || continue
    step="$(basename "$f")"; step="${step%.*}"
    step="$(printf '%s' "$step" | tr '[:upper:]' '[:lower:]' | tr -d ' ')"
    case "$step" in
      devarsh|janvi|janhavi|sohail|sohil|jinal|advait|advaita|yash) continue ;;
    esac
    gif2vid "$f" "$OUT/mergers/$slug/module-$step"
  done
done

echo "── films ──"
MOV="$SRC/mov"
mov2vid "$MOV/Advt x Yash.mov"      "$OUT/films/advaita-yash"
mov2vid "$MOV/Devarsh x Janhvi.mov" "$OUT/films/devarsh-janhavi"
mov2vid "$MOV/Jinal X Sohil.mov"    "$OUT/films/sohil-jinal"
mov2vid "$MOV/Nayan x Sneha.mov"    "$OUT/films/nayan-sneha"
mov2vid "$MOV/Sid x Aunj.mov"       "$OUT/films/siddhesh-anuj"
mov2vid "$MOV/Varun X Shravan.mov"  "$OUT/films/varun-shravan"
mov2vid "$MOV/Varun x Sneha.mov"    "$OUT/films/varun-sneha"
# NOTE: the master is named "Shravan x Ishita" but the merger GIF for that
# quadrant slot is "Kuldeep x Ishita". Treated as the Kuldeep×Ishita film.
mov2vid "$MOV/Shravan x Ishita.mov" "$OUT/films/kuldeep-ishita"
# Quadrant films. VG04 is the Marx×Zaha quadrant (its Methodology poster names
# those four architects); VG01–03 map to the other three, order unconfirmed.
mov2vid "$MOV/VG01.mov" "$OUT/films/quadrant-vg01"
mov2vid "$MOV/VG02.mov" "$OUT/films/quadrant-vg02"
mov2vid "$MOV/VG03.mov" "$OUT/films/quadrant-vg03"
mov2vid "$MOV/VG04.mov" "$OUT/films/quadrant-vg04"

echo "── posters, methodology strips, final renders ──"
still2webp "$SRC/VG_Process.jpg" "$OUT/wheel.webp" 2400
still2webp "$FINAL/Methodology/01.jpg" "$OUT/posters/methodology-00.webp" 2000
for n in 02 03 04 05 06 07 08; do
  still2webp "$FINAL/Methodology/$n.jpg" "$OUT/posters/methodology-$n.webp" 2400
done
for f in "$FINAL/Renders"/*.png; do
  [ -e "$f" ] || continue
  base="$(basename "$f" .png)"
  base="$(printf '%s' "$base" | sed 's/(Small)//' | tr '[:upper:]' '[:lower:]')"
  still2webp "$f" "$OUT/posters/render-$base.webp" 1400
done

echo
echo "── done ──"
echo "  output: $OUT"
du -sh "$OUT" 2>/dev/null || true
