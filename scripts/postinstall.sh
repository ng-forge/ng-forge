#!/bin/bash

# Unified postinstall script for all patches
# This script applies all necessary patches after pnpm install

echo "🚀 Running postinstall patches..."

# Angular build patches
echo "📦 Applying Angular build patches..."
bash scripts/patch-angular-build.sh

# Install git hooks
echo "🪝 Installing git hooks..."
lefthook install

echo "✅ All postinstall patches completed successfully!"
