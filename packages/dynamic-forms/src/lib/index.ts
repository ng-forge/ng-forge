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
export { NoopLogger } from './providers/features/logger/noop-logger';

// Event Form Value Feature
export { withEventFormValue } from './providers/features/event-form-value';
export { hasFormValue } from './events/interfaces/form-event';

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
export { isWrapperTypeDefinition, WRAPPER_REGISTRY } from '@ng-forge/dynamic-forms/internal';

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
  AddonKindDefinition,
  AddonKindSchema,
  AddonShapeValidator,
  CommonAddonActionPreset,
  DynamicFormActionRegistry,
  DynamicFormAddonActionPresetRegistry,
  FieldAddonSupport,
  FieldBoundAddonActionContext,
  OrphanAddonActionContext,
  RegisteredActionRef,
} from '@ng-forge/dynamic-forms/internal';
export { ADDON_KIND_REGISTRY, DF_FIELD_TEMPLATES, isFieldBoundContext } from '@ng-forge/dynamic-forms/internal';
export type { DynamicValue } from '@ng-forge/dynamic-forms/internal';

// Addon Components & Directives
export { DfAddonSlot } from './components/df-addon-slot.component';
export { DfTemplate } from './directives/df-template.directive';
export { TextAddonComponent } from './addons/text-addon.component';
export { TemplateAddonComponent } from './addons/template-addon.component';
export { ComponentAddonComponent } from './addons/component-addon.component';
export { runPresetAction } from './addons/run-preset-action';
export type { PresetCollaborators } from './addons/run-preset-action';

// Addon Registry helpers (for adapter authors)
export { ADDON_KIND_COMPONENT_CACHE, injectAddonKindRegistry } from './utils/inject-addon-kind-registry/inject-addon-kind-registry';
export { injectFieldsSupportingAddons } from './utils/inject-addon-kind-registry/inject-fields-supporting-addons';
export type { FieldAddonSupportEntry } from './utils/inject-addon-kind-registry/inject-fields-supporting-addons';
export { resolveDynamicValue } from '@ng-forge/dynamic-forms/internal';

// Addon Features (for adapter authors and end users)
export { withCustomAddon } from './providers/features/addons/with-custom-addon';
export { provideAddonActions } from './providers/features/addons/provide-addon-actions';
export type { AddonActionsFeature } from './providers/features/addons/provide-addon-actions';
export { ADDON_KIND_DEFINITIONS } from './providers/features/addons/addon-kind-definitions.token';
export { ADDON_ACTION_HANDLERS, ADDON_ACTION_REGISTRY } from './providers/features/addons/addon-action-registry.token';
export type { AddonActionHandler } from './providers/features/addons/addon-action-registry.token';

// Addon Validation
export {
  formatAddonWarning,
  logAddonWarnings,
  sanitizeFormConfig,
  sanitizeFormConfigPure,
  validateFieldAddons,
  walkAndValidateAddons,
} from './utils/validate-form-config/validate-form-config';
export type { AddonWarning, SanitizedFormConfig, SanitizeFormConfigOptions } from './utils/validate-form-config/validate-form-config';

// Configuration Types
export type { CustomFnConfig, FormConfig, FormOptions } from '@ng-forge/dynamic-forms/internal';
export type { DynamicText, FieldOption, ValidationError, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

// Submission Config
export type { SubmissionConfig, SubmissionActionResult, SubmitButtonOptions, NextButtonOptions } from '@ng-forge/dynamic-forms/internal';

// Form State Condition
export type { FormStateCondition } from '@ng-forge/dynamic-forms/internal';
export { isFormStateCondition } from '@ng-forge/dynamic-forms/internal';

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
} from '@ng-forge/dynamic-forms/internal';
export { isCheckedField, isValueField } from '@ng-forge/dynamic-forms/internal';

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
export { isRowField, isSimplifiedArrayField, isContainerTypedField } from '@ng-forge/dynamic-forms/internal';

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
  Prettify,
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
  SubmitEvent,
} from './events';

// Array event builder (recommended public API)
export { arrayEvent } from './events';
export type { ArrayItemTemplate, ArrayItemDefinitionTemplate } from './events';

export type { FormEvent, FormEventConstructor, TokenContext, ArrayItemContext } from './events';

// Helpers
export { createField, field, formConfig } from './helpers';

// Errors
export { DynamicFormError } from '@ng-forge/dynamic-forms/internal';

// ============================================================
// ADAPTER-TIER SOURCE EXPORTS
// Main-local symbols surfaced to adapter authors via
// `@ng-forge/dynamic-forms/integration` (which re-exports them from here).
// ============================================================

export { dynamicTextToObservable } from './utils';
export { DynamicTextPipe } from './pipes';
export { applyValidator, applyValidators } from './core/validation';
export type { HttpResourceRequest } from './core/validation';
export type { WrapperFieldInputs } from './wrappers/wrapper-field-inputs';
export { EventBus, resolveTokens } from './events';
export { BUILT_IN_FIELDS } from './providers';
export { INITIALIZATION_TIMEOUT_MS } from './utils/initialization-tracker/initialization-tracker';
