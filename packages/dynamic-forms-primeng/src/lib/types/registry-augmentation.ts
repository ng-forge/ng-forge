/**
 * Module augmentation for @ng-forge/dynamic-form to add PrimeNG field types to the global registry.
 *
 * This file augments the FieldRegistryLeaves interface to include PrimeNG-specific field types.
 * Import this file in your main entry point to get global type safety for PrimeNG fields.
 */

import type { FormEvent } from '@ng-forge/dynamic-forms';
import type {
  AddArrayItemButtonField,
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
  RemoveArrayItemButtonField,
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
    addArrayItem: AddArrayItemButtonField;
    removeArrayItem: RemoveArrayItemButtonField;
    textarea: PrimeTextareaField;
    radio: PrimeRadioField<unknown>;
    'multi-checkbox': PrimeMultiCheckboxField<unknown>;
    datepicker: PrimeDatepickerField;
    slider: PrimeSliderField;
    toggle: PrimeToggleField;
  }
}
