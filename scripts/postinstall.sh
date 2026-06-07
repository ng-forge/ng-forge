#!/bin/bash

# Unified postinstall script
# This script runs necessary setup tasks after pnpm install

echo "🚀 Running postinstall setup..."

# Install Playwright browsers for browser mode testing
# Skip on Vercel — no E2E tests run there and apt-get is unavailable
if [ -z "$VERCEL" ]; then
  echo "🎭 Installing Playwright browsers..."
  pnpm exec playwright install chromium --with-deps
else
  echo "⏭️  Skipping Playwright install (Vercel environment)"
fi

# Install git hooks (skip on Vercel — no git operations run there)
if [ -z "$VERCEL" ]; then
  echo "🪝 Installing git hooks..."
  lefthook install
else
  echo "⏭️  Skipping git hooks install (Vercel environment)"
fi

# Build dynamic-form-mcp for local Claude Code usage.
# Skip on Vercel (build:libs handles it) and on CI (the build job rebuilds it,
# and --skip-nx-cache here would just defeat the cache on every install).
if [ -z "$VERCEL" ] && [ -z "$CI" ]; then
  echo "🔧 Building dynamic-form-mcp for local development..."
  if command -v nx &> /dev/null; then
    nx build dynamic-form-mcp --skip-nx-cache 2>/dev/null || echo "⚠️  MCP build skipped (nx not ready yet)"
  else
    pnpm exec nx build dynamic-form-mcp --skip-nx-cache 2>/dev/null || echo "⚠️  MCP build skipped (nx not ready yet)"
  fi
else
  echo "⏭️  Skipping MCP build (Vercel/CI environment — handled by the build pipeline)"
fi

echo "✅ Postinstall setup completed successfully!"
