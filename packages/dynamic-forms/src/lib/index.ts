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
 * ## Integration API (for UI library authors)
 * Import from '@ng-forge/dynamic-forms/integration' for:
 * - Specific field types (InputField, SelectField, etc.)
 * - Field mappers (valueFieldMapper, checkboxFieldMapper, etc.)
 * - Error utilities (createResolvedErrorsSignal, shouldShowErrors)
 *
 * ## Testing API
 * Import from '@ng-forge/dynamic-forms/testing' for:
 * - Test utilities and harnesses
 * - Form config builders for testing
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
export { withLoggerConfig } from './providers/features/logger/with-logger-config';
export { DynamicFormLogger } from './providers/features/logger/logger.token';
export type { Logger } from './providers/features/logger';
export { ConsoleLogger } from './providers/features/logger/console-logger';
export { NoopLogger } from './providers/features/logger/noop-logger';

// Configuration Types
export type { CustomFnConfig, FormConfig, FormOptions } from './models';
export type { DynamicText, FieldOption, ValidationError, ValidationMessages } from './models';

// Submission Config
export type { SubmissionConfig, SubmissionActionResult, SubmitButtonOptions, NextButtonOptions } from './models';

// Form State Condition
export type { FormStateCondition } from './models';
export { isFormStateCondition } from './models';

// Button Logic Resolver
export { resolveSubmitButtonDisabled, resolveNextButtonDisabled } from './core/logic';
export type { ButtonLogicContext } from './core/logic';

// Abstract Base Field Types (for extension by UI libraries)
export type {
  BaseCheckedField,
  BaseValueField,
  CheckedFieldComponent,
  FieldComponent,
  FieldDef,
  FieldWithValidation,
  ValueFieldComponent,
  ValueType,
} from './definitions';
export { isCheckedField, isValueField } from './definitions';

// Built-in Container Field Types
export type { ArrayField, GroupField, PageField, RowField, TextField, TextElementType, TextProps } from './definitions/default';
export { isRowField } from './definitions/default';

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
export { isArrayField, isContainerField, isDisplayOnlyField, isGroupField, isLeafField, isPageField, isValueBearingField } from './models';

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

export type { FormEvent, FormEventConstructor, TokenContext, ArrayItemContext } from './events';

// Errors
export { DynamicFormError } from './errors/dynamic-form-error';

// ============================================================
// INTERNAL EXPORTS - Used by integration entrypoint
// These are stable APIs for UI library authors
// ============================================================

// Base mapper utilities
export { baseFieldMapper, buildBaseInputs } from './mappers';
export { arrayFieldMapper, groupFieldMapper, pageFieldMapper, rowFieldMapper, textFieldMapper } from './mappers';
export type { ArrayContext, FieldSignalContext, MapperFn } from './mappers';

// Field Type Definition - for registering custom field types
export type { FieldTypeDefinition, ValueHandlingMode } from './models';
export { FIELD_REGISTRY } from './models';

// Signal Context - injection tokens for field components
export { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from './models';

// Dynamic Text utilities
export { dynamicTextToObservable } from './utils';
export { DynamicTextPipe } from './pipes';

// Container Components - for building custom containers
export { ArrayFieldComponent, GroupFieldComponent, RowFieldComponent } from './fields';

// Validation utilities
export { applyValidator, applyValidators } from './core/validation';
export type { HttpResourceRequest } from './core/validation';

// FieldTree Utilities
export { getArrayLength } from './core/field-tree-utils';
export type { ArrayFieldTree } from './core/field-tree-utils';

// Event utilities
export { EventBus, resolveTokens } from './events';

// Registry Utilities
export { BUILT_IN_FIELDS } from './providers';

// Object utilities (used by integration mappers)
export { omit } from './utils/object-utils';

// Interpolation utility (used by integration error utilities)
export { interpolateParams } from './utils/interpolate-params';
