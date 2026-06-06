/**
 * @ng-forge/dynamic-forms
 *
 * Dynamic forms library for Angular applications.
 *
 * ## Public API (for end users)
 * - DynamicForm component
 * - provideDynamicForm() for configuration
 * - FormConfig and field definition types
 * - Event classes (FormSubmitEvent, PageChangeEvent, etc.)
 *
 * ## Integration API (for UI library authors)
 * Import from '@ng-forge/dynamic-forms/integration' for:
 * - Specific field types (InputField, SelectField, etc.)
 * - Field mappers (valueFieldMapper, checkboxFieldMapper, etc.)
 * - Error utilities (createResolvedErrorsSignal, shouldShowErrors)
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
export { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
export type { Logger } from './providers/features/logger';
export { ConsoleLogger } from './providers/features/logger/console-logger';
export { NoopLogger } from '@ng-forge/dynamic-forms/internal';

// Event Form Value Feature
export { withEventFormValue } from './providers/features/event-form-value';
export { hasFormValue } from '@ng-forge/dynamic-forms/internal';

// Value Exclusion Feature
export { withValueExclusionDefaults } from './providers/features/value-exclusion';
export type { ValueExclusionConfig, ResolvedValueExclusionConfig } from '@ng-forge/dynamic-forms/internal';

// Validation Execution Feature
export { withValidationExecutionDefaults } from './providers/features/validation-execution';
export type { ValidationExecutionConfig, ResolvedValidationExecutionConfig } from '@ng-forge/dynamic-forms/internal';

// Legacy Status Classes Feature (opt-in for `.ng-touched` / `.ng-invalid` CSS classes)
export { withLegacyStatusClasses } from './providers/features/legacy-status-classes';

// Wrapper Types
export type { WrapperTypeDefinition, FieldWrapper } from '@ng-forge/dynamic-forms/internal';
export { isWrapperTypeDefinition } from '@ng-forge/dynamic-forms/internal';

// Wrapper Registration DX
export { wrapperProps } from './wrappers/wrapper-props';
export { createWrappers, isWrappersBundle } from './wrappers/create-wrappers';
export type { WrapperRegistration, WrappersBundle, InferWrapperRegistry } from './wrappers/create-wrappers';

// Addon Types
export type {
  AddonSlot,
  AnyAddon,
  BaseAddon,
  CommonAddonSlot,
  ComponentAddon,
  DynamicFormAddonRegistry,
  DynamicFormAddonSlotRegistry,
  TemplateAddon,
  TextAddon,
} from '@ng-forge/dynamic-forms/internal';
export type {
  AddonActionContext,
  AddonActionPreset,
  AddonTypeDefinition,
  CommonAddonActionPreset,
  DynamicFormActionRegistry,
  DynamicFormAddonActionPresetRegistry,
  FieldBoundAddonActionContext,
  OrphanAddonActionContext,
  RegisteredActionRef,
} from '@ng-forge/dynamic-forms/internal';
export { DF_FIELD_TEMPLATES, isFieldBoundContext } from '@ng-forge/dynamic-forms/internal';
export type { DynamicValue } from '@ng-forge/dynamic-forms/internal';

// Addon Components & Directives (end-user authoring: template projection + built-in renderers)
export { DfTemplate } from './directives/df-template.directive';
export { TextAddonComponent } from './addons/text-addon.component';
export { TemplateAddonComponent } from './addons/template-addon.component';
export { ComponentAddonComponent } from './addons/component-addon.component';
export { resolveDynamicValue } from '@ng-forge/dynamic-forms/internal';

// Addon Features (for adapter authors and end users)
export { withCustomAddon } from './providers/features/addons/with-custom-addon';
export { withAddonActions } from './providers/features/addons/with-addon-actions';
export type { AddonActionsFeature } from './providers/features/addons/with-addon-actions';

// Adapter-author addon surface — DfAddonSlot, ADDON_TYPE_DEFINITIONS, injectAddonTypeRegistry,
// injectFieldsSupportingAddons, runPresetAction, FieldAddonSupport, AddonTypeSchema and
// AddonShapeValidator live in '@ng-forge/dynamic-forms/integration'.

// Addon Validation
export { sanitizeFormConfig } from './utils/validate-form-config/validate-form-config';
export type { AddonWarning, SanitizedFormConfig, SanitizeFormConfigOptions } from './utils/validate-form-config/validate-form-config';

// Configuration Types
export type { CustomFnConfig, FormConfig, FormOptions } from '@ng-forge/dynamic-forms/internal';
export type { DynamicText, FieldOption, ValidationError, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

// Submission Config
export type { SubmissionConfig, SubmissionActionResult, SubmitButtonOptions, NextButtonOptions } from '@ng-forge/dynamic-forms/internal';

// Form State Condition
export type { FormStateCondition } from '@ng-forge/dynamic-forms/internal';
export { isFormStateCondition } from '@ng-forge/dynamic-forms/internal';

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
} from '@ng-forge/dynamic-forms/internal';

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
  ContainerField,
  WrapperConfig,
  CssWrapper,
} from '@ng-forge/dynamic-forms/internal';
export { isRowField, isSimplifiedArrayField } from '@ng-forge/dynamic-forms/internal';

// Validation Config Types
export type {
  AsyncValidatorConfig,
  BaseValidatorConfig,
  BuiltInValidatorConfig,
  CustomValidatorConfig,
  DeclarativeHttpValidatorConfig,
  ValidatorConfig,
} from '@ng-forge/dynamic-forms/internal';

// HTTP Config Types
export type { HttpRequestConfig, HttpValidationResponseMapping } from '@ng-forge/dynamic-forms/internal';

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
} from '@ng-forge/dynamic-forms/internal';

// Custom Function Types (sync — for inline fn alternatives + customFnConfig)
export type { CustomFunction } from '@ng-forge/dynamic-forms/internal';

// Async Custom Function Types
export type { AsyncDerivationFunction, AsyncConditionFunction } from '@ng-forge/dynamic-forms/internal';

// Schema Types
export type { SchemaApplicationConfig, SchemaDefinition } from '@ng-forge/dynamic-forms/internal';

// Registry Types (for module augmentation)
export type {
  AvailableFieldTypes,
  ContainerFieldTypes,
  DynamicFormFieldRegistry,
  ExtractField,
  FieldRegistryContainers,
  FieldRegistryLeaves,
  FieldRegistryWrappers,
  LeafFieldTypes,
  NarrowField,
  NarrowFields,
  RegisteredFieldTypes,
} from '@ng-forge/dynamic-forms/internal';

// Utility Types
export type {
  ArrayAllowedChildren,
  ContainerAllowedChildren,
  FieldPathAccess,
  FormMode,
  FormModeDetectionResult,
  GroupAllowedChildren,
  InferFormValue,
  PageAllowedChildren,
  RowAllowedChildren,
  WithInputSignals,
} from '@ng-forge/dynamic-forms/internal';

// Type Guards
export {
  isArrayField,
  isContainerField,
  isDisplayOnlyField,
  isGroupField,
  isLeafField,
  isPageField,
  isValueBearingField,
} from '@ng-forge/dynamic-forms/internal';

// Events
export {
  AppendArrayItemEvent,
  FormClearEvent,
  FormResetEvent,
  InsertArrayItemEvent,
  MoveArrayItemEvent,
  NextPageEvent,
  PageChangeEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
  FormSubmitEvent,
} from './events';

// Array event builder (recommended public API)
export { arrayEvent } from './events';
export type { ArrayItemTemplate, ArrayItemDefinitionTemplate } from './events';

export type { FormEvent, FormEventConstructor, TokenContext, ArrayItemContext } from './events';

// Helpers
export { createField, formConfig } from './helpers';

// Errors
export { DynamicFormError } from '@ng-forge/dynamic-forms/internal';

// Built-in field registry — wires renderer components, so it stays in this entrypoint.
// Adapter-tier: surfaced to adapter authors via /integration.
export { BUILT_IN_FIELDS } from './providers';
