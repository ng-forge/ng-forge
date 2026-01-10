#!/bin/bash

# Unified postinstall script
# This script runs necessary setup tasks after pnpm install

echo "🚀 Running postinstall setup..."

# Install Playwright browsers for browser mode testing
echo "🎭 Installing Playwright browsers..."
pnpm exec playwright install chromium --with-deps

# Install git hooks
echo "🪝 Installing git hooks..."
lefthook install

echo "✅ Postinstall setup completed successfully!"
