/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Ionic field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  IonicAddArrayItemButtonField,
  IonicInsertArrayItemButtonField,
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
  IonicPopArrayItemButtonField,
  IonicPrependArrayItemButtonField,
  IonicRemoveArrayItemButtonField,
  IonicShiftArrayItemButtonField,
} from '../fields';

declare module '@ng-forge/dynamic-forms' {
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
    addArrayItem: IonicAddArrayItemButtonField;
    'add-array-item': IonicAddArrayItemButtonField;
    prependArrayItem: IonicPrependArrayItemButtonField;
    'prepend-array-item': IonicPrependArrayItemButtonField;
    insertArrayItem: IonicInsertArrayItemButtonField;
    'insert-array-item': IonicInsertArrayItemButtonField;
    removeArrayItem: IonicRemoveArrayItemButtonField;
    'remove-array-item': IonicRemoveArrayItemButtonField;
    popArrayItem: IonicPopArrayItemButtonField;
    'pop-array-item': IonicPopArrayItemButtonField;
    shiftArrayItem: IonicShiftArrayItemButtonField;
    'shift-array-item': IonicShiftArrayItemButtonField;
  }
}
