import { DynamicFormFeature, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';

/**
 * Provide Material Design field types for dynamic forms
 */
export function withMaterialFields(): DynamicFormFeature {
  return withConfig({
    types: MATERIAL_FIELD_TYPES,
  });
}
