#!/bin/bash
# ── advaitakelkar-website ──────────────────────────────────────
# Double-click this in Finder to install dependencies and start
# the local dev server. Run once after cloning or pulling.
# Prereq: Node.js 18+ and pnpm installed.
#   → Install pnpm: npm install -g pnpm

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=== advaitakelkar-website — dev setup ==="
echo "Working in: $SCRIPT_DIR"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found."
  echo "Install from https://nodejs.org then try again."
  read -p "Press any key to close..." _
  exit 1
fi

echo "Node: $(node --version)"

# Use pnpm if available, fall back to npm
if command -v pnpm &>/dev/null; then
  echo "pnpm: $(pnpm --version)"
  echo ""
  echo "Installing dependencies..."
  pnpm install --no-frozen-lockfile
  INSTALL_OK=$?
else
  echo "pnpm not found — falling back to npm."
  echo ""
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
  INSTALL_OK=$?
fi

if [ $INSTALL_OK -ne 0 ]; then
  echo ""
  echo "ERROR: install failed. See output above."
  read -p "Press any key to close..." _
  exit 1
fi

echo ""
echo "Starting dev server..."
echo "  Site:    http://localhost:4321"
echo "  CMS:     http://localhost:4321/keystatic"
echo ""

if command -v pnpm &>/dev/null; then
  pnpm dev
else
  npm run dev
fi
