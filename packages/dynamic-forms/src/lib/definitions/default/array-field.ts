import { FieldComponent, FieldDef } from '../base/field-def';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * An array item template is an array of allowed children that defines one array item's fields.
 */
export type ArrayItemTemplate = readonly ArrayAllowedChildren[];

/**
 * Array field interface for creating dynamic field collections that map to array values.
 *
 * Key concepts:
 * - The outer `fields` array defines INITIAL ITEMS (each element is one array item to render)
 * - Each inner array defines the field structure for that item
 * - Items can have different field configurations (heterogeneous arrays supported)
 * - Empty `fields: []` means no initial items - user adds via buttons with explicit templates
 * - Initial values are declared via `value` property on each field definition
 *
 * @example
 * // Two initial items with same structure
 * {
 *   key: 'contacts',
 *   type: 'array',
 *   fields: [
 *     [
 *       { key: 'name', type: 'input', value: 'Alice' },
 *       { key: 'email', type: 'input', value: 'alice@example.com' }
 *     ],
 *     [
 *       { key: 'name', type: 'input', value: 'Bob' },
 *       { key: 'email', type: 'input', value: 'bob@example.com' }
 *     ]
 *   ]
 * }
 * // Creates: { contacts: [{name: 'Alice', email: 'alice@example.com'}, {name: 'Bob', email: 'bob@example.com'}] }
 *
 * @example
 * // Empty array (add items via buttons)
 * {
 *   key: 'tags',
 *   type: 'array',
 *   fields: []  // No initial items - user adds via button with template
 * }
 *
 * @example
 * // Heterogeneous items (different structures per item)
 * {
 *   key: 'contacts',
 *   type: 'array',
 *   fields: [
 *     [{ key: 'name', type: 'input' }, { key: 'email', type: 'input' }],
 *     [{ key: 'name', type: 'input' }, { key: 'phone', type: 'input' }]  // Different field!
 *   ]
 * }
 *
 * Nesting constraints: Arrays can contain rows, leaf fields, or groups (for object arrays),
 * but NOT pages or other arrays. Runtime validation enforces these rules.
 *
 * Note: Arrays are container fields and do not support `meta` since they have no native form element.
 */
export interface ArrayField<TFields extends readonly ArrayItemTemplate[] = readonly ArrayItemTemplate[]> extends FieldDef<never> {
  type: 'array';

  /**
   * Array of item definitions. Each inner array defines one array item's fields.
   * - Empty array `[]` = no initial items (add via buttons with explicit templates)
   * - Each inner array = one array item with its own field structure
   * - Items can have different field configurations
   * - Initial values are set via `value` property on each field definition
   */
  readonly fields: TFields;

  /** Array fields do not have a label property **/
  readonly label?: never;

  /** Arrays do not support meta - they have no native form element **/
  readonly meta?: never;
}

/**
 * Type guard for ArrayField with proper type narrowing.
 * Validates that fields is an array of arrays (the new structure).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isArrayField(field: FieldDef<any>): field is ArrayField {
  return field.type === 'array' && 'fields' in field && Array.isArray(field.fields) && field.fields.every((item) => Array.isArray(item));
}

export type ArrayComponent<T extends ArrayItemTemplate[]> = FieldComponent<ArrayField<T>>;
