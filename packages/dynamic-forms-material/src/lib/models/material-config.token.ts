import { InjectionToken } from '@angular/core';
import { MaterialConfig } from './material-config';

/**
 * Injection token for Material Design form configuration.
 * Use this to provide global configuration for Material form fields.
 *
 * @example
 * ```typescript
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withMaterialFields({
 *         appearance: 'fill',
 *         subscriptSizing: 'fixed'
 *       })
 *     )
 *   ]
 * };
 * ```
 */
export const MATERIAL_CONFIG = new InjectionToken<MaterialConfig>('MATERIAL_CONFIG');
