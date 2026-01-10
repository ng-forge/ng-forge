#!/bin/bash
# Run Playwright tests in Docker for consistent cross-platform snapshots
#
# Usage:
#   ./scripts/playwright-docker.sh <app> [options]
#
# Examples:
#   ./scripts/playwright-docker.sh ionic-examples                    # Run tests
#   ./scripts/playwright-docker.sh ionic-examples --update-snapshots # Update baselines
#   ./scripts/playwright-docker.sh material-examples --grep "input"  # Run specific tests
#
# Apps: ionic-examples, material-examples, bootstrap-examples, primeng-examples

set -e

APP=${1:-ionic-examples}
shift || true
EXTRA_ARGS="$@"

# Map app to port
case $APP in
  material-examples) PORT=4201 ;;
  primeng-examples) PORT=4202 ;;
  ionic-examples) PORT=4203 ;;
  bootstrap-examples) PORT=4204 ;;
  *)
    echo "Unknown app: $APP"
    echo "Valid apps: ionic-examples, material-examples, bootstrap-examples, primeng-examples"
    exit 1
    ;;
esac

echo "Running Playwright tests for $APP in Docker..."
echo "Extra args: $EXTRA_ARGS"

# Build the command
CMD="pnpm exec nx run $APP:serve --port $PORT & sleep 10 && pnpm exec nx run $APP:e2e $EXTRA_ARGS; kill %1 2>/dev/null || true"

# Run in Docker
PLAYWRIGHT_CMD="$CMD" docker compose -f docker-compose.playwright.yml run --rm playwright
