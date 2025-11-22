import { ArrayField, GroupField, PageField, RowField, TextField } from '../../definitions';

/**
 * Container fields registry - augment this interface to add custom container fields
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface FieldRegistryContainers {
 *     'my-container': MyContainerFieldDef;
 *   }
 * }
 * ```
 */
export interface FieldRegistryContainers {
  page: PageField;
  row: RowField;
  group: GroupField;
  array: ArrayField;
}

/**
 * Leaf fields registry - augment this interface to add custom leaf fields
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface FieldRegistryLeaves {
 *     'my-input': MyInputFieldDef;
 *   }
 * }
 * ```
 */
export interface FieldRegistryLeaves {
  text: TextField;
}

/**
 * Global interface for dynamic form field definitions with categorization
 * This interface combines containers and leaves from their respective registries
 *
 * Container fields: Layout fields that contain other fields (page, row, group, array)
 * Leaf fields: Fields that can hold values or display content (input, text, etc.)
 *
 * To add custom fields, augment FieldRegistryContainers or FieldRegistryLeaves
 */
export interface DynamicFormFieldRegistry {
  /**
   * Container fields that hold other fields (no value, have children)
   */
  containers: FieldRegistryContainers;

  /**
   * Leaf fields that have values or display content
   */
  leaves: FieldRegistryLeaves;
}

/**
 * Union type of all registered container field definitions
 */
export type ContainerFieldTypes = DynamicFormFieldRegistry['containers'][keyof DynamicFormFieldRegistry['containers']];

/**
 * Union type of all registered leaf field definitions
 */
export type LeafFieldTypes = DynamicFormFieldRegistry['leaves'][keyof DynamicFormFieldRegistry['leaves']];

/**
 * Union type of all registered field definitions
 */
export type RegisteredFieldTypes = ContainerFieldTypes | LeafFieldTypes;

/**
 * Extract field types that are available in the registry
 */
export type AvailableFieldTypes = keyof DynamicFormFieldRegistry['containers'] | keyof DynamicFormFieldRegistry['leaves'];
