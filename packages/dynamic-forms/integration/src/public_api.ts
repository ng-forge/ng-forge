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
  InferInputValue,
  NumericInputType,
  StringInputType,
  HtmlInputType,
  InputMeta,
  AutocompleteValue,
  InputMode,
  EnterKeyHint,
  Autocapitalize,
  MultiCheckboxField,
  RadioField,
  SelectField,
  SelectProps,
  SliderField,
  TextareaField,
  TextareaProps,
  TextareaMeta,
  TextareaWrap,
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
  // Button mappers
  buttonFieldMapper,
  // Array button utilities
  resolveArrayButtonContext,
  buildArrayButtonEventContext,
  resolveArrayButtonEventArgs,
  // Array button mappers
  addArrayItemButtonMapper,
  prependArrayItemButtonMapper,
  insertArrayItemButtonMapper,
  removeArrayItemButtonMapper,
  popArrayItemButtonMapper,
  shiftArrayItemButtonMapper,
  // Navigation button mappers
  submitButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
} from './mappers';

export type {
  ValueFieldContext,
  FieldWithOptions,
  ArrayButtonContext,
  ArrayButtonEventContext,
  BaseArrayAddButtonField,
  BaseArrayRemoveButtonField,
  BaseInsertArrayItemButtonField,
  BaseNavigationButtonField,
  EventArg,
} from './mappers';

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
// Meta Tracking Utilities
// =============================================================================

export { setupMetaTracking } from './utils';
export type { MetaTrackingOptions } from './utils';

// =============================================================================
// Accessibility Utilities
// =============================================================================

export { createAriaDescribedBySignal } from './utils';

// =============================================================================
// Field Directive Primitive
// =============================================================================

export { NgForgeField, NG_FORGE_FIELD_INPUTS, injectNgForgeField } from './directives';
export type { TypedNgForgeField } from './directives';
export { NG_FORGE_FIELD_META_TARGET, provideMetaTarget, provideHostMetaTarget, provideSkipMetaTarget } from './directives';
export type { MetaTargetConfig } from './directives';

// =============================================================================
// Non-Field Logic Resolvers (re-exported from @ng-forge/dynamic-forms)
// =============================================================================

export { resolveNonFieldHidden, resolveNonFieldDisabled } from '@ng-forge/dynamic-forms';
export type { NonFieldLogicContext, NonFieldLogicType, NonFieldLogicConfig } from '@ng-forge/dynamic-forms';
