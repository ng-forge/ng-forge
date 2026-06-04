// Field components
export {
  PrimeCheckboxFieldComponent,
  PrimeDatepickerFieldComponent,
  PrimeInputFieldComponent,
  PrimeMultiCheckboxFieldComponent,
  PrimeRadioFieldComponent,
  PrimeSelectFieldComponent,
  PrimeSliderFieldComponent,
  PrimeButtonFieldComponent,
  PrimeTextareaFieldComponent,
  PrimeToggleFieldComponent,
} from './fields';
export type {
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
  PrimeButtonProps,
  PrimeButtonField,
  PrimeSubmitButtonField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  AddArrayItemButtonField,
  PrependArrayItemButtonField,
  InsertArrayItemButtonField,
  RemoveArrayItemButtonField,
  PopArrayItemButtonField,
  ShiftArrayItemButtonField,
  PrimeTextareaProps,
  PrimeTextareaField,
  PrimeToggleProps,
  PrimeToggleField,
} from './fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from './config/primeng-field-config';
export type { PrimeNGConfig } from './models';
export { PRIMENG_CONFIG } from './models';

// Types and constants
export { PrimeField, type PrimeFieldType } from './types/types';
export type { PrimeFormProps, PrimeFormConfig } from './types/form-config';

// IMPORTANT: side-effect imports — these augment global type registries
// (DynamicFormFieldRegistry, DynamicFormAddonRegistry) so `type: 'input'`,
// `kind: 'prime-icon'`, and similar resolve at the call site. Without these,
// consumer typechecks fall back to the empty base registries.
import './types/registry-augmentation';
import './types/addons';

// Providers
export { withPrimeNGFields, withPrimeNGAddons } from './providers/primeng-providers';

// Addon kinds
export { PrimeIconAddonComponent } from './addons/prime-icon-addon.component';
export { PrimeButtonAddonComponent } from './addons/prime-button-addon.component';
export type { PrimeIconAddon, PrimeButtonAddon, PrimeAddon } from './types/addons';
export type { PrimeInputAddon, PrimeAddonExtensions } from './fields/input/prime-input.type';
export { PRIME_INPUT_TYPE_OVERRIDE } from './tokens/input-type-override.token';
