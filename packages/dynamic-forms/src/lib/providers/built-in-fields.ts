import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { arrayFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { groupFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { rowFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { pageFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { textFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { containerFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { RowField } from '@ng-forge/dynamic-forms/internal';
import { GroupField } from '@ng-forge/dynamic-forms/internal';
import { HiddenField } from '@ng-forge/dynamic-forms/internal';
import { ArrayField } from '@ng-forge/dynamic-forms/internal';
import { PageField } from '@ng-forge/dynamic-forms/internal';
import { TextField } from '@ng-forge/dynamic-forms/internal';
import { ContainerField } from '@ng-forge/dynamic-forms/internal';
import { WrapperTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { CssWrapper } from '@ng-forge/dynamic-forms/internal';
import { RowWrapper } from '@ng-forge/dynamic-forms/internal';

/** Built-in field types provided by the dynamic form library. */
/**
 * Base for container field types that consume the mapper-emitted `field` input
 * (row, group, array, page, container).
 */
const CONTAINER_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

/**
 * Base for display-only fields (`text`) that render immediately without
 * waiting for form value integration.
 */
const DISPLAY_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
} as const;

/** Built-in field types provided by the dynamic form library. */
export const BUILT_IN_FIELDS: FieldTypeDefinition[] = [
  {
    name: 'row',
    // `row` is a virtual field type: it maps to ContainerFieldComponent, and
    // the rowFieldMapper injects a `{ type: 'row' }` wrapper so the container
    // renders the flex/grid layout via RowWrapperComponent.
    loadComponent: () => import('../fields/container/container-field.component'),
    mapper: rowFieldMapper,
    valueHandling: 'flatten',
    ...CONTAINER_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<RowField>,
  {
    name: 'group',
    loadComponent: () => import('../fields/group/group-field.component'),
    mapper: groupFieldMapper,
    valueHandling: 'include',
    ...CONTAINER_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<GroupField>,
  {
    name: 'array',
    loadComponent: () => import('../fields/array/array-field.component'),
    mapper: arrayFieldMapper,
    valueHandling: 'include',
    ...CONTAINER_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<ArrayField>,
  {
    name: 'page',
    loadComponent: () => import('../fields/page/page-field.component'),
    mapper: pageFieldMapper,
    valueHandling: 'flatten',
    ...CONTAINER_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<PageField>,
  {
    name: 'text',
    loadComponent: () => import('../fields/text/text-field.component'),
    mapper: textFieldMapper,
    valueHandling: 'exclude',
    ...DISPLAY_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<TextField>,
  {
    name: 'hidden',
    // Componentless field - no loadComponent or mapper needed
    valueHandling: 'include',
  } satisfies FieldTypeDefinition<HiddenField>,
  {
    name: 'container',
    loadComponent: () => import('../fields/container/container-field.component'),
    mapper: containerFieldMapper,
    valueHandling: 'flatten',
    ...CONTAINER_FIELD_TYPES_BASE,
  } satisfies FieldTypeDefinition<ContainerField>,
];

export const BUILT_IN_WRAPPERS: WrapperTypeDefinition[] = [
  {
    wrapperName: 'css',
    loadComponent: () => import('../wrappers/css/css-wrapper.component'),
  } satisfies WrapperTypeDefinition<CssWrapper>,
  {
    wrapperName: 'row',
    loadComponent: () => import('../wrappers/row/row-wrapper.component'),
  } satisfies WrapperTypeDefinition<RowWrapper>,
];
