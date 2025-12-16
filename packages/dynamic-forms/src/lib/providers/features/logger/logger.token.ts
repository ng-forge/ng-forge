import { InjectionToken, isDevMode } from '@angular/core';
import { DynamicFormLogger } from './logger.interface';
import { LogLevel } from './log-level';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';

/**
 * Injection token for the dynamic forms logger.
 *
 * Default behavior:
 * - Development mode: ConsoleLogger with LogLevel.Warn
 * - Production mode: NoopLogger (silent)
 *
 * Override by providing a custom logger via withLogger() feature
 * or by providing directly to this token.
 */
export const DYNAMIC_FORM_LOGGER = new InjectionToken<DynamicFormLogger>('DYNAMIC_FORM_LOGGER', {
  providedIn: 'root',
  factory: () => {
    if (isDevMode()) {
      return new ConsoleLogger(LogLevel.Warn);
    }
    return new NoopLogger();
  },
});
