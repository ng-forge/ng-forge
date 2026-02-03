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
  PrimeCheckboxComponent,
  PrimeDatepickerProps,
  PrimeDatepickerField,
  PrimeDatepickerComponent,
  PrimeInputProps,
  PrimeInputField,
  PrimeInputComponent,
  PrimeMultiCheckboxProps,
  PrimeMultiCheckboxField,
  PrimeMultiCheckboxComponent,
  PrimeRadioProps,
  PrimeRadioField,
  PrimeRadioComponent,
  PrimeSelectProps,
  PrimeSelectField,
  PrimeSelectComponent,
  PrimeSliderProps,
  PrimeSliderField,
  PrimeSliderComponent,
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
  PrimeTextareaComponent,
  PrimeToggleProps,
  PrimeToggleField,
  PrimeToggleComponent,
} from './fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from './config/primeng-field-config';
export type { PrimeNGConfig } from './models';
export { PRIMENG_CONFIG } from './models';

// Types and constants
export { PrimeField, type PrimeFieldType } from './types/types';
export type { PrimeFormProps, PrimeFormConfig } from './types/form-config';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withPrimeNGFields } from './providers/primeng-providers';
