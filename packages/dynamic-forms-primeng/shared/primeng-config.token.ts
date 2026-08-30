import { InjectionToken } from '@angular/core';
import type { PrimeNGConfig } from './primeng-config';

/** Global configuration for PrimeNG form fields. */
export const PRIMENG_CONFIG = new InjectionToken<PrimeNGConfig>('PRIMENG_CONFIG');
