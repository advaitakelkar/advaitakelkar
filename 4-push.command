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

# Build gate — CI runs the same `pnpm build` and deploys the result
# straight to Firebase with no staging step and no rollback. So build
# HERE first; if it fails, nothing is staged, committed or pushed.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v pnpm &>/dev/null; then
  echo "ERROR: pnpm not found on PATH — can't run the build gate."
  echo "Finder launches scripts with a minimal environment. Run this"
  echo "from a Terminal instead:  bash 4-push.command"
  echo ""
  read -p "Press any key to close..." _
  exit 1
fi

echo "Building (same build CI runs)..."
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
  git commit -m "$MSG"
  echo ""

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
