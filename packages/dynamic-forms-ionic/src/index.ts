/* eslint-disable @nx/enforce-module-boundaries -- Package self-imports preserve ng-packagr secondary entry points. */
export { IONIC_FIELD_TYPES, IONIC_CONFIG, IonicField, withIonicFields, withIonicAddons, IONIC_INPUT_TYPE_OVERRIDE } from './lib';
export type {
  IonicButtonProps,
  IonicButtonField,
  IonicSubmitButtonField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  IonicAddArrayItemButtonField,
  IonicPrependArrayItemButtonField,
  IonicInsertArrayItemButtonField,
  IonicRemoveArrayItemButtonField,
  IonicPopArrayItemButtonField,
  IonicShiftArrayItemButtonField,
  IonicCheckboxProps,
  IonicCheckboxField,
  IonicDatepickerProps,
  IonicDatepickerField,
  IonicInputProps,
  IonicInputField,
  IonicMultiCheckboxProps,
  IonicMultiCheckboxField,
  IonicRadioProps,
  IonicRadioField,
  IonicSelectProps,
  IonicSelectField,
  IonicSliderProps,
  IonicSliderField,
  IonicTextareaProps,
  IonicTextareaField,
  IonicToggleProps,
  IonicToggleField,
  IonicConfig,
  IonicFieldType,
  IonicFormProps,
  IonicFormConfig,
  IonicAddon,
  IonicButtonAddon,
  IonicIconAddon,
  IonicInputAddon,
  IonicAddonExtensions,
} from './lib';

// Component classes load from the lazy entries. Re-exporting their values here would bundle them
// eagerly, and compiling them into this entry creates duplicate classes (NG0912, #625).
import type { FormEvent } from '@ng-forge/dynamic-forms';
import type { IonicButtonFieldComponent as IonicButtonFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/button';
import type { IonicCheckboxFieldComponent as IonicCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/checkbox';
import type { IonicDatepickerFieldComponent as IonicDatepickerFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/datepicker';
import type { IonicInputFieldComponent as IonicInputFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/input';
import type { IonicMultiCheckboxFieldComponent as IonicMultiCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/multi-checkbox';
import type { IonicRadioFieldComponent as IonicRadioFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/radio';
import type { IonicSelectFieldComponent as IonicSelectFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/select';
import type { IonicSliderFieldComponent as IonicSliderFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/slider';
import type { IonicTextareaFieldComponent as IonicTextareaFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/textarea';
import type { IonicToggleFieldComponent as IonicToggleFieldComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/toggle';
import type { IonicIconAddonComponent as IonicIconAddonComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/addon-icon';
import type { IonicButtonAddonComponent as IonicButtonAddonComponentClass } from '@ng-forge/dynamic-forms-ionic/lazy/addon-button';

/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/button`. Import it from there to use the class as a value. */
export type IonicButtonFieldComponent<TEvent extends FormEvent> = IonicButtonFieldComponentClass<TEvent>;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/checkbox`. Import it from there to use the class as a value. */
export type IonicCheckboxFieldComponent = IonicCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/datepicker`. Import it from there to use the class as a value. */
export type IonicDatepickerFieldComponent = IonicDatepickerFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/input`. Import it from there to use the class as a value. */
export type IonicInputFieldComponent = IonicInputFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/multi-checkbox`. Import it from there to use the class as a value. */
export type IonicMultiCheckboxFieldComponent = IonicMultiCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/radio`. Import it from there to use the class as a value. */
export type IonicRadioFieldComponent = IonicRadioFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/select`. Import it from there to use the class as a value. */
export type IonicSelectFieldComponent = IonicSelectFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/slider`. Import it from there to use the class as a value. */
export type IonicSliderFieldComponent = IonicSliderFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/textarea`. Import it from there to use the class as a value. */
export type IonicTextareaFieldComponent = IonicTextareaFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/toggle`. Import it from there to use the class as a value. */
export type IonicToggleFieldComponent = IonicToggleFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/addon-icon`. Import it from there to use the class as a value. */
export type IonicIconAddonComponent = IonicIconAddonComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-ionic/lazy/addon-button`. Import it from there to use the class as a value. */
export type IonicButtonAddonComponent = IonicButtonAddonComponentClass;
