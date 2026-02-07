import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogConfig, createDefaultDerivationLogConfig, shouldLog } from '../../models/logic/logic-config';
import { DerivationProcessingResult } from './derivation-types';
import { DerivationLogEntry } from './derivation-logger';

/**
 * Service interface for derivation logging.
 *
 * Provides methods to log derivation processing events at different verbosity levels.
 * Use `createDerivationLogger` factory to create an instance.
 *
 * @public
 */
export interface DerivationLogger {
  /**
   * Logs the start of a derivation processing cycle.
   * Only logs when config level is 'verbose'.
   */
  cycleStart(trigger: 'onChange' | 'debounced', entryCount: number): void;

  /**
   * Logs the start of a derivation iteration within a cycle.
   * Only logs when config level is 'verbose'.
   */
  iteration(iterationNumber: number): void;

  /**
   * Logs a single derivation evaluation result.
   * Only logs when config level is 'verbose'.
   */
  evaluation(entry: DerivationLogEntry): void;

  /**
   * Logs a summary of derivation processing results.
   * Logs when config level is 'summary' or 'verbose' and something interesting happened.
   */
  summary(result: DerivationProcessingResult, trigger: 'onChange' | 'debounced'): void;

  /**
   * Logs when max iterations are reached (always logged as warning).
   */
  maxIterationsReached(result: DerivationProcessingResult, trigger: 'onChange' | 'debounced'): void;
}

/**
 * Active implementation of DerivationLogger that performs actual logging.
 *
 * @internal
 */
class ActiveDerivationLogger implements DerivationLogger {
  logger!: Logger;
  private config: DerivationLogConfig = createDefaultDerivationLogConfig();

  /**
   * Updates the log configuration.
   */
  setConfig(config: DerivationLogConfig): void {
    this.config = config;
  }

  cycleStart(trigger: 'onChange' | 'debounced', entryCount: number): void {
    if (!shouldLog(this.config, 'verbose')) return;
    this.logger.debug(`Derivation - Starting cycle (${trigger}) with ${entryCount} derivation(s)`);
  }

  iteration(iterationNumber: number): void {
    if (!shouldLog(this.config, 'verbose')) return;
    this.logger.debug(`Derivation - Iteration ${iterationNumber}`);
  }

  evaluation(entry: DerivationLogEntry): void {
    if (!shouldLog(this.config, 'verbose')) return;

    const name = entry.debugName ? `"${entry.debugName}"` : entry.fieldKey;

    switch (entry.result) {
      case 'applied':
        this.logger.debug(`Derivation - Applied ${name}`, {
          field: entry.fieldKey,
          previousValue: entry.previousValue,
          newValue: entry.newValue,
          ...(entry.durationMs !== undefined && { durationMs: entry.durationMs }),
        });
        break;

      case 'skipped':
        this.logger.debug(`Derivation - Skipped ${name} (${this.formatSkipReason(entry.skipReason)})`, {
          field: entry.fieldKey,
          reason: entry.skipReason,
        });
        break;

      case 'error':
        this.logger.debug(`Derivation - Error ${name}`, {
          field: entry.fieldKey,
          error: entry.error,
        });
        break;
    }
  }

  summary(result: DerivationProcessingResult, trigger: 'onChange' | 'debounced'): void {
    if (!shouldLog(this.config, 'summary')) return;

    // Only log if something interesting happened
    if (result.appliedCount === 0 && result.errorCount === 0) return;

    this.logger.debug(`Derivation - Cycle complete (${trigger})`, {
      applied: result.appliedCount,
      skipped: result.skippedCount,
      errors: result.errorCount,
      iterations: result.iterations,
    });
  }

  maxIterationsReached(result: DerivationProcessingResult, trigger: 'onChange' | 'debounced'): void {
    this.logger.warn(
      `Derivation - Max iterations reached (${trigger}). ` +
        `This may indicate a loop in derivation logic. ` +
        `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
    );
  }

  private formatSkipReason(reason?: string): string {
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
}

/**
 * No-op implementation of DerivationLogger.
 * All methods are empty - no logging overhead when disabled.
 *
 * @internal
 */
class NoopDerivationLogger implements DerivationLogger {
  cycleStart(): void {
    /* no-op */
  }
  iteration(): void {
    /* no-op */
  }
  evaluation(): void {
    /* no-op */
  }
  summary(): void {
    /* no-op */
  }
  maxIterationsReached(): void {
    /* no-op */
  }
}

/** Singleton no-op instance to avoid creating new objects */
const NOOP_INSTANCE = new NoopDerivationLogger();

/**
 * Factory function to create a DerivationLogger.
 *
 * Returns a no-op implementation if config level is 'none',
 * otherwise returns an active logger with the given config.
 *
 * @param config - The derivation log configuration
 * @param logger - The underlying logger instance
 * @returns A DerivationLogger instance
 *
 * @public
 */
export function createDerivationLogger(config: DerivationLogConfig | undefined, logger: Logger): DerivationLogger {
  const effectiveConfig = config ?? createDefaultDerivationLogConfig();

  // Return no-op if logging is completely disabled
  if (effectiveConfig.level === 'none') {
    return NOOP_INSTANCE;
  }

  // Create active logger with config
  const service = new ActiveDerivationLogger();
  service.logger = logger;
  service.setConfig(effectiveConfig);

  return service;
}
