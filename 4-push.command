#!/bin/bash
# ── advaitakelkar-website ──────────────────────────────────────
# Double-click this in Finder to commit all changes and push to
# GitHub. CI (GitHub Actions) auto-builds and deploys to Firebase.
# Optional: pass a commit message as argument, e.g.
#   bash 4-push.command "Update home page"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=== advaitakelkar-website — push to GitHub ==="
echo ""

# Remove stale git lock file left by other processes (e.g. Claude)
if [ -f ".git/index.lock" ]; then
  echo "Removing stale git lock file..."
  rm -f ".git/index.lock"
fi

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit — working tree is clean."
else
  MSG="${1:-Design update}"
  git commit -m "$MSG"
  echo ""
  git push origin main

  if [ $? -eq 0 ]; then
    echo ""
    echo "Pushed! CI is building — opening Actions..."
    open "https://github.com/advaitakelkar/advaitakelkar/actions"
  else
    echo ""
    echo "Push failed. Check your git remote and authentication."
    echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'not set')"
  fi
fi

echo ""
read -p "Press any key to close..." _
