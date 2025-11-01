import { FieldTypeDefinition } from '../models/field-type';
import { groupFieldMapper, rowFieldMapper } from '../mappers';
import { pageFieldMapper } from '../mappers/page/page-field-mapper';

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
