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

# Build dynamic-form-mcp for local Claude Code usage
echo "🔧 Building dynamic-form-mcp for local development..."
if command -v nx &> /dev/null; then
  nx build dynamic-form-mcp --skip-nx-cache 2>/dev/null || echo "⚠️  MCP build skipped (nx not ready yet)"
else
  pnpm exec nx build dynamic-form-mcp --skip-nx-cache 2>/dev/null || echo "⚠️  MCP build skipped (nx not ready yet)"
fi

echo "✅ Postinstall setup completed successfully!"
