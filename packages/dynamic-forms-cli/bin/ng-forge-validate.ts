#!/usr/bin/env node
/** ng-forge FormConfig validator CLI */

import { run } from '../src/cli.js';

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('ENOENT') || message.includes('no such file')) {
    console.error(`File not found: ${message}`);
  } else {
    console.error(`Validation failed: ${message}`);
  }

  process.exitCode = 2;
});
