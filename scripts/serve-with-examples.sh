#!/bin/bash
# Serve the docs app (examples are now embedded via sandbox harness)
#
# Usage:
#   ./scripts/serve-with-examples.sh
#   pnpm serve:all

set -e

nx serve docs
