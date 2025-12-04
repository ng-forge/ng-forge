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
  RemoveArrayItemButtonField,
  BsCheckboxProps,
  BsCheckboxField,
  BsCheckboxComponent,
  BsDatepickerProps,
  BsDatepickerField,
  BsDatepickerComponent,
  BsInputProps,
  BsInputField,
  BsInputComponent,
  BsMultiCheckboxProps,
  BsMultiCheckboxField,
  BsMultiCheckboxComponent,
  BsRadioProps,
  BsRadioField,
  BsRadioComponent,
  BsSelectProps,
  BsSelectField,
  BsSelectComponent,
  BsSliderProps,
  BsSliderField,
  BsSliderComponent,
  BsTextareaProps,
  BsTextareaField,
  BsTextareaComponent,
  BsToggleProps,
  BsToggleField,
  BsToggleComponent,
} from './fields';

// Configuration
export { BOOTSTRAP_FIELD_TYPES } from './config/bootstrap-field-config';
export type { BootstrapConfig } from './models';
export { BOOTSTRAP_CONFIG } from './models';

// Types and constants
export { BsField, type BsFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withBootstrapFields } from './providers/bootstrap-providers';
