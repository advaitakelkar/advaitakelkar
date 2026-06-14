#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Pushing to GitHub..."
git add -A
git commit -m "${1:-Design update}"
git push

echo ""
open "https://github.com/advaitakelkar/advaitakelkar/actions"
read -p "Press any key to close..." _
