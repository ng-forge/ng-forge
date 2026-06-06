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
  AddArrayItemButtonField,
  PrependArrayItemButtonField,
  InsertArrayItemButtonField,
  RemoveArrayItemButtonField,
  PopArrayItemButtonField,
  ShiftArrayItemButtonField,
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
export type { BootstrapConfig } from './models';
export { BOOTSTRAP_CONFIG } from './models';

// Types and constants
export { BsField, type BsFieldType } from './types/types';
export type { BsFormProps, BsFormConfig } from './types/form-config';

// IMPORTANT: side-effect imports — these augment global type registries
// (FieldRegistryLeaves, DynamicFormAddonRegistry) so `type: 'input'`,
// `type: 'bs-icon'`, and similar resolve at the call site. Without these,
// consumer typechecks fall back to the empty base registries.
import './types/registry-augmentation';
import './types/addons';

// Providers
export { withBootstrapFields, withBootstrapAddons } from './providers/bootstrap-providers';

// Addon types
export { BsIconAddonComponent } from './addons/bs-icon-addon.component';
export { BsButtonAddonComponent } from './addons/bs-button-addon.component';
export type { BsIconAddon, BsButtonAddon, BsAddon } from './types/addons';
export type { BsInputAddon, BsAddonExtensions } from './fields/input/bs-input.type';
export { BS_INPUT_TYPE_OVERRIDE } from './tokens/input-type-override.token';
