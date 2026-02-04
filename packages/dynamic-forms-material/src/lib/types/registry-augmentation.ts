/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Material Design field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  AddArrayItemButtonField,
  InsertArrayItemButtonField,
  MatButtonField,
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatRadioField,
  PopArrayItemButtonField,
  PrependArrayItemButtonField,
  RemoveArrayItemButtonField,
  MatSelectField,
  ShiftArrayItemButtonField,
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
    addArrayItem: AddArrayItemButtonField;
    prependArrayItem: PrependArrayItemButtonField;
    insertArrayItem: InsertArrayItemButtonField;
    removeArrayItem: RemoveArrayItemButtonField;
    popArrayItem: PopArrayItemButtonField;
    shiftArrayItem: ShiftArrayItemButtonField;
    textarea: MatTextareaField;
    radio: MatRadioField<unknown>;
    'multi-checkbox': MatMultiCheckboxField<unknown>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
