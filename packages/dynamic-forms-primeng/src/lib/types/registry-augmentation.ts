/** Module augmentation for @ng-forge/dynamic-form to add PrimeNG field types to the global registry. */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  PrimeAddArrayItemButtonField,
  PrimeInsertArrayItemButtonField,
  PrimePopArrayItemButtonField,
  PrimePrependArrayItemButtonField,
  PrimeButtonField,
  PrimeCheckboxField,
  PrimeDatepickerField,
  PrimeInputField,
  PrimeMultiCheckboxField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  PrimeRadioField,
  PrimeSelectField,
  PrimeSliderField,
  PrimeSubmitButtonField,
  PrimeTextareaField,
  PrimeToggleField,
  PrimeRemoveArrayItemButtonField,
  PrimeShiftArrayItemButtonField,
} from '../fields';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: PrimeInputField;
    select: PrimeSelectField<unknown>;
    checkbox: PrimeCheckboxField;
    button: PrimeButtonField<FormEvent>;
    submit: PrimeSubmitButtonField;
    next: PrimeNextButtonField;
    previous: PrimePreviousButtonField;
    addArrayItem: PrimeAddArrayItemButtonField;
    'add-array-item': PrimeAddArrayItemButtonField;
    prependArrayItem: PrimePrependArrayItemButtonField;
    'prepend-array-item': PrimePrependArrayItemButtonField;
    insertArrayItem: PrimeInsertArrayItemButtonField;
    'insert-array-item': PrimeInsertArrayItemButtonField;
    removeArrayItem: PrimeRemoveArrayItemButtonField;
    'remove-array-item': PrimeRemoveArrayItemButtonField;
    popArrayItem: PrimePopArrayItemButtonField;
    'pop-array-item': PrimePopArrayItemButtonField;
    shiftArrayItem: PrimeShiftArrayItemButtonField;
    'shift-array-item': PrimeShiftArrayItemButtonField;
    textarea: PrimeTextareaField;
    radio: PrimeRadioField<unknown>;
    'multi-checkbox': PrimeMultiCheckboxField<unknown>;
    datepicker: PrimeDatepickerField;
    slider: PrimeSliderField;
    toggle: PrimeToggleField;
  }
}
