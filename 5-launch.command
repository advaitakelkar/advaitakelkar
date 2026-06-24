#!/bin/bash
# ── advaitakelkar-website — LAUNCH ─────────────────────────────
# Double-click in Finder to push the latest commit(s) to GitHub.
# GitHub Actions then auto-builds (Astro) and deploys to Firebase.
#
# Use this when a commit was already made (e.g. by Claude) but
# still needs pushing, or to push any pending changes.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=== advaitakelkar-website — launch ==="
echo ""

# Clear any stale lock files left by cloud sync / other processes
rm -f .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock 2>/dev/null

# Make sure git auth is wired up to GitHub CLI (no-op if already done)
command -v gh &>/dev/null && gh auth setup-git &>/dev/null

# Commit any uncommitted changes so nothing is left behind
git add -A
if ! git diff --cached --quiet; then
  MSG="${1:-Design update}"
  echo "Committing pending changes: $MSG"
  git commit -m "$MSG"
fi

echo ""
echo "Pushing to GitHub (advaitakelkar/advaitakelkar)..."
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "Pushed! CI is building & deploying — opening Actions..."
  open "https://github.com/advaitakelkar/advaitakelkar/actions"
else
  echo ""
  echo "Push failed. If it's an auth error, run in Terminal:  gh auth login"
  echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'not set')"
fi

echo ""
read -p "Press any key to close..." _
