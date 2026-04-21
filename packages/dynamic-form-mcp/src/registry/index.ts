/**
 * Registry module for field type, validator, and UI adapter metadata
 *
 * This module provides access to field types, validators, and UI adapters
 * defined as TypeScript data in the registry source files.
 */

export interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: unknown;
}

export interface FieldTypeInfo {
  type: string;
  category: 'value' | 'container' | 'button' | 'display';
  description: string;
  valueType?: string;
  baseInterface?: string;
  props: Record<string, PropertyInfo>;
  validationSupported: boolean;
  example: string;
  /** Field types that this container can contain (for containers only) */
  canContain?: string[];
  /** Field types that this container CANNOT contain (for containers only) */
  cannotContain?: string[];
  /** Where this field type is allowed to be placed */
  allowedIn?: string[];
  /** Where this field type is NOT allowed to be placed */
  notAllowedIn?: string[];
  /** Whether this field type is part of core library or requires an adapter */
  source: 'core' | 'adapter';
  /** Minimal valid example (just required properties) */
  minimalExample?: string;
}

export interface ValidatorInfo {
  type: string;
  category: 'built-in' | 'custom' | 'async' | 'http';
  description: string;
  parameters: Record<string, PropertyInfo>;
  example: string;
}

export interface WrapperInfo {
  /** Wrapper type discriminant (used in `wrappers: [{ type: '...' }]`) */
  type: string;
  /** Source category: core ships from the library, demo from examples-shared-ui, adapter from a UI integration package */
  category: 'core' | 'demo' | 'adapter';
  /** Shipping status: `shipping` is importable from the listed package; `demo-only` lives in examples-shared-ui and is not a library primitive */
  availability: 'shipping' | 'demo-only';
  /** Package the wrapper is exported from */
  package: string;
  description: string;
  /** Config props the wrapper accepts (keyed by prop name). Excludes the required `type` discriminant. */
  props: Record<string, PropertyInfo>;
  /**
   * Field types this wrapper auto-applies to via its `WrapperTypeDefinition.types` registration.
   * Empty array = the wrapper never auto-applies and must be opt-in via the field's `wrappers` array.
   */
  autoAppliesTo: string[];
  /** Angular component class that implements the wrapper */
  componentName: string;
  /** Authoring-contract rules the wrapper component must satisfy (shared across all wrappers) */
  contract: string;
  /** Full usage example showing the wrapper in a form config */
  example: string;
  /** Minimal valid wrapper config entry */
  minimalExample?: string;
}

export interface UIAdapterFieldType {
  type: string;
  componentName: string;
  additionalProps: Record<string, PropertyInfo>;
}

export interface UIAdapterInfo {
  library: string;
  package: string;
  fieldTypes: UIAdapterFieldType[];
  providerFunction: string;
}

import { FIELD_TYPES } from './field-types.js';
import { VALIDATORS } from './validators.js';
import { UI_ADAPTERS } from './ui-adapters.js';
import { DOCUMENTATION, type DocPage } from './documentation.js';
import { WRAPPERS, WRAPPER_AUTHORING_CONTRACT } from './wrappers.js';

export { WRAPPER_AUTHORING_CONTRACT };

export type { DocPage };

/**
 * Get all available field types
 */
export function getFieldTypes(): FieldTypeInfo[] {
  return FIELD_TYPES;
}

/**
 * Get a specific field type by name
 */
export function getFieldType(type: string): FieldTypeInfo | undefined {
  return FIELD_TYPES.find((ft) => ft.type === type);
}

/**
 * Get field types by category
 */
export function getFieldTypesByCategory(category: 'value' | 'container' | 'button' | 'display'): FieldTypeInfo[] {
  return FIELD_TYPES.filter((ft) => ft.category === category);
}

/**
 * Get all available validators
 */
export function getValidators(): ValidatorInfo[] {
  return VALIDATORS;
}

/**
 * Get a specific validator by type
 */
export function getValidator(type: string): ValidatorInfo | undefined {
  return VALIDATORS.find((v) => v.type === type);
}

/**
 * Get validators by category
 */
export function getValidatorsByCategory(category: 'built-in' | 'custom' | 'async' | 'http'): ValidatorInfo[] {
  return VALIDATORS.filter((v) => v.category === category);
}

/**
 * Get all UI adapters
 */
export function getUIAdapters(): UIAdapterInfo[] {
  return UI_ADAPTERS;
}

/**
 * Get a specific UI adapter by library name
 */
export function getUIAdapter(library: 'material' | 'bootstrap' | 'primeng' | 'ionic'): UIAdapterInfo | undefined {
  return UI_ADAPTERS.find((a) => a.library === library);
}

/**
 * Get UI adapter field type configuration
 */
export function getUIAdapterFieldType(
  library: 'material' | 'bootstrap' | 'primeng' | 'ionic',
  fieldType: string,
): UIAdapterFieldType | undefined {
  const adapter = getUIAdapter(library);
  return adapter?.fieldTypes.find((ft) => ft.type === fieldType);
}

/**
 * Get all wrappers
 */
export function getWrappers(): WrapperInfo[] {
  return WRAPPERS;
}

/**
 * Get a specific wrapper by type
 */
export function getWrapper(type: string): WrapperInfo | undefined {
  return WRAPPERS.find((w) => w.type === type);
}

/**
 * Get wrappers by category
 */
export function getWrappersByCategory(category: 'core' | 'demo' | 'adapter'): WrapperInfo[] {
  return WRAPPERS.filter((w) => w.category === category);
}

/**
 * Get all documentation pages
 */
export function getDocPages(): DocPage[] {
  return DOCUMENTATION;
}

/**
 * Get a specific documentation page by ID
 */
export function getDocPage(id: string): DocPage | undefined {
  return DOCUMENTATION.find((d) => d.id === id);
}

/**
 * Get documentation pages by category
 */
export function getDocPagesByCategory(category: string): DocPage[] {
  return DOCUMENTATION.filter((d) => d.category === category);
}
