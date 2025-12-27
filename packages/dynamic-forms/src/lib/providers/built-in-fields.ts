import { FieldTypeDefinition } from '../models/field-type';
import { arrayFieldMapper } from '../mappers/array/array-field-mapper';
import { groupFieldMapper } from '../mappers/group/group-field-mapper';
import { rowFieldMapper } from '../mappers/row/row-field-mapper';
import { pageFieldMapper } from '../mappers/page/page-field-mapper';
import { textFieldMapper } from '../mappers/text/text-field-mapper';
import { RowField } from '../definitions/default/row-field';
import { GroupField } from '../definitions/default/group-field';
import { HiddenField } from '../definitions/default/hidden-field';
import { ArrayField } from '../definitions/default/array-field';
import { PageField } from '../definitions/default/page-field';
import { TextField } from '../definitions/default/text-field';

/**
 * Built-in field types provided by the dynamic form library.
 *
 * These core field types handle form structure and layout. They are automatically
 * registered when using provideDynamicForm() and form the foundation for building
 * complex form layouts with nested fields and multi-step flows.
 *
 * @example
 * ```typescript
 * // Row field for horizontal layout
 * { type: 'row', fields: [
 *   { type: 'input', key: 'firstName' },
 *   { type: 'input', key: 'lastName' }
 * ]}
 *
 * // Group field for nested form sections
 * { type: 'group', key: 'address', fields: [
 *   { type: 'input', key: 'street' },
 *   { type: 'input', key: 'city' }
 * ]}
 *
 * // Array field for array-based form sections
 * { type: 'array', key: 'items', fields: [
 *   { type: 'input', key: 'name' },
 *   { type: 'input', key: 'quantity' }
 * ]}
 *
 * // Page field for multi-step forms
 * { type: 'page', key: 'step1', fields: [...] }
 * ```
 */
/**
 * Built-in field types provided by the dynamic form library.
 *
 * Each field type is validated at compile time using satisfies, ensuring
 * type safety of the mapper function while allowing the array to be typed
 * as FieldTypeDefinition[] for consumer flexibility.
 */
export const BUILT_IN_FIELDS: FieldTypeDefinition[] = [
  {
    name: 'row',
    loadComponent: () => import('../fields/row/row-field.component'),
    mapper: rowFieldMapper,
    valueHandling: 'flatten',
  } satisfies FieldTypeDefinition<RowField>,
  {
    name: 'group',
    loadComponent: () => import('../fields/group/group-field.component'),
    mapper: groupFieldMapper,
    valueHandling: 'include',
  } satisfies FieldTypeDefinition<GroupField>,
  {
    name: 'array',
    loadComponent: () => import('../fields/array/array-field.component'),
    mapper: arrayFieldMapper,
    valueHandling: 'include',
  } satisfies FieldTypeDefinition<ArrayField>,
  {
    name: 'page',
    loadComponent: () => import('../fields/page/page-field.component'),
    mapper: pageFieldMapper,
    valueHandling: 'flatten',
  } satisfies FieldTypeDefinition<PageField>,
  {
    name: 'text',
    loadComponent: () => import('../fields/text/text-field.component'),
    mapper: textFieldMapper,
    valueHandling: 'exclude',
  } satisfies FieldTypeDefinition<TextField>,
  {
    name: 'hidden',
    // Componentless field - no loadComponent or mapper needed
    valueHandling: 'include',
  } satisfies FieldTypeDefinition<HiddenField>,
];
