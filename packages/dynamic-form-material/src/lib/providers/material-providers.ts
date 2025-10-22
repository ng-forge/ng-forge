import { DynamicFormConfig, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';

/**
 * Provide Material Design field types for dynamic forms.
 *
 * If you pass a config that includes a `fields` property, the result type will be inferred.
 */
export function withMaterialFields(config?: DynamicFormConfig): DynamicFormConfig {
  return withConfig({
    types: MATERIAL_FIELD_TYPES,
    ...(config ?? {}),
  });
}

/**
 * Enhanced Material provider with full type inference
 */
export function withTypedMaterialFields(config: DynamicFormConfig): DynamicFormConfig {
  return withMaterialFields(config);
}
