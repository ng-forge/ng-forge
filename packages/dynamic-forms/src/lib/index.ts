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
 */

// ============================================================
// PUBLIC API - For end users
// ============================================================

// Core Component
export { DynamicForm } from './dynamic-form.component';

// External event dispatcher — use this to dispatch events FROM OUTSIDE DynamicForm
// (host components, parent services). For dispatching from inside a field component,
// inject EventBus directly (it is scoped to the form's DI tree).
export { EventDispatcher } from './events/event-dispatcher';

// Provider System
export { provideDynamicForm } from './providers';
export type { ExtractFieldDefs, ExtractFormValue } from './providers';

// Logger Feature
export { withLoggerConfig } from './providers/features/logger/with-logger-config';
export { DynamicFormLogger } from './providers/features/logger/logger.token';
export type { Logger } from './providers/features/logger';
export { ConsoleLogger } from './providers/features/logger/console-logger';
export { NoopLogger } from './providers/features/logger/noop-logger';

// Event Form Value Feature
export { withEventFormValue } from './providers/features/event-form-value';
export { hasFormValue } from './events/interfaces/form-event';

// Value Exclusion Feature
export { withValueExclusionDefaults } from './providers/features/value-exclusion';
export type { ValueExclusionConfig, ResolvedValueExclusionConfig } from './models/value-exclusion-config';

// Configuration Types
export type { CustomFnConfig, FormConfig, FormOptions } from './models';
export type { DynamicText, FieldOption, ValidationError, ValidationMessages } from './models';

// Submission Config
export type { SubmissionConfig, SubmissionActionResult, SubmitButtonOptions, NextButtonOptions } from './models';

// Form State Condition
export type { FormStateCondition } from './models';
export { isFormStateCondition } from './models';

// Logic Resolvers
export {
  resolveSubmitButtonDisabled,
  resolveNextButtonDisabled,
  resolveNonFieldHidden,
  resolveNonFieldDisabled,
  evaluateNonFieldHidden,
  evaluateNonFieldDisabled,
} from './core/logic';
export type { ButtonLogicContext, NonFieldLogicContext, NonFieldLogicType, NonFieldLogicConfig } from './core/logic';

// Abstract Base Field Types (for extension by UI libraries)
export type {
  BaseCheckedField,
  BaseValueField,
  CheckedFieldComponent,
  FieldComponent,
  FieldDef,
  FieldMeta,
  FieldWithValidation,
  ValueFieldComponent,
  ValueType,
} from './definitions';
export { isCheckedField, isValueField } from './definitions';

// Built-in Container Field Types
export type {
  ArrayButtonConfig,
  ArrayField,
  GroupField,
  PageField,
  RowField,
  SimplifiedArrayField,
  TextField,
  TextElementType,
  TextProps,
} from './definitions/default';
export { isRowField, isSimplifiedArrayField } from './definitions/default';

// Validation Config Types
export type {
  AsyncValidatorConfig,
  BaseValidatorConfig,
  BuiltInValidatorConfig,
  CustomValidatorConfig,
  DeclarativeHttpValidatorConfig,
  HttpValidatorConfig,
  ValidatorConfig,
} from './models';

// HTTP Config Types
export type { HttpRequestConfig, HttpValidationResponseMapping } from './models';

// Validator Function Types (for customFnConfig)
export type { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from './core/validation';

// Logic & Expression Types
export type {
  ConditionalExpression,
  HttpCondition,
  AsyncCondition,
  EvaluationContext,
  LogicConfig,
  StateLogicConfig,
  PropertyDerivationLogicConfig,
} from './models';

// Async Custom Function Types
export type { AsyncDerivationFunction, AsyncConditionFunction } from './core/expressions/async-custom-function-types';
export { isPropertyDerivationLogicConfig } from './models';

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
  AppendArrayItemEvent,
  FormClearEvent,
  FormResetEvent,
  InsertArrayItemEvent,
  NextPageEvent,
  PageChangeEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
  SubmitEvent,
} from './events';

// Array event builder (recommended public API)
export { arrayEvent } from './events';
export type { ArrayItemTemplate, ArrayItemDefinitionTemplate } from './events';

export type { FormEvent, FormEventConstructor, TokenContext, ArrayItemContext } from './events';

// Helpers
export { createField, field, formConfig } from './helpers';

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
export { ARRAY_CONTEXT, DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from './models';

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

// EventBus — inject inside field components (scoped to the form's DI tree).
// To dispatch from outside DynamicForm, use EventDispatcher instead.
export { EventBus, resolveTokens } from './events';

// Registry Utilities
export { BUILT_IN_FIELDS } from './providers';

// Object utilities (used by integration mappers)
export { isEqual, omit } from './utils/object-utils';

// Interpolation utility (used by integration error utilities)
export { interpolateParams } from './utils/interpolate-params';

// Meta utilities (used by UI library wrapped-meta directives)
export { applyMetaToElement } from './utils/apply-meta';

// Registry services (used by UI library button mappers)
export { RootFormRegistryService } from './core/registry/root-form-registry.service';

// Field State types (for consumers writing custom expressions)
export type { FieldStateInfo, FieldStateContext, FormFieldStateMap } from './models/expressions/field-state-context';

// Configuration tokens — override defaults via provideDynamicForm() or Angular DI
export { INITIALIZATION_TIMEOUT_MS } from './utils/initialization-tracker/initialization-tracker';
