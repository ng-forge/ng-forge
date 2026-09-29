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

/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/button`. Import it from there to use the class as a value. */
export type PrimeButtonFieldComponent<TEvent extends FormEvent> = PrimeButtonFieldComponentClass<TEvent>;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/checkbox`. Import it from there to use the class as a value. */
export type PrimeCheckboxFieldComponent = PrimeCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/datepicker`. Import it from there to use the class as a value. */
export type PrimeDatepickerFieldComponent = PrimeDatepickerFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/input`. Import it from there to use the class as a value. */
export type PrimeInputFieldComponent = PrimeInputFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/multi-checkbox`. Import it from there to use the class as a value. */
export type PrimeMultiCheckboxFieldComponent = PrimeMultiCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/radio`. Import it from there to use the class as a value. */
export type PrimeRadioFieldComponent = PrimeRadioFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/select`. Import it from there to use the class as a value. */
export type PrimeSelectFieldComponent = PrimeSelectFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/slider`. Import it from there to use the class as a value. */
export type PrimeSliderFieldComponent = PrimeSliderFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/textarea`. Import it from there to use the class as a value. */
export type PrimeTextareaFieldComponent = PrimeTextareaFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/toggle`. Import it from there to use the class as a value. */
export type PrimeToggleFieldComponent = PrimeToggleFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/addon-icon`. Import it from there to use the class as a value. */
export type PrimeIconAddonComponent = PrimeIconAddonComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-primeng/lazy/addon-button`. Import it from there to use the class as a value. */
export type PrimeButtonAddonComponent = PrimeButtonAddonComponentClass;
