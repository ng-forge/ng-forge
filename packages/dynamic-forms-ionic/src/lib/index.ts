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
  AddArrayItemButtonField,
  PrependArrayItemButtonField,
  InsertArrayItemButtonField,
  RemoveArrayItemButtonField,
  PopArrayItemButtonField,
  ShiftArrayItemButtonField,
  IonicCheckboxProps,
  IonicCheckboxField,
  IonicCheckboxComponent,
  IonicDatepickerProps,
  IonicDatepickerField,
  IonicDatepickerComponent,
  IonicInputProps,
  IonicInputField,
  IonicInputComponent,
  IonicMultiCheckboxProps,
  IonicMultiCheckboxField,
  IonicMultiCheckboxComponent,
  IonicRadioProps,
  IonicRadioField,
  IonicRadioComponent,
  IonicSelectProps,
  IonicSelectField,
  IonicSelectComponent,
  IonicSliderProps,
  IonicSliderField,
  IonicSliderComponent,
  IonicTextareaProps,
  IonicTextareaField,
  IonicTextareaComponent,
  IonicToggleProps,
  IonicToggleField,
  IonicToggleComponent,
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
export { IonButtonAddonComponent } from './addons/ion-button-addon.component';
export { IonIconAddonComponent } from './addons/ion-icon-addon.component';
export type { IonAddon, IonButtonAddon, IonIconAddon } from './types/addons';
export type { IonInputAddon, IonAddonExtensions } from './fields/input/ionic-input.type';

// Tokens
export { IONIC_INPUT_TYPE_OVERRIDE } from './tokens/input-type-override.token';
