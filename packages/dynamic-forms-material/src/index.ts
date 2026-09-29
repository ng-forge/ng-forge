/* eslint-disable @nx/enforce-module-boundaries -- Package self-imports preserve ng-packagr secondary entry points. */
export { MATERIAL_FIELD_TYPES, MATERIAL_CONFIG, MatField, withMaterialFields, withMaterialAddons, MAT_INPUT_TYPE_OVERRIDE } from './lib';

export type { MatIconAddon, MatButtonAddon, MatAddon, MatInputAddon, MatAddonExtensions } from './lib';

export type {
  MatButtonProps,
  MatButtonField,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatAddArrayItemButtonField,
  MatPrependArrayItemButtonField,
  MatInsertArrayItemButtonField,
  MatRemoveArrayItemButtonField,
  MatPopArrayItemButtonField,
  MatShiftArrayItemButtonField,
  MatCheckboxProps,
  MatCheckboxField,
  MatDatepickerProps,
  MatDatepickerField,
  MatInputProps,
  MatInputField,
  MatMultiCheckboxProps,
  MatMultiCheckboxField,
  MatRadioProps,
  MatRadioField,
  MatSelectProps,
  MatSelectField,
  MatSliderProps,
  MatSliderField,
  MatTextareaProps,
  MatTextareaField,
  MatToggleProps,
  MatToggleField,
  MaterialConfig,
  MatFieldType,
  MatFormProps,
  MatFormConfig,
} from './lib';

// Component classes load from the lazy entries. Re-exporting their values here would bundle them
// eagerly, and compiling them into this entry creates duplicate classes (NG0912, #625).
import type { FormEvent } from '@ng-forge/dynamic-forms';
import type { MatButtonFieldComponent as MatButtonFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/button';
import type { MatCheckboxFieldComponent as MatCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/checkbox';
import type { MatDatepickerFieldComponent as MatDatepickerFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/datepicker';
import type { MatInputFieldComponent as MatInputFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/input';
import type { MatMultiCheckboxFieldComponent as MatMultiCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/multi-checkbox';
import type { MatRadioFieldComponent as MatRadioFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/radio';
import type { MatSelectFieldComponent as MatSelectFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/select';
import type { MatSliderFieldComponent as MatSliderFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/slider';
import type { MatTextareaFieldComponent as MatTextareaFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/textarea';
import type { MatToggleFieldComponent as MatToggleFieldComponentClass } from '@ng-forge/dynamic-forms-material/lazy/toggle';
import type { MatIconAddonComponent as MatIconAddonComponentClass } from '@ng-forge/dynamic-forms-material/lazy/addon-icon';
import type { MatButtonAddonComponent as MatButtonAddonComponentClass } from '@ng-forge/dynamic-forms-material/lazy/addon-button';

/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/button`. Import it from there to use the class as a value. */
export type MatButtonFieldComponent<TEvent extends FormEvent> = MatButtonFieldComponentClass<TEvent>;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/checkbox`. Import it from there to use the class as a value. */
export type MatCheckboxFieldComponent = MatCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/datepicker`. Import it from there to use the class as a value. */
export type MatDatepickerFieldComponent = MatDatepickerFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/input`. Import it from there to use the class as a value. */
export type MatInputFieldComponent = MatInputFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/multi-checkbox`. Import it from there to use the class as a value. */
export type MatMultiCheckboxFieldComponent = MatMultiCheckboxFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/radio`. Import it from there to use the class as a value. */
export type MatRadioFieldComponent = MatRadioFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/select`. Import it from there to use the class as a value. */
export type MatSelectFieldComponent = MatSelectFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/slider`. Import it from there to use the class as a value. */
export type MatSliderFieldComponent = MatSliderFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/textarea`. Import it from there to use the class as a value. */
export type MatTextareaFieldComponent = MatTextareaFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/toggle`. Import it from there to use the class as a value. */
export type MatToggleFieldComponent = MatToggleFieldComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/addon-icon`. Import it from there to use the class as a value. */
export type MatIconAddonComponent = MatIconAddonComponentClass;
/** Class type of the component in `@ng-forge/dynamic-forms-material/lazy/addon-button`. Import it from there to use the class as a value. */
export type MatButtonAddonComponent = MatButtonAddonComponentClass;
