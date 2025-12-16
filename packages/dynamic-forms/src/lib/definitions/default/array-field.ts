import { FieldComponent, FieldDef } from '../base/field-def';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Array field interface for creating dynamic field collections that map to array values.
 *
 * Key concepts:
 * - The `fields` array defines the TEMPLATE (single field definition), not instances
 * - Array items are created/removed dynamically at runtime via event bus
 * - For primitive arrays: Use a leaf field as template → `['value1', 'value2']`
 * - For object arrays: Use a group field as template → `[{key1: val1}, {key2: val2}]`
 *
 * @example
 * // Primitive array (flat values)
 * {
 *   key: 'tags',
 *   type: 'array',
 *   fields: [{ key: 'tag', type: 'input' }]
 * }
 * // Creates: { tags: ['tag1', 'tag2', 'tag3'] }
 *
 * @example
 * // Object array (nested groups)
 * {
 *   key: 'contacts',
 *   type: 'array',
 *   fields: [{
 *     type: 'group',
 *     fields: [
 *       { key: 'name', type: 'input' },
 *       { key: 'email', type: 'input' }
 *     ]
 *   }]
 * }
 * // Creates: { contacts: [{name: '', email: ''}, {name: '', email: ''}] }
 *
 * Nesting constraints: Arrays can contain rows, leaf fields, or groups (for object arrays),
 * but NOT pages or other arrays. Runtime validation enforces these rules.
 */
export interface ArrayField<TFields extends readonly ArrayAllowedChildren[] = readonly ArrayAllowedChildren[]> extends FieldDef<never> {
  type: 'array';

  /**
   * Template field definition(s) that will be cloned for each array item.
   * Typically contains a single field definition:
   * - For flat arrays: A leaf field (input, select, checkbox, etc.)
   * - For object arrays: A group field containing multiple child fields
   */
  readonly fields: TFields;

  /** Array fields do not have a label property **/
  readonly label?: never;
}

/**
 * Type guard for ArrayField with proper type narrowing
 */
export function isArrayField<T>(field: FieldDef<T>): field is FieldDef<T> & ArrayField {
  return field.type === 'array' && 'fields' in field;
}

export type ArrayComponent<T extends ArrayAllowedChildren[]> = FieldComponent<ArrayField<T>>;
