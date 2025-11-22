import { InjectionToken } from '@angular/core';
import { IonicConfig } from './ionic-config';

/**
 * Injection token for Ionic form configuration.
 * Use this to provide global configuration for Ionic form fields.
 *
 * @example
 * ```typescript
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withIonicFields({
 *         fill: 'outline',
 *         labelPlacement: 'floating'
 *       })
 *     )
 *   ]
 * };
 * ```
 */
export const IONIC_CONFIG = new InjectionToken<IonicConfig>('IONIC_CONFIG');
