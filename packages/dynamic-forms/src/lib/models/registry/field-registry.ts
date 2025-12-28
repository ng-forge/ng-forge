import { ArrayField } from '../../definitions/default/array-field';
import { GroupField } from '../../definitions/default/group-field';
import { HiddenField } from '../../definitions/default/hidden-field';
import { PageField } from '../../definitions/default/page-field';
import { RowField } from '../../definitions/default/row-field';
import { TextField } from '../../definitions/default/text-field';

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
  hidden: HiddenField;
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

/**
 * Combined registry mapping type names to field definitions.
 * This flattens containers and leaves into a single mapping.
 */
type FieldTypeMap = DynamicFormFieldRegistry['containers'] & DynamicFormFieldRegistry['leaves'];

/**
 * Extract a specific field type from RegisteredFieldTypes based on the `type` discriminant.
 * This enables proper type narrowing when defining fields.
 *
 * @example
 * ```typescript
 * // Extract a specific field type
 * type MyInputField = ExtractField<'input'>;
 *
 * // Use in field definitions for proper props inference
 * const field: ExtractField<'input'> = {
 *   type: 'input',
 *   key: 'email',
 *   value: '',
 *   props: { type: 'email' } // Only input props allowed here
 * };
 * ```
 */
export type ExtractField<T extends AvailableFieldTypes> = T extends keyof FieldTypeMap ? FieldTypeMap[T] : never;

/**
 * Narrow a field definition based on its `type` property.
 * Use this to get proper type inference when working with field unions.
 *
 * @example
 * ```typescript
 * function processField<T extends RegisteredFieldTypes>(field: T): NarrowField<T> {
 *   return field as NarrowField<T>;
 * }
 * ```
 */
export type NarrowField<T> = T extends { type: infer TType } ? (TType extends AvailableFieldTypes ? ExtractField<TType> : T) : T;

/**
 * Narrow each field in an array based on its `type` property.
 * Use with `satisfies` to get proper type inference for field arrays.
 *
 * @example
 * ```typescript
 * const fields = [
 *   { type: 'input', key: 'name', value: '', props: { type: 'text' } },
 *   { type: 'select', key: 'country', value: 'us', options: [...] },
 * ] as const satisfies NarrowFields;
 * ```
 */
export type NarrowFields = readonly NarrowField<RegisteredFieldTypes>[];
