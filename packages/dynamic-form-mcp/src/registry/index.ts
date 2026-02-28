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
