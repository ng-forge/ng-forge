import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import {
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatRadioField,
  MatSelectField,
  MatSliderField,
  MatTextareaField,
  MatToggleField
} from '../fields';
import { MatSubmitField } from '../fields/submit/mat-submit.type';

/**
 * Configure dynamic forms with Material Design field types
 * Provides all Material Design field types for use with provideDynamicForm
 */
export function withMaterialFields(): FieldTypeDefinition[] {
  return MATERIAL_FIELD_TYPES;
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Material Design field types
 */
declare module '@ng-forge/dynamic-form' {
  interface DynamicFormFieldRegistry {
    input: MatInputField;
    select: MatSelectField<any>;
    checkbox: MatCheckboxField;
    submit: MatSubmitField;
    textarea: MatTextareaField;
    radio: MatRadioField<any>;
    'multi-checkbox': MatMultiCheckboxField<any>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
