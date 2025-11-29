import { FieldTypeDefinition } from '../models/field-type';
import { arrayFieldMapper } from '../mappers/array/array-field-mapper';
import { baseFieldMapper } from '../mappers/base/base-field-mapper';
import { groupFieldMapper } from '../mappers/group/group-field-mapper';
import { rowFieldMapper } from '../mappers/row/row-field-mapper';
import { pageFieldMapper } from '../mappers/page/page-field-mapper';

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
export const BUILT_IN_FIELDS: FieldTypeDefinition[] = [
  {
    name: 'row',
    loadComponent: () => import('../fields/row/row-field.component'),
    mapper: rowFieldMapper,
    valueHandling: 'flatten',
  },
  {
    name: 'group',
    loadComponent: () => import('../fields/group/group-field.component'),
    mapper: groupFieldMapper,
    valueHandling: 'include',
  },
  {
    name: 'array',
    loadComponent: () => import('../fields/array/array-field.component'),
    mapper: arrayFieldMapper,
    valueHandling: 'include',
  },
  {
    name: 'page',
    loadComponent: () => import('../fields/page/page-field.component'),
    mapper: pageFieldMapper,
    valueHandling: 'flatten',
  },
  {
    name: 'text',
    loadComponent: () => import('../fields/text/text-field.component'),
    mapper: baseFieldMapper,
    valueHandling: 'exclude',
  },
];
