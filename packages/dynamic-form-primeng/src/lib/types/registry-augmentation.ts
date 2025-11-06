/**
 * Module augmentation for @ng-forge/dynamic-form to add PrimeNG field types to the global registry.
 *
 * This file augments the FieldRegistryLeaves interface to include PrimeNG-specific field types.
 * Import this file in your main entry point to get global type safety for PrimeNG fields.
 *
 * For applications that need to use multiple field libraries without conflicts,
 * use the `/no-augmentation` entry point instead.
 */

import type { FormEvent } from '@ng-forge/dynamic-form';
import type {
  PrimeInputField,
  PrimeSelectField,
  PrimeCheckboxField,
  PrimeButtonField,
  PrimeSubmitButtonField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  PrimeTextareaField,
  PrimeRadioField,
  PrimeMultiCheckboxField,
  PrimeDatepickerField,
  PrimeSliderField,
  PrimeToggleField,
} from './field-types';

declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: PrimeInputField;
    select: PrimeSelectField<unknown>;
    checkbox: PrimeCheckboxField;
    button: PrimeButtonField<FormEvent>;
    submit: PrimeSubmitButtonField;
    next: PrimeNextButtonField;
    previous: PrimePreviousButtonField;
    textarea: PrimeTextareaField;
    radio: PrimeRadioField<unknown>;
    'multi-checkbox': PrimeMultiCheckboxField<unknown>;
    datepicker: PrimeDatepickerField;
    slider: PrimeSliderField;
    toggle: PrimeToggleField;
  }
}
