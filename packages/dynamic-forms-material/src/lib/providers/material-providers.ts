import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
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
 * Configure dynamic forms with Material Design field types.
 * Provides all Material Design field types for use with provideDynamicForm.
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
 * @returns Array of field type definitions for Material Design components
 */
export function withMaterialFields(): FieldTypeDefinition[] {
  return MATERIAL_FIELD_TYPES;
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
