#!/usr/bin/env node
/** ng-forge OpenAPI Generator CLI */

import { run } from '../src/cli/cli.js';
import { logger } from '../src/utils/logger.js';

run().catch((error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('Only OpenAPI 3.x')) {
      logger.error('Only OpenAPI 3.x specifications are supported. Swagger 2.0 specs must be converted first.');
      logger.info('Tip: Use https://converter.swagger.io to convert Swagger 2.0 to OpenAPI 3.0');
    } else if (error instanceof RangeError && /stack|recursion/i.test(error.message)) {
      // RangeError + a stack/recursion message: V8 says "Maximum call stack size exceeded",
      // SpiderMonkey says "too much recursion". `instanceof RangeError` alone is too broad
      // (invalid array length, etc.); the regex keeps the hint targeted across engines.
      logger.error('Schema generation failed: stack overflow during schema traversal.');
      logger.info('Tip: this usually means your spec contains a circular $ref chain (e.g. A → B → A).');
      logger.info(
        '     Identify the cycle and either flatten it or annotate the back-edge with x-ng-forge-type to control how it renders.',
      );
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
