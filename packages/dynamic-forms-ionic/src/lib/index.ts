// Field fields
export {
  IonicButtonFieldComponent,
  IonicCheckboxFieldComponent,
  IonicDatepickerFieldComponent,
  IonicInputFieldComponent,
  IonicMultiCheckboxFieldComponent,
  IonicRadioFieldComponent,
  IonicSelectFieldComponent,
  IonicSliderFieldComponent,
  IonicTextareaFieldComponent,
  IonicToggleFieldComponent,
} from './fields';
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
} from './fields';

// Configuration
export { IONIC_FIELD_TYPES } from './config/ionic-field-config';
export type { IonicConfig } from './models';
export { IONIC_CONFIG } from './models';

// Types and constants
export { IonicField, type IonicFieldType } from './types/types';
export type { IonicFormProps, IonicFormConfig } from './types/form-config';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withIonicAddons, withIonicFields } from './providers/ionic-providers';

// Addons
export { IonicButtonAddonComponent } from './addons/ion-button-addon.component';
export { IonicIconAddonComponent } from './addons/ion-icon-addon.component';
export { IonicInlineButtonAddonComponent } from './addons/ion-inline-button-addon.component';
export type { IonicAddon, IonicButtonAddon, IonicIconAddon } from './types/addons';
export type { IonicInputAddon, IonicAddonExtensions } from './fields/input/ionic-input.type';

// Tokens
export { IONIC_INPUT_TYPE_OVERRIDE } from './tokens/input-type-override.token';
