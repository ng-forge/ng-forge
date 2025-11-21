import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import type { Provider } from '@angular/core';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import { MaterialConfig } from '../models/material-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';
import {
  MatButtonField,
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatRadioField,
  MatSelectField,
  MatSliderField,
  MatSubmitButtonField,
  MatTextareaField,
  MatToggleField,
} from '../fields';

/**
 * Field type definitions with optional config providers
 */
export type FieldTypeDefinitionsWithConfig = FieldTypeDefinition[] & {
  __configProviders?: Provider[];
};

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
 * @returns Array of field type definitions for Material Design components
 */
export function withMaterialFields(config?: MaterialConfig): FieldTypeDefinitionsWithConfig {
  const fields = MATERIAL_FIELD_TYPES as FieldTypeDefinitionsWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: MATERIAL_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Material Design field types
 */
declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormFieldRegistry {
    input: MatInputField;
    select: MatSelectField<any>;
    checkbox: MatCheckboxField;
    button: MatButtonField<any>;
    submit: MatSubmitButtonField;
    next: MatNextButtonField;
    previous: MatPreviousButtonField;
    textarea: MatTextareaField;
    radio: MatRadioField<any>;
    'multi-checkbox': MatMultiCheckboxField<any>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
