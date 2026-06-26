#!/bin/bash
# Phase 1: Foundation — Token Deployment
# Ready-to-execute startup script
# Generated: 2026-06-22

set -e  # Exit on any error

PROJECT_ROOT="."
TOKEN_SOURCE="outputs/design-system/site-rh-cursos/tokens"
TOKEN_DEST="src/design-tokens"

echo "🎨 Phase 1: Foundation Startup"
echo "======================================"
echo ""

# Step 1: Create directory
echo "📁 Step 1: Creating token directory..."
mkdir -p "$TOKEN_DEST"
echo "   ✓ Directory created: $TOKEN_DEST"
echo ""

# Step 2: Copy token files
echo "📋 Step 2: Copying token files..."
if [ ! -f "$TOKEN_SOURCE/tokens.css" ]; then
  echo "   ❌ ERROR: tokens.css not found at $TOKEN_SOURCE/"
  exit 1
fi

cp "$TOKEN_SOURCE/tokens.css" "$TOKEN_DEST/"
echo "   ✓ Copied: tokens.css"

cp "$TOKEN_SOURCE/tokens.json" "$TOKEN_DEST/"
echo "   ✓ Copied: tokens.json"

cp "$TOKEN_SOURCE/tokens.tailwind.js" "$TOKEN_DEST/"
echo "   ✓ Copied: tokens.tailwind.js"

cp "$TOKEN_SOURCE/tokens.yaml" "$TOKEN_DEST/"
echo "   ✓ Copied: tokens.yaml"

cp "$TOKEN_SOURCE/tokens.dtcg.json" "$TOKEN_DEST/"
echo "   ✓ Copied: tokens.dtcg.json"

echo ""
echo "✅ All token files copied successfully"
echo ""

# Step 3: Verify
echo "🔍 Step 3: Verifying token files..."
FILE_COUNT=$(ls -1 "$TOKEN_DEST" | wc -l)
echo "   Found $FILE_COUNT files in $TOKEN_DEST/"
echo ""

if [ $FILE_COUNT -lt 5 ]; then
  echo "   ⚠️  WARNING: Expected 5 files, found $FILE_COUNT"
else
  echo "   ✓ All files present"
fi

echo ""
echo "======================================"
echo "✅ Phase 1 Startup Complete!"
echo ""
echo "Next steps (MANUAL):"
echo ""
echo "1️⃣  Import CSS in src/styles/globals.css"
echo "   Add: @import '../design-tokens/tokens.css';"
echo ""
echo "2️⃣  Extend Tailwind in tailwind.config.ts"
echo "   Import: import { tokens } from './src/design-tokens/tokens.tailwind.js'"
echo "   Extend colors, spacing, borderRadius, fonts with tokens.*"
echo ""
echo "3️⃣  Validate:"
echo "   npm run build"
echo "   npm run typecheck"
echo "   npm run lint"
echo ""
echo "4️⃣  Test in browser (F12 DevTools):"
echo "   Verify :root { --color-primary: ... } in Styles panel"
echo ""
echo "See PHASE-1-EXECUTION-PLAN.md for detailed steps"
echo ""
