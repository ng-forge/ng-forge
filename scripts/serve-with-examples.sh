#!/bin/bash

# Start example apps in the background
nx serve material-examples &
nx serve ionic-examples &
nx serve primeng-examples &
nx serve bootstrap-examples &

# Wait for all example servers to be ready
npx wait-on http://localhost:4201 http://localhost:4202 http://localhost:4203 http://localhost:4204 -t 60000

# Start docs server
nx serve docs
