/* eslint-disable @nx/enforce-module-boundaries -- Package self-imports preserve ng-packagr secondary entry points. */
export { PRIMENG_FIELD_TYPES, PRIMENG_CONFIG, PrimeField, withPrimeNGFields, withPrimeNGAddons, PRIME_INPUT_TYPE_OVERRIDE } from './lib';

export type { PrimeIconAddon, PrimeButtonAddon, PrimeAddon, PrimeInputAddon, PrimeAddonExtensions } from './lib';

export type {
  PrimeButtonProps,
  PrimeButtonField,
  PrimeSubmitButtonField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  PrimeAddArrayItemButtonField,
  PrimePrependArrayItemButtonField,
  PrimeInsertArrayItemButtonField,
  PrimeRemoveArrayItemButtonField,
  PrimePopArrayItemButtonField,
  PrimeShiftArrayItemButtonField,
  PrimeCheckboxProps,
  PrimeCheckboxField,
  PrimeDatepickerProps,
  PrimeDatepickerField,
  PrimeInputProps,
  PrimeInputField,
  PrimeMultiCheckboxProps,
  PrimeMultiCheckboxField,
  PrimeRadioProps,
  PrimeRadioField,
  PrimeSelectProps,
  PrimeSelectField,
  PrimeSliderProps,
  PrimeSliderField,
  PrimeTextareaProps,
  PrimeTextareaField,
  PrimeToggleProps,
  PrimeToggleField,
  PrimeNGConfig,
  PrimeFieldType,
  PrimeFormProps,
  PrimeFormConfig,
} from './lib';

// Component classes load from the lazy entries. Re-exporting their values here would bundle them
// eagerly, and compiling them into this entry creates duplicate classes (NG0912, #625).
import type { FormEvent } from '@ng-forge/dynamic-forms';
import type { PrimeButtonFieldComponent as PrimeButtonFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/button';
import type { PrimeCheckboxFieldComponent as PrimeCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/checkbox';
import type { PrimeDatepickerFieldComponent as PrimeDatepickerFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/datepicker';
import type { PrimeInputFieldComponent as PrimeInputFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/input';
import type { PrimeMultiCheckboxFieldComponent as PrimeMultiCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/multi-checkbox';
import type { PrimeRadioFieldComponent as PrimeRadioFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/radio';
import type { PrimeSelectFieldComponent as PrimeSelectFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/select';
import type { PrimeSliderFieldComponent as PrimeSliderFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/slider';
import type { PrimeTextareaFieldComponent as PrimeTextareaFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/textarea';
import type { PrimeToggleFieldComponent as PrimeToggleFieldComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/toggle';
import type { PrimeIconAddonComponent as PrimeIconAddonComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/addon-icon';
import type { PrimeButtonAddonComponent as PrimeButtonAddonComponentClass } from '@ng-forge/dynamic-forms-primeng/lazy/addon-button';

export type PrimeButtonFieldComponent<TEvent extends FormEvent> = PrimeButtonFieldComponentClass<TEvent>;
export type PrimeCheckboxFieldComponent = PrimeCheckboxFieldComponentClass;
export type PrimeDatepickerFieldComponent = PrimeDatepickerFieldComponentClass;
export type PrimeInputFieldComponent = PrimeInputFieldComponentClass;
export type PrimeMultiCheckboxFieldComponent = PrimeMultiCheckboxFieldComponentClass;
export type PrimeRadioFieldComponent = PrimeRadioFieldComponentClass;
export type PrimeSelectFieldComponent = PrimeSelectFieldComponentClass;
export type PrimeSliderFieldComponent = PrimeSliderFieldComponentClass;
export type PrimeTextareaFieldComponent = PrimeTextareaFieldComponentClass;
export type PrimeToggleFieldComponent = PrimeToggleFieldComponentClass;
export type PrimeIconAddonComponent = PrimeIconAddonComponentClass;
export type PrimeButtonAddonComponent = PrimeButtonAddonComponentClass;
