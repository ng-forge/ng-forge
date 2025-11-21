/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Bootstrap field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
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
    textarea: BsTextareaField;
    radio: BsRadioField<unknown>;
    'multi-checkbox': BsMultiCheckboxField<unknown>;
    datepicker: BsDatepickerField;
    slider: BsSliderField;
    toggle: BsToggleField;
  }
}
