#!/usr/bin/env bash

# Vercel build entrypoint.
# Exports NODE_OPTIONS so child processes (vite SSR worker, etc.) inherit it
# reliably — inline `KEY=val cmd` in vercel.json's buildCommand did not
# propagate to the SSR transform step and caused OOM during docs prerender.

set -e

export NODE_OPTIONS=--max-old-space-size=8192
export NX_DAEMON=false

git fetch --unshallow --quiet 2>/dev/null || true

exec pnpm run deploy:prep
