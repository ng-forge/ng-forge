import { GroupField, PageField, RowField, TextField } from '../../definitions';

/**
 * Global interface for dynamic form field definitions with categorization
 * Users can augment this interface to add their custom field types
 *
 * Container fields: Layout fields that contain other fields (page, row, group)
 * Leaf fields: Fields that can hold values or display content (input, text, etc.)
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-form' {
 *   interface DynamicFormFieldRegistry {
 *     containers: {
 *       'my-container': MyContainerFieldDef;
 *     };
 *     leaves: {
 *       'my-input': MyInputFieldDef;
 *     };
 *   }
 * }
 * ```
 */
export interface DynamicFormFieldRegistry {
  /**
   * Container fields that hold other fields (no value, have children)
   */
  containers: {
    page: PageField;
    row: RowField;
    group: GroupField;
  };

  /**
   * Leaf fields that have values or display content
   */
  leaves: {
    text: TextField;
  };
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
