/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Bootstrap field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  BsAddArrayItemButtonField,
  BsButtonField,
  BsCheckboxField,
  BsDatepickerField,
  BsInputField,
  BsMultiCheckboxField,
  BsNextButtonField,
  BsPreviousButtonField,
  BsRadioField,
  BsSelectField,
  BsSliderField,
  BsSubmitButtonField,
  BsTextareaField,
  BsToggleField,
  BsInsertArrayItemButtonField,
  BsPopArrayItemButtonField,
  BsPrependArrayItemButtonField,
  BsRemoveArrayItemButtonField,
  BsShiftArrayItemButtonField,
} from '../fields';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: BsInputField;
    select: BsSelectField<unknown>;
    checkbox: BsCheckboxField;
    button: BsButtonField<FormEvent>;
    submit: BsSubmitButtonField;
    next: BsNextButtonField;
    previous: BsPreviousButtonField;
    addArrayItem: BsAddArrayItemButtonField;
    'add-array-item': BsAddArrayItemButtonField;
    prependArrayItem: BsPrependArrayItemButtonField;
    'prepend-array-item': BsPrependArrayItemButtonField;
    insertArrayItem: BsInsertArrayItemButtonField;
    'insert-array-item': BsInsertArrayItemButtonField;
    removeArrayItem: BsRemoveArrayItemButtonField;
    'remove-array-item': BsRemoveArrayItemButtonField;
    popArrayItem: BsPopArrayItemButtonField;
    'pop-array-item': BsPopArrayItemButtonField;
    shiftArrayItem: BsShiftArrayItemButtonField;
    'shift-array-item': BsShiftArrayItemButtonField;
    textarea: BsTextareaField;
    radio: BsRadioField<unknown>;
    'multi-checkbox': BsMultiCheckboxField<unknown>;
    datepicker: BsDatepickerField;
    slider: BsSliderField;
    toggle: BsToggleField;
  }
}
