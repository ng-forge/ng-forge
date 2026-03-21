#!/usr/bin/env node
/**
 * ng-forge OpenAPI Generator CLI
 *
 * Entry point for generating dynamic form configurations from OpenAPI specs.
 */

import { run } from '../src/cli/cli.js';

run().catch((error: unknown) => {
  console.error('Failed to run ng-forge generator:', error);
  process.exit(1);
});
