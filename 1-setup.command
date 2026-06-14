#!/bin/bash
# Double-click this file in Finder to install dependencies and start the dev server.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=== advaitakelkar-v2 setup ==="
echo "Working in: $SCRIPT_DIR"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org and try again."
  read -p "Press any key to close..." _
  exit 1
fi

echo "Node: $(node --version)   npm: $(npm --version)"
echo ""
echo "Running npm install..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo ""
  echo "Retrying with --force..."
  npm install --force
fi

if [ $? -ne 0 ]; then
  echo ""
  echo "ERROR: npm install failed. See output above."
  read -p "Press any key to close..." _
  exit 1
fi

echo ""
echo "Done! Starting dev server..."
echo "Open http://localhost:4321 in your browser."
echo "Keystatic CMS: http://localhost:4321/keystatic"
echo ""
npm run dev
