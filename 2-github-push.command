#!/bin/bash
# Double-click this file in Finder to push your project to GitHub.
# Prerequisites: run 1-setup.command first (npm install must succeed).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=== GitHub Push — advaitakelkar-v2 ==="
echo ""

# Check git
if ! command -v git &>/dev/null; then
  echo "ERROR: git not found. Install Xcode Command Line Tools:"
  echo "  xcode-select --install"
  read -p "Press any key to close..." _
  exit 1
fi

echo "Repo: https://github.com/advaitakelkar/advaitakelkar"
echo ""

# Init git if needed
if [ ! -d ".git" ]; then
  echo "Initialising git..."
  git init
  git branch -M main
fi

# Check for existing remote
if git remote get-url origin &>/dev/null; then
  echo "Remote 'origin' already set: $(git remote get-url origin)"
else
  REPO_URL="https://github.com/advaitakelkar/advaitakelkar.git"
  echo "Adding remote: $REPO_URL"
  git remote add origin "$REPO_URL"
fi

# Create .gitignore if missing
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOF'
node_modules/
dist/
.astro/
.DS_Store
*.local
serviceAccount.json
EOF
  echo "Created .gitignore"
fi

echo ""
echo "Staging all files..."
git add .

echo "Committing..."
git commit -m "Initial commit — Astro 5 site migration from Webflow"

echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "SUCCESS! Your site is on GitHub:"
  echo "  https://github.com/advaitakelkar/advaitakelkar"
  echo ""
  echo "Next step: Firebase hosting setup."
  echo "See DEPLOY.md for instructions."
  open "https://github.com/advaitakelkar/advaitakelkar"
else
  echo ""
  echo "Push failed. If you see an authentication error, run this in Terminal:"
  echo "  gh auth login"
  echo "  (Install GitHub CLI from https://cli.github.com if needed)"
  echo ""
  echo "Then double-click this script again."
fi

echo ""
read -p "Press any key to close..." _
