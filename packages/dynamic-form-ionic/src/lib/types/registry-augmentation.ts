/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Ionic field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-form';
import type {
  IonicButtonField,
  IonicCheckboxField,
  IonicDatepickerField,
  IonicInputField,
  IonicMultiCheckboxField,
  IonicRadioField,
  IonicSelectField,
  IonicSliderField,
  IonicTextareaField,
  IonicToggleField,
  IonicSubmitButtonField,
  IonicNextButtonField,
  IonicPreviousButtonField,
} from '../fields';

declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: IonicInputField;
    select: IonicSelectField<unknown>;
    checkbox: IonicCheckboxField;
    button: IonicButtonField<FormEvent>;
    submit: IonicSubmitButtonField;
    next: IonicNextButtonField;
    previous: IonicPreviousButtonField;
    textarea: IonicTextareaField;
    radio: IonicRadioField<unknown>;
    'multi-checkbox': IonicMultiCheckboxField<unknown>;
    datepicker: IonicDatepickerField;
    slider: IonicSliderField;
    toggle: IonicToggleField;
  }
}
