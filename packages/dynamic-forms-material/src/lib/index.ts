// Field components
export {
  MatCheckboxFieldComponent,
  MatDatepickerFieldComponent,
  MatInputFieldComponent,
  MatMultiCheckboxFieldComponent,
  MatRadioFieldComponent,
  MatSelectFieldComponent,
  MatSliderFieldComponent,
  MatButtonFieldComponent,
  MatTextareaFieldComponent,
  MatToggleFieldComponent,
} from './fields';
export type {
  MatCheckboxProps,
  MatCheckboxField,
  MatCheckboxComponent,
  MatDatepickerProps,
  MatDatepickerField,
  MatDatepickerComponent,
  MatInputProps,
  MatInputField,
  MatInputComponent,
  MatMultiCheckboxProps,
  MatMultiCheckboxField,
  MatMultiCheckboxComponent,
  MatRadioProps,
  MatRadioField,
  MatRadioComponent,
  MatSelectProps,
  MatSelectField,
  MatSelectComponent,
  MatSliderProps,
  MatSliderField,
  MatSliderComponent,
  MatButtonProps,
  MatButtonField,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  AddArrayItemButtonField,
  PrependArrayItemButtonField,
  InsertArrayItemButtonField,
  RemoveArrayItemButtonField,
  PopArrayItemButtonField,
  ShiftArrayItemButtonField,
  MatTextareaProps,
  MatTextareaField,
  MatTextareaComponent,
  MatToggleProps,
  MatToggleField,
  MatToggleComponent,
} from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';
export { MATERIAL_CONFIG } from './models';
export type { MaterialConfig } from './models';

// Types and constants
export { MatField, type MatFieldType } from './types/types';
export type { MatFormProps, MatFormConfig } from './types/form-config';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withMaterialFields } from './providers/material-providers';
