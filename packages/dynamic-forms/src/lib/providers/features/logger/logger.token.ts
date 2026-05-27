import { InjectionToken } from '@angular/core';
import type { Logger } from './logger.interface';

/** Injection token for the dynamic forms logger. */
export const DynamicFormLogger = new InjectionToken<Logger>('DynamicFormLogger');
