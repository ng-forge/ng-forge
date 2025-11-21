import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import type { Provider } from '@angular/core';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';

/**
 * Field type definitions with optional config providers
 */
export type FieldTypeDefinitionsWithConfig = FieldTypeDefinition[] & {
  __configProviders?: Provider[];
};

/**
 * Provides PrimeNG field type definitions for the dynamic form system.
 *
 * Use this function in your application providers to register PrimeNG field components.
 *
 * @param config - Optional global configuration for PrimeNG form fields
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
 * @example
 * ```typescript
 * // With global configuration
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
 *
 * @returns Array of field type definitions for PrimeNG components
 */
export function withPrimeNGFields(config?: PrimeNGConfig): FieldTypeDefinitionsWithConfig {
  const fields = PRIMENG_FIELD_TYPES as FieldTypeDefinitionsWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: PRIMENG_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}
