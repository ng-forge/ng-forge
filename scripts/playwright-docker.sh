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
#   ./scripts/playwright-docker.sh ionic-examples --clean            # Clean cache first
#
# Apps: ionic-examples, material-examples, bootstrap-examples, primeng-examples
# Options:
#   --clean  Clean Docker volumes before running tests

set -e

# Extract Playwright version from package.json to keep Docker image in sync
PLAYWRIGHT_VERSION=$(node -p "require('./package.json').devDependencies['@playwright/test']")
export PLAYWRIGHT_VERSION

APP=${1:-ionic-examples}
shift || true

# Handle --clean flag
CLEAN=false
EXTRA_ARGS=""
for arg in "$@"; do
  if [[ "$arg" == "--clean" ]]; then
    CLEAN=true
  else
    EXTRA_ARGS="$EXTRA_ARGS $arg"
  fi
done
EXTRA_ARGS=$(echo "$EXTRA_ARGS" | xargs)  # Trim whitespace

if [[ "$CLEAN" == "true" ]]; then
  echo "Cleaning Docker volumes first..."
  ./scripts/clean-e2e-cache.sh
  echo ""
fi

# Validate app name
case $APP in
  material-examples|primeng-examples|ionic-examples|bootstrap-examples|core-examples) ;;
  *)
    echo "Unknown app: $APP"
    echo "Valid apps: core-examples, ionic-examples, material-examples, bootstrap-examples, primeng-examples"
    exit 1
    ;;
esac

echo "Running Playwright tests for $APP in Docker..."
[[ -n "$EXTRA_ARGS" ]] && echo "Extra args: $EXTRA_ARGS"

# Extract short name for project isolation (e.g., "material" from "material-examples")
PROJECT_NAME="playwright-${APP%-examples}"

# Build the command - Playwright's webServer config handles dev server automatically
CMD="pnpm install --frozen-lockfile && pnpm exec nx run $APP:e2e $EXTRA_ARGS"

# Build the image (uses cache if unchanged) and run tests
# Use unique project name to allow parallel runs of different apps
docker compose -p "$PROJECT_NAME" -f docker-compose.playwright.yml build
PLAYWRIGHT_CMD="$CMD" docker compose -p "$PROJECT_NAME" -f docker-compose.playwright.yml up \
  --abort-on-container-exit \
  --exit-code-from playwright
