import { InjectionToken } from '@angular/core';
import { PrimeNGConfig } from './primeng-config';

/**
 * Injection token for PrimeNG form configuration.
 * Use this to provide global configuration for PrimeNG form fields.
 */
export const PRIMENG_CONFIG = new InjectionToken<PrimeNGConfig>('PRIMENG_CONFIG');
