#!/bin/bash

# Native Federation Development Server
# Starts all example remotes and the docs host with federation support

echo "🚀 Starting Native Federation development servers..."

# Start example apps (remotes) in the background
nx serve material-examples &
nx serve bootstrap-examples &
nx serve ionic-examples &
nx serve primeng-examples &

# Wait for all example servers to be ready
echo "⏳ Waiting for remote servers to be ready..."
npx wait-on http://localhost:4201 http://localhost:4202 http://localhost:4203 http://localhost:4204 -t 120000

echo "✅ All remotes ready. Starting docs host..."

# Start docs server (host)
nx serve docs
