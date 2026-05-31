import { Logger } from '@ng-forge/dynamic-forms/internal';
import type { WarningTracker } from '@ng-forge/dynamic-forms/internal';
import { DEV_MODE } from './dev-mode';

/**
 * Emits a deprecation warning once per unique key in dev mode only.
 * Subsequent calls with the same `id` are silently ignored.
 *
 * @param logger - The DynamicFormLogger instance for output
 * @param tracker - DI-scoped tracker to deduplicate warnings
 * @param id - Unique identifier for this deprecation (e.g., 'type:propertyDerivation')
 * @param message - Human-readable deprecation message
 * @internal
 */
export function warnDeprecated(logger: Logger, tracker: WarningTracker, id: string, message: string): void {
  if (DEV_MODE && !tracker.warnedKeys.has(id)) {
    tracker.warnedKeys.add(id);
    logger.warn(`DEPRECATED: ${message}`);
  }
}
