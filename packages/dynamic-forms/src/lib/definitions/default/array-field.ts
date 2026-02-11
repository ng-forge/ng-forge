import { FieldComponent, FieldDef } from '../base/field-def';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * An array item template is an array of allowed children that defines one OBJECT array item's fields.
 * Used for object arrays where each item is `{ key1: value1, key2: value2, ... }`.
 */
export type ArrayItemTemplate = readonly ArrayAllowedChildren[];

/**
 * An array item definition can be either:
 * - A single field (ArrayAllowedChildren) for PRIMITIVE array items - extracts field value directly
 * - An array of fields (ArrayItemTemplate) for OBJECT array items - merges fields into object
 *
 * This allows support for:
 * - Primitive arrays: `['tag1', 'tag2']`
 * - Object arrays: `[{ name: 'Alice', email: '...' }]`
 * - Heterogeneous arrays: `[{ value: 'x' }, 'y']` (mixed primitives and objects)
 */
export type ArrayItemDefinition = ArrayAllowedChildren | ArrayItemTemplate;

/**
 * Array field interface for creating dynamic field collections that map to array values.
 *
 * Key concepts:
 * - The outer `fields` array defines INITIAL ITEMS (each element is one array item to render)
 * - Each element can be either:
 *   - A single FieldDef (primitive item) - the field's value is extracted directly
 *   - An array of FieldDefs (object item) - fields are merged into an object
 * - Items can have different field configurations (heterogeneous arrays supported)
 * - Empty `fields: []` means no initial items - user adds via buttons with explicit templates
 * - Initial values are declared via `value` property on each field definition
 *
 * @example
 * // Primitive array: ['angular', 'typescript']
 * {
 *   key: 'tags',
 *   type: 'array',
 *   fields: [
 *     { key: 'tag', type: 'input', value: 'angular' },      // Single field = primitive
 *     { key: 'tag', type: 'input', value: 'typescript' },
 *   ]
 * }
 *
 * @example
 * // Object array: [{ name: 'Alice', email: '...' }]
 * {
 *   key: 'contacts',
 *   type: 'array',
 *   fields: [
 *     [                                                      // Array = object
 *       { key: 'name', type: 'input', value: 'Alice' },
 *       { key: 'email', type: 'input', value: 'alice@example.com' }
 *     ],
 *   ]
 * }
 *
 * @example
 * // Heterogeneous array: [{ label: 'Structured' }, 'Simple']
 * {
 *   key: 'items',
 *   type: 'array',
 *   fields: [
 *     [{ key: 'label', type: 'input', value: 'Structured' }],  // Object item
 *     { key: 'value', type: 'input', value: 'Simple' },        // Primitive item
 *   ]
 * }
 *
 * @example
 * // Empty array (add items via buttons)
 * {
 *   key: 'tags',
 *   type: 'array',
 *   fields: []  // No initial items - user adds via button with template
 * }
 *
 * Nesting constraints: Arrays can contain rows, leaf fields, or groups (for object arrays),
 * but NOT pages or other arrays. Runtime validation enforces these rules.
 *
 * Note: Arrays are container fields and do not support `meta` since they have no native form element.
 */
export interface ArrayField<TFields extends readonly ArrayItemDefinition[] = readonly ArrayItemDefinition[]> extends FieldDef<never> {
  type: 'array';

  /**
   * Array of item definitions. Each element defines one array item:
   * - Single FieldDef = primitive item (field's value is extracted directly)
   * - Array of FieldDefs = object item (fields are merged into an object)
   * - Empty array `[]` = no initial items (add via buttons with explicit templates)
   * - Items can have different configurations (heterogeneous arrays supported)
   * - Initial values are set via `value` property on each field definition
   */
  readonly fields: TFields;

  /** Array fields do not have a label property **/
  readonly label?: never;

  /** Arrays do not support meta - they have no native form element **/
  readonly meta?: never;

  /**
   * Logic configurations for conditional array visibility.
   * Only 'hidden' type logic is supported for arrays.
   */
  readonly logic?: ContainerLogicConfig[];
}

/**
 * Type guard for ArrayField with proper type narrowing.
 * Validates that the field is an array type with a fields property that is an array.
 * Fields can contain either single FieldDefs (primitive items) or arrays of FieldDefs (object items).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isArrayField(field: FieldDef<any>): field is ArrayField {
  return field.type === 'array' && 'fields' in field && Array.isArray(field.fields);
}

export type ArrayComponent<T extends ArrayItemTemplate[]> = FieldComponent<ArrayField<T>>;
