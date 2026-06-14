#!/bin/bash
# DEPRECATED — one-time CI fix commit, no longer needed.
# Use 4-push.command for all ongoing pushes.
echo "This script is deprecated. Use 4-push.command instead."
read -p "Press any key to close..." _
exit 0
# ── original script below (kept for reference) ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Pushing workflow fix to GitHub..."
git add .github/workflows/deploy.yml package.json
git commit -m "Fix CI: upgrade @astrojs/mdx to v4 (v3 incompatible with Astro 5)"
git push

echo ""
echo "Done! Check https://github.com/advaitakelkar/advaitakelkar/actions"
open "https://github.com/advaitakelkar/advaitakelkar/actions"
read -p "Press any key to close..." _
