/**
 * @ng-forge/dynamic-forms/integration
 *
 * Integration API for UI library authors building field implementations
 * (Material, Bootstrap, PrimeNG, Ionic, etc.)
 *
 * This entrypoint provides:
 * - Specific field type definitions (InputField, SelectField, etc.)
 * - Field mappers for creating FieldTypeDefinition
 * - Error display utilities for field components
 */

// =============================================================================
// Field Type Definitions
// =============================================================================

export type {
  ButtonField,
  EventArgs,
  CheckboxField,
  DatepickerField,
  DatepickerProps,
  InputField,
  InputProps,
  InputType,
  InputTypeToValueType,
  StringInputType,
  MultiCheckboxField,
  RadioField,
  SelectField,
  SelectProps,
  SliderField,
  TextareaField,
  TextareaProps,
  ToggleField,
} from './definitions';

// =============================================================================
// Field Mappers
// =============================================================================

export {
  valueFieldMapper,
  buildValueFieldInputs,
  resolveValueFieldContext,
  checkboxFieldMapper,
  datepickerFieldMapper,
  optionsFieldMapper,
} from './mappers';

export type { ValueFieldContext, FieldWithOptions } from './mappers';

// =============================================================================
// Error Display Utilities
// =============================================================================

export { createResolvedErrorsSignal, shouldShowErrors } from './utils';
export type { ResolvedError } from './utils';

// =============================================================================
// Value Comparison Utilities
// =============================================================================

export { isEqual } from './utils';

// =============================================================================
// Pipes
// =============================================================================

export { ValueInArrayPipe } from './pipes';
