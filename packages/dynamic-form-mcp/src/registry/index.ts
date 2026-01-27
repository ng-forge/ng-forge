/**
 * Registry module for loading generated JSON metadata
 *
 * This module provides access to field types, validators, and UI adapters
 * that are generated at build time from the ng-forge packages.
 *
 * JSON data is imported directly to work correctly with esbuild bundling.
 */

import fieldTypesData from './field-types.json' with { type: 'json' };
import validatorsData from './validators.json' with { type: 'json' };
import uiAdaptersData from './ui-adapters.json' with { type: 'json' };

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

export interface DocTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Type the imported JSON data
const fieldTypes = fieldTypesData as FieldTypeInfo[];
const validators = validatorsData as ValidatorInfo[];
const uiAdapters = uiAdaptersData as UIAdapterInfo[];

// Docs are loaded dynamically since they may not exist
let docsCache: DocTopic[] | null = null;

/**
 * Get all available field types
 */
export function getFieldTypes(): FieldTypeInfo[] {
  return fieldTypes;
}

/**
 * Get a specific field type by name
 */
export function getFieldType(type: string): FieldTypeInfo | undefined {
  return fieldTypes.find((ft) => ft.type === type);
}

/**
 * Get field types by category
 */
export function getFieldTypesByCategory(category: 'value' | 'container' | 'button' | 'display'): FieldTypeInfo[] {
  return fieldTypes.filter((ft) => ft.category === category);
}

/**
 * Get all available validators
 */
export function getValidators(): ValidatorInfo[] {
  return validators;
}

/**
 * Get a specific validator by type
 */
export function getValidator(type: string): ValidatorInfo | undefined {
  return validators.find((v) => v.type === type);
}

/**
 * Get validators by category
 */
export function getValidatorsByCategory(category: 'built-in' | 'custom' | 'async' | 'http'): ValidatorInfo[] {
  return validators.filter((v) => v.category === category);
}

/**
 * Get all UI adapters
 */
export function getUIAdapters(): UIAdapterInfo[] {
  return uiAdapters;
}

/**
 * Get a specific UI adapter by library name
 */
export function getUIAdapter(library: 'material' | 'bootstrap' | 'primeng' | 'ionic'): UIAdapterInfo | undefined {
  return uiAdapters.find((a) => a.library === library);
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
 * Get all documentation topics
 */
export function getDocs(): DocTopic[] {
  if (!docsCache) {
    try {
      // Docs are optional and loaded dynamically
      docsCache = require('./docs.json') as DocTopic[];
    } catch (error) {
      // docs.json may not exist if docs weren't generated
      // Log unexpected errors (not file-not-found) in development
      if (process.env.NODE_ENV !== 'production') {
        const isModuleNotFound = error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND';
        if (!isModuleNotFound) {
          console.warn('[ng-forge-mcp] Failed to load docs.json:', error instanceof Error ? error.message : error);
        }
      }
      docsCache = [];
    }
  }
  return docsCache;
}

/**
 * Get a specific documentation topic by ID
 */
export function getDoc(id: string): DocTopic | undefined {
  return getDocs().find((d) => d.id === id);
}

/**
 * Get documentation topics by category
 */
export function getDocsByCategory(category: string): DocTopic[] {
  return getDocs().filter((d) => d.category === category);
}
