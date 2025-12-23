import { InjectionToken } from '@angular/core';
import type { Logger } from './logger.interface';

/**
 * Injection token for the dynamic forms logger.
 *
 * Provided by provideDynamicForm() with ConsoleLogger as default.
 * Override with withLoggerConfig(false) to disable logging.
 */
export const DynamicFormLogger = new InjectionToken<Logger>('DynamicFormLogger');
