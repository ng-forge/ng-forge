import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { DynamicFormLogger } from './logger.token';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';

/**
 * Configure logging for dynamic forms.
 *
 * By default, logging is enabled (ConsoleLogger). Use this feature to disable logging
 * or configure it conditionally.
 *
 * @example
 * ```typescript
 * // Disable logging
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withLoggerConfig(false)
 * )
 *
 * // Conditional logging (e.g., only in dev mode)
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withLoggerConfig(() => isDevMode())
 * )
 * ```
 *
 * @param enabled - Whether logging is enabled. Can be a boolean or a function that returns a boolean. Defaults to true.
 * @returns A DynamicFormFeature that configures logging
 */
export function withLoggerConfig(enabled: boolean | (() => boolean) = true): DynamicFormFeature<'logger'> {
  const isEnabled = typeof enabled === 'function' ? enabled() : enabled;
  const logger = isEnabled ? new ConsoleLogger() : new NoopLogger();

  return createFeature('logger', [{ provide: DynamicFormLogger, useValue: logger }]);
}
