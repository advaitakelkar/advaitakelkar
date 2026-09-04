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

# Branch assertion — this script pushes to main, which CI deploys
# straight to Firebase. Bail before touching git if we're elsewhere.
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  echo "You're on branch '$BRANCH', not 'main'."
  echo "This script commits and pushes to main. Switch branches first."
  echo ""
  read -p "Press any key to close..." _
  exit 1
fi

# Build gate — CI runs the same `pnpm build` and deploys straight to
# Firebase with no staging step and no rollback. Build HERE first; if
# it fails, nothing is committed and nothing is pushed.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v pnpm &>/dev/null; then
  echo "ERROR: pnpm not found on PATH — can't run the build gate."
  echo "Finder launches scripts with a minimal environment. Run this"
  echo "from a Terminal instead:  bash 5-launch.command"
  echo ""
  read -p "Press any key to close..." _
  exit 1
fi

echo "Building (Astro — same build CI runs)..."
if ! pnpm build; then
  echo ""
  echo "Build FAILED — nothing was committed or pushed."
  echo "Fix the build and run this again."
  echo ""
  read -p "Press any key to close..." _
  exit 1
fi
echo ""
echo "Build OK — continuing."

# Clear any stale lock files left by cloud sync / other processes
rm -f .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock 2>/dev/null

# Make sure git auth is wired up to GitHub CLI (no-op if already done)
command -v gh &>/dev/null && gh auth setup-git &>/dev/null

# Commit any uncommitted changes so nothing is left behind
git add -A
if ! git diff --cached --quiet; then
  # `git add -A` stages every untracked file into a PUBLIC repo. Show
  # exactly what's about to be committed and get a yes before we do it.
  echo "Staged for commit:"
  git status --short
  echo ""
  read -p "Commit these files? [y/N] " CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted — unstaging (working-tree changes kept)."
    git reset
    echo ""
    read -p "Press any key to close..." _
    exit 1
  fi
  MSG="$1"
  if [ -z "$MSG" ]; then
    read -p "Commit message: " MSG
  fi
  MSG="${MSG:-Design update $(date '+%Y-%m-%d %H:%M')}"
  echo "Committing pending changes: $MSG"
  git commit -m "$MSG"
fi

# Pull first — Keystatic and other machines can move main. A failed
# rebase means conflicts to resolve by hand; nothing gets pushed.
if ! git pull --rebase origin main; then
  echo ""
  echo "Rebase hit a conflict — resolve it by hand, then push again."
  echo "Nothing was pushed."
  echo ""
  read -p "Press any key to close..." _
  exit 1
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
