#!/usr/bin/env node
/**
 * ng-forge OpenAPI Generator CLI
 *
 * Entry point for generating dynamic form configurations from OpenAPI specs.
 */

import { run } from '../src/cli/cli.js';
import { logger } from '../src/utils/logger.js';

run().catch((error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('Only OpenAPI 3.x')) {
      logger.error('Only OpenAPI 3.x specifications are supported. Swagger 2.0 specs must be converted first.');
      logger.info('Tip: Use https://converter.swagger.io to convert Swagger 2.0 to OpenAPI 3.0');
    } else {
      logger.error(error.message);
    }
    if (process.env['DEBUG']) {
      console.error(error.stack);
    }
  } else {
    logger.error(`An unexpected error occurred: ${String(error)}`);
  }
  process.exit(1);
});
