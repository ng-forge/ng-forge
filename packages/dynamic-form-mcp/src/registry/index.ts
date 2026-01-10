/**
 * Registry module for loading generated JSON metadata
 *
 * This module provides access to field types, validators, and UI adapters
 * that are generated at build time from the ng-forge packages.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Lazy loading of registry data
let fieldTypesCache: FieldTypeInfo[] | null = null;
let validatorsCache: ValidatorInfo[] | null = null;
let uiAdaptersCache: UIAdapterInfo[] | null = null;
let docsCache: DocTopic[] | null = null;

function loadJson<T>(filename: string): T {
  const filePath = join(__dirname, filename);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Get all available field types
 */
export function getFieldTypes(): FieldTypeInfo[] {
  if (!fieldTypesCache) {
    fieldTypesCache = loadJson<FieldTypeInfo[]>('field-types.json');
  }
  return fieldTypesCache;
}

/**
 * Get a specific field type by name
 */
export function getFieldType(type: string): FieldTypeInfo | undefined {
  return getFieldTypes().find((ft) => ft.type === type);
}

/**
 * Get field types by category
 */
export function getFieldTypesByCategory(category: 'value' | 'container' | 'button' | 'display'): FieldTypeInfo[] {
  return getFieldTypes().filter((ft) => ft.category === category);
}

/**
 * Get all available validators
 */
export function getValidators(): ValidatorInfo[] {
  if (!validatorsCache) {
    validatorsCache = loadJson<ValidatorInfo[]>('validators.json');
  }
  return validatorsCache;
}

/**
 * Get a specific validator by type
 */
export function getValidator(type: string): ValidatorInfo | undefined {
  return getValidators().find((v) => v.type === type);
}

/**
 * Get validators by category
 */
export function getValidatorsByCategory(category: 'built-in' | 'custom' | 'async' | 'http'): ValidatorInfo[] {
  return getValidators().filter((v) => v.category === category);
}

/**
 * Get all UI adapters
 */
export function getUIAdapters(): UIAdapterInfo[] {
  if (!uiAdaptersCache) {
    uiAdaptersCache = loadJson<UIAdapterInfo[]>('ui-adapters.json');
  }
  return uiAdaptersCache;
}

/**
 * Get a specific UI adapter by library name
 */
export function getUIAdapter(library: 'material' | 'bootstrap' | 'primeng' | 'ionic'): UIAdapterInfo | undefined {
  return getUIAdapters().find((a) => a.library === library);
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
      docsCache = loadJson<DocTopic[]>('docs.json');
    } catch {
      // docs.json may not exist if docs weren't generated
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
