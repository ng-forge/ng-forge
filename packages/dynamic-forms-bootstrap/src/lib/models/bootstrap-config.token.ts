import { InjectionToken } from '@angular/core';
import { BootstrapConfig } from './bootstrap-config';

/**
 * Injection token for Bootstrap form configuration.
 * Use this to provide global configuration for Bootstrap form fields.
 *
 * @example
 * ```typescript
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withBootstrapFields({
 *         floatingLabel: true,
 *         size: 'lg'
 *       })
 *     )
 *   ]
 * };
 * ```
 */
export const BOOTSTRAP_CONFIG = new InjectionToken<BootstrapConfig>('BOOTSTRAP_CONFIG');
