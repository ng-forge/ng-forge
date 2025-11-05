import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import {
  IonicButtonField,
  IonicCheckboxField,
  IonicDatepickerField,
  IonicInputField,
  IonicMultiCheckboxField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  IonicRadioField,
  IonicSelectField,
  IonicSliderField,
  IonicSubmitButtonField,
  IonicTextareaField,
  IonicToggleField,
} from '../fields';

/**
 * Configure dynamic forms with Ionic field types
 * Provides all Ionic field types for use with provideDynamicForm
 */
export function withIonicFields(): FieldTypeDefinition[] {
  return IONIC_FIELD_TYPES;
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Ionic field types
 */
declare module '@ng-forge/dynamic-form' {
  interface DynamicFormFieldRegistry {
    input: IonicInputField;
    select: IonicSelectField<any>;
    checkbox: IonicCheckboxField;
    button: IonicButtonField<any>;
    submit: IonicSubmitButtonField;
    next: IonicNextButtonField;
    previous: IonicPreviousButtonField;
    textarea: IonicTextareaField;
    radio: IonicRadioField<any>;
    'multi-checkbox': IonicMultiCheckboxField<any>;
    datepicker: IonicDatepickerField;
    slider: IonicSliderField;
    toggle: IonicToggleField;
  }
}
