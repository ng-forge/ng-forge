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
// Field Directive Primitives
// =============================================================================

export { NgForgeFieldShell, NG_FORGE_FIELD_SHELL_INPUTS } from './directives';
export { NgForgeField, NG_FORGE_VALUE_FIELD_INPUTS, injectNgForgeField } from './directives';
export type { TypedNgForgeField } from './directives';
export { NgForgeAction, NG_FORGE_ACTION_INPUTS, injectNgForgeAction } from './directives';
export { NgForgeAddons, NgForgeAddonsBase, NG_FORGE_ADDONS_INPUTS, injectNgForgeAddons } from './directives';
export type { TypedNgForgeAddons } from './directives';
export { NgForgeAddonAction, NgForgeAddonActionBase, NG_FORGE_ADDON_ACTION_INPUTS, injectNgForgeAddonAction } from './directives';
export type { TypedNgForgeAddonAction } from './directives';
export { ADDON_PRESET_HANDLER } from './directives';
export type { AddonPresetHandler } from './directives';
export { NgForgeControl, NgForgeHostControl } from './directives';
export { NgForgeFieldHost, NgForgeActionHost } from './directives';

// =============================================================================
// Non-Field Logic Resolvers (re-exported from @ng-forge/dynamic-forms)
// =============================================================================

export { resolveNonFieldHidden, resolveNonFieldDisabled } from '@ng-forge/dynamic-forms/internal';
export type { NonFieldLogicContext, NonFieldLogicType, NonFieldLogicConfig } from '@ng-forge/dynamic-forms/internal';

// =============================================================================
// Wrapper Authoring (re-exported from @ng-forge/dynamic-forms)
// =============================================================================

export { createWrappers, isWrappersBundle, wrapperProps } from '@ng-forge/dynamic-forms';
export type { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
export type {
  FieldWrapper,
  WrapperRegistration,
  WrappersBundle,
  InferWrapperRegistry,
  WrapperTypeDefinition,
} from '@ng-forge/dynamic-forms';

// =============================================================================
// Testing Harness
// =============================================================================

export { createNgForgeFieldFixture, createNgForgeActionFixture, provideTestValidationMessages } from './testing';
export type {
  CreateNgForgeFieldFixtureOptions,
  CreateNgForgeActionFixtureOptions,
  NgForgeFieldFixture,
  NgForgeActionFixture,
} from './testing';

// =============================================================================
// Adapter-tier primitives (re-exported from /internal — single compiled identity)
// =============================================================================

// Base + container mappers
export { baseFieldMapper, buildBaseInputs } from '@ng-forge/dynamic-forms/internal';
export {
  arrayFieldMapper,
  groupFieldMapper,
  pageFieldMapper,
  rowFieldMapper,
  textFieldMapper,
  containerFieldMapper,
} from '@ng-forge/dynamic-forms/internal';
export type { ArrayContext, FieldSignalContext, MapperFn } from '@ng-forge/dynamic-forms/internal';

// Field type registration
export type { FieldScope, FieldTypeDefinition, ValueHandlingMode } from '@ng-forge/dynamic-forms/internal';
export { FIELD_REGISTRY } from '@ng-forge/dynamic-forms/internal';

// Base field component contracts
export type { ValueFieldComponent, CheckedFieldComponent } from '@ng-forge/dynamic-forms/internal';
export { isValueField, isCheckedField } from '@ng-forge/dynamic-forms/internal';

// Signal-context injection tokens
export {
  ARRAY_CONTEXT,
  DEFAULT_PROPS,
  DEFAULT_VALIDATION_MESSAGES,
  DEFAULT_WRAPPERS,
  FIELD_SIGNAL_CONTEXT,
  FORM_OPTIONS,
  GROUP_CONTEXT,
  injectFieldSignalContext,
} from '@ng-forge/dynamic-forms/internal';

// FieldTree utilities
export { getArrayLength, toReadonlyFieldTree, writeToFieldValue } from '@ng-forge/dynamic-forms/internal';
export type { ArrayFieldTree, ReadonlyFieldTree } from '@ng-forge/dynamic-forms/internal';

// Registry service used by button mappers
export { RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';

// Low-level utils used by mappers / error utilities
export { interpolateParams } from '@ng-forge/dynamic-forms/internal';
export { applyMetaToElement } from '@ng-forge/dynamic-forms/internal';
export { resolveDynamicValue } from '@ng-forge/dynamic-forms/internal';

// Field-state types for custom expressions
export type { FieldStateInfo, FieldStateContext, FormFieldStateMap } from '@ng-forge/dynamic-forms/internal';

// =============================================================================
// Adapter-tier primitives (re-exported from /internal)
// =============================================================================

export { EventBus, resolveTokens } from '@ng-forge/dynamic-forms/internal';
export { applyValidator, applyValidators } from '@ng-forge/dynamic-forms/internal';
export type { HttpResourceRequest } from '@ng-forge/dynamic-forms/internal';
export { DynamicTextPipe } from '@ng-forge/dynamic-forms/internal';
export { dynamicTextToObservable } from '@ng-forge/dynamic-forms/internal';
export { INITIALIZATION_TIMEOUT_MS } from '@ng-forge/dynamic-forms/internal';
export { withPreviousValue } from '@ng-forge/dynamic-forms/internal';

// =============================================================================
// Adapter-tier primitives (re-exported from the main entrypoint — main-local)
// =============================================================================

export { BUILT_IN_FIELDS } from '@ng-forge/dynamic-forms';
export { runPresetAction } from '@ng-forge/dynamic-forms';
export type { PresetCollaborators } from '@ng-forge/dynamic-forms';
export { ADDON_ACTION_REGISTRY, ADDON_ACTION_HANDLERS } from '@ng-forge/dynamic-forms/internal';
export type { AddonActionHandler } from '@ng-forge/dynamic-forms/internal';
export { ADDON_KIND_DEFINITIONS } from '@ng-forge/dynamic-forms';
export { ADDON_KIND_REGISTRY, ADDON_KIND_COMPONENT_CACHE } from '@ng-forge/dynamic-forms/internal';
export { injectAddonKindRegistry } from '@ng-forge/dynamic-forms';
export { injectFieldsSupportingAddons } from '@ng-forge/dynamic-forms';
export type { FieldAddonSupportEntry } from '@ng-forge/dynamic-forms';
