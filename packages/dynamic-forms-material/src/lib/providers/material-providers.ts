import type { Provider } from '@angular/core';
import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import { MaterialConfig } from '../models/material-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';

/**
 * Field type definitions for Material Design components.
 */
export type MaterialFieldTypes = FieldTypeDefinition[];

type MaterialConfigFeature = {
  ɵkind: 'material-config';
  ɵproviders: Provider[];
};

type MaterialFieldsWithConfig = [...MaterialFieldTypes, MaterialConfigFeature];

/**
 * Configure dynamic forms with Material Design field types.
 * Provides all Material Design field types for use with provideDynamicForm.
 *
 * @param config - Optional global configuration for Material form fields
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withMaterialFields } from '@ng-forge/dynamic-form-material';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields())
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
 *       ...withMaterialFields({
 *         appearance: 'fill',
 *         subscriptSizing: 'fixed'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions and optionally a config feature
 */
export function withMaterialFields(): MaterialFieldTypes;
export function withMaterialFields(config: MaterialConfig): MaterialFieldsWithConfig;
export function withMaterialFields(config: MaterialConfig | undefined): MaterialFieldTypes | MaterialFieldsWithConfig;
export function withMaterialFields(config?: MaterialConfig): MaterialFieldTypes | MaterialFieldsWithConfig {
  if (!config) {
    return MATERIAL_FIELD_TYPES;
  }

  const fieldsWithConfig = [
    ...MATERIAL_FIELD_TYPES,
    {
      ɵkind: 'material-config',
      ɵproviders: [{ provide: MATERIAL_CONFIG, useValue: config }],
    } satisfies MaterialConfigFeature,
  ];

  // Safe: this preserves all material field definitions and appends exactly one config feature.
  return fieldsWithConfig as MaterialFieldsWithConfig;
}
