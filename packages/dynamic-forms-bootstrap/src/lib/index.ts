// Field components
export {
  BsButtonFieldComponent,
  BsCheckboxFieldComponent,
  BsDatepickerFieldComponent,
  BsInputFieldComponent,
  BsMultiCheckboxFieldComponent,
  BsRadioFieldComponent,
  BsSelectFieldComponent,
  BsSliderFieldComponent,
  BsTextareaFieldComponent,
  BsToggleFieldComponent,
} from './fields';
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
} from './fields';

// Configuration
export { BOOTSTRAP_FIELD_TYPES } from './config/bootstrap-field-config';
export { BOOTSTRAP_CONFIG, BS_INPUT_TYPE_OVERRIDE, type BootstrapConfig } from '@ng-forge/dynamic-forms-bootstrap/shared';

// Types and constants
export { BsField, type BsFieldType } from './types/types';
export type { BsFormProps, BsFormConfig } from './types/form-config';

// IMPORTANT: side-effect imports — these augment global type registries
// (FieldRegistryLeaves, DynamicFormAddonRegistry) so `type: 'input'`,
// `type: 'bs-icon'`, and similar resolve at the call site. Without these,
// consumer typechecks fall back to the empty base registries.
import './types/registry-augmentation';

// Providers
export { withBootstrapFields, withBootstrapAddons } from './providers/bootstrap-providers';

// Addon types
export { BsIconAddonComponent } from './addons/bs-icon-addon.component';
export { BsButtonAddonComponent } from './addons/bs-button-addon.component';
export type { BsIconAddon, BsButtonAddon, BsAddon } from '@ng-forge/dynamic-forms-bootstrap/shared';
export type { BsInputAddon, BsAddonExtensions } from './fields/input/bs-input.type';
