/* eslint-disable @nx/enforce-module-boundaries -- Package self-imports preserve ng-packagr secondary entry points. */
export { BOOTSTRAP_FIELD_TYPES, BOOTSTRAP_CONFIG, BsField, withBootstrapFields, withBootstrapAddons, BS_INPUT_TYPE_OVERRIDE } from './lib';

export type { BsIconAddon, BsButtonAddon, BsAddon, BsInputAddon, BsAddonExtensions } from './lib';
export type {
  BsButtonProps,
  BsButtonField,
  BsSubmitButtonField,
  BsNextButtonField,
  BsPreviousButtonField,
  BsAddArrayItemButtonField,
  BsPrependArrayItemButtonField,
  BsInsertArrayItemButtonField,
  BsRemoveArrayItemButtonField,
  BsPopArrayItemButtonField,
  BsShiftArrayItemButtonField,
  BsCheckboxProps,
  BsCheckboxField,
  BsDatepickerProps,
  BsDatepickerField,
  BsInputProps,
  BsInputField,
  BsMultiCheckboxProps,
  BsMultiCheckboxField,
  BsRadioProps,
  BsRadioField,
  BsSelectProps,
  BsSelectField,
  BsSliderProps,
  BsSliderField,
  BsTextareaProps,
  BsTextareaField,
  BsToggleProps,
  BsToggleField,
  BootstrapConfig,
  BsFieldType,
  BsFormProps,
  BsFormConfig,
} from './lib';

// Component classes load from the lazy entries. Re-exporting their values here would bundle them
// eagerly, and compiling them into this entry creates duplicate classes (NG0912, #625).
import type { FormEvent } from '@ng-forge/dynamic-forms';
import type { BsButtonFieldComponent as BsButtonFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/button';
import type { BsCheckboxFieldComponent as BsCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/checkbox';
import type { BsDatepickerFieldComponent as BsDatepickerFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/datepicker';
import type { BsInputFieldComponent as BsInputFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/input';
import type { BsMultiCheckboxFieldComponent as BsMultiCheckboxFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/multi-checkbox';
import type { BsRadioFieldComponent as BsRadioFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/radio';
import type { BsSelectFieldComponent as BsSelectFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/select';
import type { BsSliderFieldComponent as BsSliderFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/slider';
import type { BsTextareaFieldComponent as BsTextareaFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/textarea';
import type { BsToggleFieldComponent as BsToggleFieldComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/toggle';
import type { BsIconAddonComponent as BsIconAddonComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/addon-icon';
import type { BsButtonAddonComponent as BsButtonAddonComponentClass } from '@ng-forge/dynamic-forms-bootstrap/lazy/addon-button';

export type BsButtonFieldComponent<TEvent extends FormEvent> = BsButtonFieldComponentClass<TEvent>;
export type BsCheckboxFieldComponent = BsCheckboxFieldComponentClass;
export type BsDatepickerFieldComponent = BsDatepickerFieldComponentClass;
export type BsInputFieldComponent = BsInputFieldComponentClass;
export type BsMultiCheckboxFieldComponent = BsMultiCheckboxFieldComponentClass;
export type BsRadioFieldComponent = BsRadioFieldComponentClass;
export type BsSelectFieldComponent = BsSelectFieldComponentClass;
export type BsSliderFieldComponent = BsSliderFieldComponentClass;
export type BsTextareaFieldComponent = BsTextareaFieldComponentClass;
export type BsToggleFieldComponent = BsToggleFieldComponentClass;
export type BsIconAddonComponent = BsIconAddonComponentClass;
export type BsButtonAddonComponent = BsButtonAddonComponentClass;
