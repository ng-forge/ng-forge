#!/bin/bash
# Serve all example apps and docs together with proper cleanup
#
# Usage:
#   ./scripts/serve-with-examples.sh
#   pnpm serve:all

set -e

# Track background PIDs for cleanup
PIDS=()

cleanup() {
  echo ""
  echo "Stopping all servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  # Also kill any child processes
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  echo "All servers stopped."
}

# Set up trap for cleanup on exit, interrupt, or termination
trap cleanup EXIT INT TERM

# Start example apps in the background
echo "Starting example apps..."
nx serve material-examples &
PIDS+=($!)
nx serve ionic-examples &
PIDS+=($!)
nx serve primeng-examples &
PIDS+=($!)
nx serve bootstrap-examples &
PIDS+=($!)

# Wait for all example servers to be ready
echo "Waiting for example servers to be ready..."
npx wait-on http://localhost:4201 http://localhost:4202 http://localhost:4203 http://localhost:4204 -t 60000

echo "All example servers ready. Starting docs server..."
# Start docs server (foreground - this blocks until terminated)
nx serve docs
