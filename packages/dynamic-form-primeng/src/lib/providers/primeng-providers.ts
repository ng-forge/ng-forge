import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import type { Provider } from '@angular/core';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';

/**
 * Provides PrimeNG field type definitions for the dynamic form system.
 *
 * Use this function in your application providers to register PrimeNG field components.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields())
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for PrimeNG components
 */
export function withPrimeNGFields(): FieldTypeDefinition[] {
  return PRIMENG_FIELD_TYPES;
}

/**
 * Configure global defaults for PrimeNG fields.
 *
 * This function provides global configuration that applies to all PrimeNG fields
 * in the form. Field-level props will override these global defaults.
 *
 * @param config - Global PrimeNG configuration
 * @returns Array of Angular providers
 *
 * @example
 * ```typescript
 * // Application-level setup with global PrimeNG config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields()),
 *     ...withPrimeNGConfig({ variant: 'filled', size: 'large' })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields()),
 *     ...withPrimeNGConfig({
 *       variant: 'filled',
 *       size: 'small',
 *       styleClass: 'my-custom-theme',
 *       buttonSeverity: 'success',
 *       buttonRounded: true
 *     })
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withPrimeNGConfig(config: PrimeNGConfig): Provider[] {
  return [
    {
      provide: PRIMENG_CONFIG,
      useValue: config,
    },
  ];
}
