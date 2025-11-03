import { FieldTypeDefinition } from '../models/field-type';
import { groupFieldMapper, rowFieldMapper } from '../mappers';
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
 * // Page field for multi-step forms
 * { type: 'page', key: 'step1', fields: [...] }
 * ```
 */
export const BUILT_IN_FIELDS: FieldTypeDefinition[] = [
  {
    name: 'row',
    loadComponent: () => import('../fields/row/row-field.component'),
    mapper: rowFieldMapper,
  },
  {
    name: 'group',
    loadComponent: () => import('../fields/group/group-field.component'),
    mapper: groupFieldMapper,
  },
  {
    name: 'page',
    loadComponent: () => import('../fields/page/page-field.component'),
    mapper: pageFieldMapper,
  },
];
