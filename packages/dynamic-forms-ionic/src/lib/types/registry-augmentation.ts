/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Ionic field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  AddArrayItemButtonField,
  InsertArrayItemButtonField,
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
  PopArrayItemButtonField,
  PrependArrayItemButtonField,
  RemoveArrayItemButtonField,
  ShiftArrayItemButtonField,
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
    addArrayItem: AddArrayItemButtonField;
    prependArrayItem: PrependArrayItemButtonField;
    insertArrayItem: InsertArrayItemButtonField;
    removeArrayItem: RemoveArrayItemButtonField;
    popArrayItem: PopArrayItemButtonField;
    shiftArrayItem: ShiftArrayItemButtonField;
  }
}
