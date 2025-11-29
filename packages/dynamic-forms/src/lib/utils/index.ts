export { flattenFields } from './flattener/field-flattener';
export type { FlattenedField } from './flattener/field-flattener';
export { getGridClassString } from './grid-classes/grid-classes';
export { FormModeValidator, isValidFormConfiguration } from './form-validation/form-mode-validator';
export type { FormConfigurationValidationResult } from './form-validation/form-mode-validator';
export { dynamicTextToObservable } from './dynamic-text-to-observable';
export { shouldShowErrors } from './should-show-errors';
export { createResolvedErrorsSignal } from './create-resolved-errors-signal';
export type { ResolvedError } from './create-resolved-errors-signal';
export { getFieldDefaultValue } from './default-value/default-value';

// Form internals - utilities for accessing Angular internal form structures
// These are needed by container field implementations
export { hasFormStructure, getChildrenMap, getFieldProxy, getChildFieldTree } from './form-internals';
export type { FormInternals } from './form-internals';
