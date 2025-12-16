import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { LogLevel } from './log-level';
import { DYNAMIC_FORM_LOGGER } from './logger.token';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';
import { DynamicFormLogger } from './logger.interface';

/**
 * Configuration options for the logger feature
 */
export interface LoggerFeatureOptions {
  /**
   * Log level to use. Messages below this level will be filtered.
   * @default LogLevel.Warn in dev, LogLevel.Off in prod
   */
  level?: LogLevel;

  /**
   * Custom logger implementation.
   * Use this to integrate with external logging services (Sentry, DataDog, etc.)
   * If provided, `level` is ignored - your implementation controls filtering.
   */
  logger?: DynamicFormLogger;
}

/**
 * Configure logging for dynamic forms.
 *
 * @example
 * ```typescript
 * // Set log level
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withLogger({ level: LogLevel.Debug })
 * )
 *
 * // Disable logging entirely
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withLogger({ level: LogLevel.Off })
 * )
 *
 * // Custom logger implementation
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withLogger({ logger: mySentryLogger })
 * )
 * ```
 *
 * @param options - Logger configuration options
 * @returns A DynamicFormFeature that configures logging
 */
export function withLogger(options: LoggerFeatureOptions = {}): DynamicFormFeature<'logger'> {
  let logger: DynamicFormLogger;

  if (options.logger) {
    // Use custom logger implementation
    logger = options.logger;
  } else if (options.level === LogLevel.Off) {
    // Explicit disable - use noop
    logger = new NoopLogger();
  } else {
    // Use console logger with specified level (default to Warn)
    logger = new ConsoleLogger(options.level ?? LogLevel.Warn);
  }

  return createFeature('logger', [{ provide: DYNAMIC_FORM_LOGGER, useValue: logger }]);
}
