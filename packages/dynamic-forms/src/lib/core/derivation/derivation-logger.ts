import { isDevMode } from '@angular/core';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationProcessingResult } from './derivation-applicator';

/**
 * Log level for derivation debug output.
 *
 * - 'none': No debug logging
 * - 'summary': Log cycle completion with counts (default in dev mode)
 * - 'verbose': Log individual derivation evaluation (future enhancement)
 *
 * @public
 */
export type DerivationLogLevel = 'none' | 'summary' | 'verbose';

/**
 * Configuration for derivation debug logging.
 *
 * @public
 */
export interface DerivationLogConfig {
  /** Log level for derivation debugging. Defaults to 'summary' in dev mode, 'none' in prod. */
  level: DerivationLogLevel;
}

/**
 * Prefix for derivation debug log messages.
 * @internal
 */
const LOG_PREFIX = '[Derivation]';

/**
 * Logs a summary of derivation processing results.
 *
 * Only logs when:
 * - Config level is 'summary' or 'verbose'
 * - At least one derivation was applied or an error occurred
 *
 * @param result - The derivation processing result
 * @param trigger - The trigger type ('onChange' or 'debounced')
 * @param logger - Logger instance
 * @param config - Debug logging configuration
 *
 * @public
 */
export function logDerivationSummary(
  result: DerivationProcessingResult,
  trigger: 'onChange' | 'debounced',
  logger: Logger,
  config: DerivationLogConfig,
): void {
  if (!shouldLog(config, 'summary')) return;

  // Only log if something interesting happened
  if (result.appliedCount === 0 && result.errorCount === 0) return;

  logger.debug(`${LOG_PREFIX} Cycle complete (${trigger})`, {
    applied: result.appliedCount,
    skipped: result.skippedCount,
    errors: result.errorCount,
    iterations: result.iterations,
  });
}

/**
 * Logs when max iterations are reached (always logged as warning).
 *
 * @param result - The derivation processing result
 * @param trigger - The trigger type
 * @param logger - Logger instance
 *
 * @public
 */
export function logMaxIterationsReached(result: DerivationProcessingResult, trigger: 'onChange' | 'debounced', logger: Logger): void {
  logger.warn(
    `${LOG_PREFIX} Processing reached max iterations (${trigger}). ` +
      `This may indicate a loop in derivation logic. ` +
      `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
  );
}

/**
 * Creates the default derivation log configuration based on environment.
 *
 * - In development mode: 'summary' (logs cycle completions)
 * - In production mode: 'none' (silent)
 *
 * @returns Default DerivationLogConfig
 *
 * @public
 */
export function createDefaultDerivationLogConfig(): DerivationLogConfig {
  return {
    level: isDevMode() ? 'summary' : 'none',
  };
}

/**
 * Checks if logging should occur at the specified level.
 *
 * @param config - Current log configuration
 * @param minLevel - Minimum level required for logging
 * @returns True if logging should occur
 *
 * @internal
 */
function shouldLog(config: DerivationLogConfig, minLevel: 'summary' | 'verbose'): boolean {
  if (config.level === 'none') return false;
  if (minLevel === 'summary') return config.level === 'summary' || config.level === 'verbose';
  return config.level === 'verbose';
}
