// Field components
export {
  PrimeCheckboxFieldComponent,
  PrimeDatepickerFieldComponent,
  PrimeInputFieldComponent,
  PrimeMultiCheckboxFieldComponent,
  PrimeRadioFieldComponent,
  PrimeSelectFieldComponent,
  PrimeSliderFieldComponent,
  submitButton,
  nextPageButton,
  previousPageButton,
  actionButton,
  PrimeButtonFieldComponent,
  submitButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
  addArrayItemButtonFieldMapper,
  removeArrayItemButtonFieldMapper,
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

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withPrimeNGFields } from './providers/primeng-providers';

// Testing utilities
export {
  delay,
  waitForDFInit,
  PrimeNGFormTestUtils,
  PrimeNGFormConfigBuilder,
  FakeTranslationService,
  DEFAULT_TEST_TRANSLATIONS,
  SPANISH_TEST_TRANSLATIONS,
  createTestTranslationService,
} from './testing';
export type { PrimeNGFormTestConfig, PrimeNGFormTestResult } from './testing';
