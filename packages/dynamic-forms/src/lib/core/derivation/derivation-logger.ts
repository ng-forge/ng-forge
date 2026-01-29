import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogConfig, shouldLog } from '../../models/logic/logic-config';
import { DerivationProcessingResult } from './derivation-types';

// Re-export types from models for backwards compatibility
export type { DerivationLogLevel, DerivationLogConfig } from '../../models/logic/logic-config';
export { createDefaultDerivationLogConfig, shouldLog } from '../../models/logic/logic-config';

/**
 * Information about a single derivation evaluation for logging.
 *
 * @public
 */
export interface DerivationLogEntry {
  /** Debug name if provided in the derivation config */
  debugName?: string;
  /** Field key where the derivation is defined and targets */
  fieldKey: string;
  /** Result of the derivation evaluation */
  result: 'applied' | 'skipped' | 'error';
  /** Reason for skipping (if result is 'skipped') */
  skipReason?: 'condition-false' | 'value-unchanged' | 'already-applied' | 'target-not-found';
  /** The new value that was set (if result is 'applied') */
  newValue?: unknown;
  /** The previous value before the derivation (if result is 'applied') */
  previousValue?: unknown;
  /** Error message (if result is 'error') */
  error?: string;
  /** Duration in milliseconds (optional, for performance tracking) */
  durationMs?: number;
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
 * Logs a verbose entry for a single derivation evaluation.
 *
 * Only logs when config level is 'verbose'.
 *
 * @param entry - The derivation log entry with evaluation details
 * @param logger - Logger instance
 * @param config - Debug logging configuration
 *
 * @internal
 */
export function logDerivationEvaluation(entry: DerivationLogEntry, logger: Logger, config: DerivationLogConfig): void {
  if (!shouldLog(config, 'verbose')) return;

  const name = entry.debugName ? `"${entry.debugName}"` : entry.fieldKey;

  switch (entry.result) {
    case 'applied':
      logger.debug(`${LOG_PREFIX} -> Applied: ${name}`, {
        field: entry.fieldKey,
        previousValue: entry.previousValue,
        newValue: entry.newValue,
        ...(entry.durationMs !== undefined && { durationMs: entry.durationMs }),
      });
      break;

    case 'skipped':
      logger.debug(`${LOG_PREFIX} -> Skipped: ${name} (${formatSkipReason(entry.skipReason)})`, {
        field: entry.fieldKey,
        reason: entry.skipReason,
      });
      break;

    case 'error':
      logger.debug(`${LOG_PREFIX} -> Error: ${name}`, {
        field: entry.fieldKey,
        error: entry.error,
      });
      break;
  }
}

/**
 * Formats the skip reason for human-readable output.
 *
 * @internal
 */
function formatSkipReason(reason?: string): string {
  switch (reason) {
    case 'condition-false':
      return 'condition not met';
    case 'value-unchanged':
      return 'value unchanged';
    case 'already-applied':
      return 'already applied this cycle';
    default:
      return 'unknown';
  }
}

/**
 * Logs the start of a derivation processing cycle.
 *
 * Only logs when config level is 'verbose'.
 *
 * @param trigger - The trigger type ('onChange' or 'debounced')
 * @param entryCount - Number of derivations to process in this cycle
 * @param logger - Logger instance
 * @param config - Debug logging configuration
 *
 * @internal
 */
export function logDerivationCycleStart(
  trigger: 'onChange' | 'debounced',
  entryCount: number,
  logger: Logger,
  config: DerivationLogConfig,
): void {
  if (!shouldLog(config, 'verbose')) return;

  logger.debug(`${LOG_PREFIX} Starting cycle (${trigger}) with ${entryCount} derivation(s)`);
}

/**
 * Logs the start of a derivation iteration within a cycle.
 *
 * Only logs when config level is 'verbose'.
 *
 * @param iteration - Current iteration number (1-based)
 * @param logger - Logger instance
 * @param config - Debug logging configuration
 *
 * @internal
 */
export function logDerivationIteration(iteration: number, logger: Logger, config: DerivationLogConfig): void {
  if (!shouldLog(config, 'verbose')) return;

  logger.debug(`${LOG_PREFIX} Iteration ${iteration}`);
}
