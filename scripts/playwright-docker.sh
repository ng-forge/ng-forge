#!/bin/bash
# Run Playwright tests in Docker for consistent cross-platform snapshots
#
# Usage:
#   ./scripts/playwright-docker.sh <app> <target> [options]
#
# Examples:
#   ./scripts/playwright-docker.sh sandbox-examples e2e-material                    # Run tests
#   ./scripts/playwright-docker.sh sandbox-examples e2e-material --update-snapshots # Update baselines
#   ./scripts/playwright-docker.sh sandbox-examples e2e-ionic --grep "input"        # Run specific tests
#   ./scripts/playwright-docker.sh sandbox-examples e2e-bootstrap --clean           # Clean cache first
#
# Apps: sandbox-examples
# Targets: e2e-material, e2e-bootstrap, e2e-primeng, e2e-ionic
# Options:
#   --clean  Clean Docker volumes before running tests

set -e

# Extract Playwright version from package.json to keep Docker image in sync
PLAYWRIGHT_VERSION=$(node -p "require('./package.json').devDependencies['@playwright/test']")
export PLAYWRIGHT_VERSION

APP=${1:-sandbox-examples}
TARGET=${2:-e2e-material}
shift 2 || true

# Validate app name
case $APP in
  sandbox-examples) ;;
  *)
    echo "Unknown app: $APP"
    echo "Valid apps: sandbox-examples"
    exit 1
    ;;
esac

# Validate target name
case $TARGET in
  e2e-material|e2e-bootstrap|e2e-primeng|e2e-ionic) ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Valid targets: e2e-material, e2e-bootstrap, e2e-primeng, e2e-ionic"
    exit 1
    ;;
esac

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

echo "Running Playwright tests for $APP:$TARGET in Docker..."
[[ -n "$EXTRA_ARGS" ]] && echo "Extra args: $EXTRA_ARGS"

# Extract short name for project isolation (e.g., "material" from "e2e-material")
PROJECT_NAME="playwright-${TARGET#e2e-}"

# Build the command - Playwright's webServer config handles dev server automatically
CMD="pnpm install --frozen-lockfile && pnpm exec nx run $APP:$TARGET $EXTRA_ARGS"

# Build the image (uses cache if unchanged) and run tests
# Use unique project name to allow parallel runs of different adapters
docker compose -p "$PROJECT_NAME" -f docker-compose.playwright.yml build
PLAYWRIGHT_CMD="$CMD" docker compose -p "$PROJECT_NAME" -f docker-compose.playwright.yml up \
  --abort-on-container-exit \
  --exit-code-from playwright
