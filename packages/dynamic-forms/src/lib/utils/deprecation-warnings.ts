import { isDevMode } from '@angular/core';
import { Logger } from '../providers/features/logger/logger.interface';
import { DeprecationWarningTracker } from './deprecation-warning-tracker';

/**
 * Emits a deprecation warning once per unique key in dev mode only.
 * Subsequent calls with the same `id` are silently ignored.
 *
 * @param logger - The DynamicFormLogger instance for output
 * @param tracker - DI-scoped tracker to deduplicate warnings
 * @param id - Unique identifier for this deprecation (e.g., 'type:propertyDerivation')
 * @param message - Human-readable deprecation message
 *
 * @public
 */
export function warnDeprecated(logger: Logger, tracker: DeprecationWarningTracker, id: string, message: string): void {
  if (isDevMode() && !tracker.warnedKeys.has(id)) {
    tracker.warnedKeys.add(id);
    logger.warn(`[Dynamic Forms] DEPRECATED: ${message}`);
  }
}
