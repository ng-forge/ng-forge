#!/bin/bash
# Clean Docker volumes for Playwright E2E tests
#
# Usage:
#   ./scripts/clean-e2e-cache.sh
#   pnpm e2e:clean
#
# When to use:
#   - After upgrading Playwright version
#   - When seeing "Unrecognized Cache Artifacts" warnings
#   - When tests behave unexpectedly
#   - When Docker volumes become corrupted

set -e

echo "Cleaning E2E Docker volumes..."

# Stop any running containers
docker compose -f docker-compose.playwright.yml down -v 2>/dev/null || true

# Remove named volumes (may not exist)
docker volume rm ng-forge_playwright-cache ng-forge_nx-cache 2>/dev/null || true

echo "Done. Run e2e tests fresh with: pnpm e2e:<framework>"
echo ""
echo "Available frameworks:"
echo "  pnpm e2e:material"
echo "  pnpm e2e:bootstrap"
echo "  pnpm e2e:primeng"
echo "  pnpm e2e:ionic"
