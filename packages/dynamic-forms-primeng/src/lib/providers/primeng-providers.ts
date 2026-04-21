import type { Provider } from '@angular/core';
import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';

/**
 * Field type definitions for PrimeNG components.
 */
export type PrimeNGFieldTypes = FieldTypeDefinition[];

type PrimeNGConfigFeature = {
  ɵkind: 'primeng-config';
  ɵproviders: Provider[];
};

type PrimeNGFieldsWithConfig = [...PrimeNGFieldTypes, PrimeNGConfigFeature];

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
 * @returns Array of field type definitions and optionally a config feature
 */
export function withPrimeNGFields(): PrimeNGFieldTypes;
export function withPrimeNGFields(config: PrimeNGConfig): PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config: PrimeNGConfig | undefined): PrimeNGFieldTypes | PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config?: PrimeNGConfig): PrimeNGFieldTypes | PrimeNGFieldsWithConfig {
  if (!config) {
    return PRIMENG_FIELD_TYPES;
  }

  const fieldsWithConfig = [
    ...PRIMENG_FIELD_TYPES,
    {
      ɵkind: 'primeng-config',
      ɵproviders: [{ provide: PRIMENG_CONFIG, useValue: config }],
    } satisfies PrimeNGConfigFeature,
  ];

  // Safe: this preserves all PrimeNG field definitions and appends exactly one config feature.
  return fieldsWithConfig as PrimeNGFieldsWithConfig;
}
