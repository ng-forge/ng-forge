/**
 * Module augmentation for @ng-forge/dynamic-form
 * This file augments the FieldRegistryLeaves interface to include
 * all Material Design field types provided by this library.
 */

import type { FormEvent } from '@ng-forge/dynamic-form';
import type {
  MatButtonField,
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatRadioField,
  MatSelectField,
  MatSliderField,
  MatTextareaField,
  MatToggleField,
} from '../fields';

declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: MatInputField;
    select: MatSelectField<unknown>;
    checkbox: MatCheckboxField;
    button: MatButtonField<FormEvent>;
    textarea: MatTextareaField;
    radio: MatRadioField<unknown>;
    'multi-checkbox': MatMultiCheckboxField<unknown>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
