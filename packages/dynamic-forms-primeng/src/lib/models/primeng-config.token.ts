import { InjectionToken } from '@angular/core';
import { PrimeNGConfig } from './primeng-config';

/**
 * Injection token for PrimeNG form configuration.
 * Use this to provide global configuration for PrimeNG form fields.
 *
 * @example
 * ```typescript
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withPrimeNGFields({
 *         variant: 'filled',
 *         size: 'large'
 *       })
 *     )
 *   ]
 * };
 * ```
 */
export const PRIMENG_CONFIG = new InjectionToken<PrimeNGConfig>('PRIMENG_CONFIG');
