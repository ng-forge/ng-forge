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
export { withIonicFields } from './providers/ionic-providers';
