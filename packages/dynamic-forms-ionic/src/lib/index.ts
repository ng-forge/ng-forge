// Field types remain available for declarative configuration. Runtime field
// components are implementation details loaded by withIonicFields().
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
export { IONIC_CONFIG, IONIC_INPUT_TYPE_OVERRIDE, type IonicConfig } from '@ng-forge/dynamic-forms-ionic/shared';

// Types and constants
export { IonicField, type IonicFieldType } from './types/types';
export type { IonicFormProps, IonicFormConfig } from './types/form-config';

// IMPORTANT: side-effect import — this augments the global field registry so
// Ionic field types resolve at consumer call sites even with sideEffects false.
import './types/registry-augmentation';

// Providers
export { withIonicAddons, withIonicFields } from './providers/ionic-providers';

// Addon types remain declarative; renderers load from lazy entry points.
export type { IonicAddon, IonicButtonAddon, IonicIconAddon } from '@ng-forge/dynamic-forms-ionic/shared';
export type { IonicInputAddon, IonicAddonExtensions } from './fields/input/ionic-input.type';
