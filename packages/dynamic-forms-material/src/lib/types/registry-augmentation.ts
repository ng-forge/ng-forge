/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Material Design field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  MatAddArrayItemButtonField,
  MatInsertArrayItemButtonField,
  MatButtonField,
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatRadioField,
  MatPopArrayItemButtonField,
  MatPrependArrayItemButtonField,
  MatRemoveArrayItemButtonField,
  MatSelectField,
  MatShiftArrayItemButtonField,
  MatSliderField,
  MatSubmitButtonField,
  MatTextareaField,
  MatToggleField,
} from '../fields';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: MatInputField;
    select: MatSelectField<unknown>;
    checkbox: MatCheckboxField;
    button: MatButtonField<FormEvent>;
    submit: MatSubmitButtonField;
    next: MatNextButtonField;
    previous: MatPreviousButtonField;
    addArrayItem: MatAddArrayItemButtonField;
    'add-array-item': MatAddArrayItemButtonField;
    prependArrayItem: MatPrependArrayItemButtonField;
    'prepend-array-item': MatPrependArrayItemButtonField;
    insertArrayItem: MatInsertArrayItemButtonField;
    'insert-array-item': MatInsertArrayItemButtonField;
    removeArrayItem: MatRemoveArrayItemButtonField;
    'remove-array-item': MatRemoveArrayItemButtonField;
    popArrayItem: MatPopArrayItemButtonField;
    'pop-array-item': MatPopArrayItemButtonField;
    shiftArrayItem: MatShiftArrayItemButtonField;
    'shift-array-item': MatShiftArrayItemButtonField;
    textarea: MatTextareaField;
    radio: MatRadioField<unknown>;
    'multi-checkbox': MatMultiCheckboxField<unknown>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
