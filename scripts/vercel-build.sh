#!/usr/bin/env bash

# Vercel build entrypoint.
# Exports NODE_OPTIONS so child processes (vite SSR worker, etc.) inherit it
# reliably — inline `KEY=val cmd` in vercel.json's buildCommand did not
# propagate to the SSR transform step and caused OOM during docs prerender.
#
# Heap cap is 6 GB, not the container's full 8 GB: the build's working set is
# ~5 GB, and giving Node the whole container leaves no headroom for the OS, so
# Node lazily grows RSS to 8 GB and the kernel SIGKILLs it (container OOM). 6 GB
# fits the workload with ~2 GB to spare.

set -e

export NODE_OPTIONS=--max-old-space-size=6144
export NX_DAEMON=false

git fetch --unshallow --quiet 2>/dev/null || true

exec pnpm run deploy:prep
