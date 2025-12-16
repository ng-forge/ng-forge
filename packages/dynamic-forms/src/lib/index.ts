/**
 * @ng-forge/dynamic-forms
 *
 * Dynamic forms library for Angular applications.
 *
 * ## Public API (for end users)
 * - DynamicForm component
 * - provideDynamicForm() for configuration
 * - FormConfig and field definition types
 * - Event classes (SubmitEvent, PageChangeEvent, etc.)
 *
 * ## Integration API (for UI library authors building Material, Bootstrap, etc.)
 * - Mappers (baseFieldMapper, valueFieldMapper, etc.)
 * - FieldTypeDefinition for registering field types
 * - DynamicTextPipe, shouldShowErrors, createResolvedErrorsSignal
 * - EventBus for custom event handling
 */

// ============================================================
// PUBLIC API - For end users
// ============================================================

// Core Component
export { DynamicForm } from './dynamic-form.component';

// Provider System
export { provideDynamicForm } from './providers';
export type { ExtractFieldDefs, ExtractFormValue } from './providers';

// Logger Feature
export { withLogger } from './providers/features/logger/with-logger';
export { LogLevel } from './providers/features/logger/log-level';
export type { DynamicFormLogger } from './providers/features/logger/logger.interface';
export type { LoggerFeatureOptions } from './providers/features/logger/with-logger';
export { DYNAMIC_FORM_LOGGER } from './providers/features/logger/logger.token';

// Configuration Types
export type { CustomFnConfig, FormConfig, FormOptions } from './models';

export type { DynamicText, FieldOption, ValidationError, ValidationMessages } from './models';

// Submission Config
export type { SubmissionConfig, SubmissionActionResult, SubmitButtonOptions, NextButtonOptions } from './models';

// Form State Condition
export type { FormStateCondition } from './models';
export { isFormStateCondition } from './models';

// Button Logic Resolver (for UI library authors)
export { resolveSubmitButtonDisabled, resolveNextButtonDisabled } from './core/logic';
export type { ButtonLogicContext } from './core/logic';

// Field Definition Types
export type {
  ArrayField,
  BaseCheckedField,
  BaseValueField,
  ButtonField,
  CheckboxField,
  CheckedFieldComponent,
  DatepickerField,
  DatepickerProps,
  FieldComponent,
  FieldDef,
  FieldWithValidation,
  GroupField,
  InputField,
  InputProps,
  MultiCheckboxField,
  PageField,
  RadioField,
  RowField,
  SelectField,
  SelectProps,
  SliderField,
  TextareaField,
  TextareaProps,
  TextElementType,
  TextField,
  TextProps,
  ToggleField,
  ValueFieldComponent,
  ValueType,
} from './definitions';

export { isCheckedField, isValueField } from './definitions';

// Validation Config Types
export type {
  AsyncValidatorConfig,
  BaseValidatorConfig,
  BuiltInValidatorConfig,
  CustomValidatorConfig,
  HttpValidatorConfig,
  ValidatorConfig,
} from './models';

// Validator Function Types (for customFnConfig)
export type { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from './core/validation';

// Logic & Expression Types
export type { ConditionalExpression, EvaluationContext, LogicConfig } from './models';

// Schema Types
export type { SchemaApplicationConfig, SchemaDefinition } from './models';

// Registry Types (for module augmentation)
export type {
  AvailableFieldTypes,
  ContainerFieldTypes,
  DynamicFormFieldRegistry,
  ExtractField,
  FieldRegistryContainers,
  FieldRegistryLeaves,
  LeafFieldTypes,
  NarrowField,
  NarrowFields,
  RegisteredFieldTypes,
} from './models';

// Utility Types
export type {
  ArrayAllowedChildren,
  FieldPathAccess,
  FormMode,
  FormModeDetectionResult,
  GroupAllowedChildren,
  InferFormValue,
  PageAllowedChildren,
  Prettify,
  RowAllowedChildren,
  WithInputSignals,
} from './models';

// Type Guards
export {
  isArrayField,
  isContainerField,
  isDisplayOnlyField,
  isGroupField,
  isLeafField,
  isPageField,
  isRowField,
  isValueBearingField,
} from './models';

// Events
export {
  AddArrayItemEvent,
  FormClearEvent,
  FormResetEvent,
  NextPageEvent,
  PageChangeEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  SubmitEvent,
} from './events';

export type { FormEvent } from './events';

// ============================================================
// INTEGRATION API - For UI library authors
// (Material, Bootstrap, PrimeNG, Ionic, etc.)
// ============================================================

// Mappers - for creating FieldTypeDefinition
export {
  arrayFieldMapper,
  baseFieldMapper,
  buildBaseInputs,
  checkboxFieldMapper,
  datepickerFieldMapper,
  groupFieldMapper,
  pageFieldMapper,
  optionsFieldMapper,
  rowFieldMapper,
  valueFieldMapper,
} from './mappers';

export type { ArrayContext, FieldSignalContext, MapperFn } from './mappers';

// Field Type Definition - for registering custom field types
export type { FieldTypeDefinition, ValueHandlingMode } from './models';
export { FIELD_REGISTRY, getFieldValueHandling } from './models';

// Signal Context - injection tokens for field components
export { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from './models';

// Error Display Utilities - for field components
export { createResolvedErrorsSignal, shouldShowErrors } from './utils';
export type { ResolvedError } from './utils';

// Dynamic Text - for translatable labels
export { dynamicTextToObservable } from './utils';
export { DynamicTextPipe } from './pipes';

// Container Components - for building custom containers
export { ArrayFieldComponent, GroupFieldComponent, RowFieldComponent } from './fields';

// Validation - for applying validators in custom fields
export { applyValidator, applyValidators } from './core/validation';
export type { HttpResourceRequest } from './core/validation';

// Event Utilities - for custom event handling
export { EventBus } from './events';
export { resolveTokens } from './events';
export type { ArrayItemContext, FormEventConstructor, TokenContext } from './events';

// Registry Utilities
export { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
export { BUILT_IN_FIELDS } from './providers';

// Event Args Type
export type { EventArgs } from './definitions';

// Form Internals - for advanced container field implementations
export { getChildFieldTree, getChildrenMap, getFieldProxy, hasFormStructure } from './utils/form-internals';
export type { FormInternals } from './utils/form-internals';
