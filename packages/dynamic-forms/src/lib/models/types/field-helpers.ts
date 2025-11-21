/**
 * Helper types for creating type-safe field configurations with proper nesting constraints
 */

import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { ArrayField, GroupField, PageField, RowField } from '../../definitions';
import { RegisteredFieldTypes } from '../registry/field-registry';
import { ArrayAllowedChildren, GroupAllowedChildren, PageAllowedChildren, RowAllowedChildren } from './nesting-constraints';

/**
 * Create a type-safe page field with nesting validation
 * Pages can contain rows, groups, and leaf fields (but not other pages)
 *
 * @example
 * ```typescript
 * const page: TypeSafePageField = {
 *   type: 'page',
 *   key: 'page1',
 *   fields: [
 *     { type: 'row', key: 'row1', fields: [...] },
 *     { type: 'group', key: 'group1', fields: [...] },
 *     { type: 'input', key: 'field1', value: '' }
 *   ]
 * };
 * ```
 */
export type TypeSafePageField<TFields extends PageAllowedChildren[] = PageAllowedChildren[]> = Omit<PageField<TFields>, 'fields'> & {
  fields: TFields;
};

/**
 * Create a type-safe row field with nesting validation
 * Rows can contain groups and leaf fields (but not pages or other rows)
 *
 * @example
 * ```typescript
 * const row: TypeSafeRowField = {
 *   type: 'row',
 *   key: 'row1',
 *   fields: [
 *     { type: 'group', key: 'group1', fields: [...] },
 *     { type: 'input', key: 'field1', value: '' }
 *   ]
 * };
 * ```
 */
export type TypeSafeRowField<TFields extends RowAllowedChildren[] = RowAllowedChildren[]> = Omit<RowField<TFields>, 'fields'> & {
  fields: TFields;
};

/**
 * Create a type-safe group field with nesting validation
 * Groups can contain rows and leaf fields (but not pages or other groups)
 *
 * @example
 * ```typescript
 * const group: TypeSafeGroupField = {
 *   type: 'group',
 *   key: 'group1',
 *   fields: [
 *     { type: 'row', key: 'row1', fields: [...] },
 *     { type: 'input', key: 'field1', value: '' }
 *   ]
 * };
 * ```
 */
export type TypeSafeGroupField<TFields extends GroupAllowedChildren[] = GroupAllowedChildren[]> = Omit<GroupField<TFields>, 'fields'> & {
  fields: TFields;
};

/**
 * Create a type-safe array field with nesting validation
 * Arrays can contain rows and leaf fields (but not pages or other arrays)
 *
 * @example
 * ```typescript
 * const array: TypeSafeArrayField = {
 *   type: 'array',
 *   key: 'array1',
 *   fields: [
 *     { type: 'row', key: 'row1', fields: [...] },
 *     { type: 'input', key: 'field1', value: '' }
 *   ]
 * };
 * ```
 */
export type TypeSafeArrayField<TFields extends ArrayAllowedChildren[] = ArrayAllowedChildren[]> = Omit<ArrayField<TFields>, 'fields'> & {
  fields: TFields;
};

/**
 * Validate that root-level fields don't contain invalid nesting
 * For non-paged forms: no page fields allowed
 * For paged forms: only page fields allowed at root
 */
export type ValidateRootFields<TFields extends RegisteredFieldTypes[]> =
  // Check if any fields are pages
  TFields[number] extends { type: 'page' }
    ? // If so, all must be pages
      TFields extends PageField[]
      ? TFields
      : never // Mixed page and non-page fields not allowed
    : // If no pages, no pages should be present
      TFields extends Exclude<RegisteredFieldTypes, { type: 'page' }>[]
      ? TFields
      : never;

/**
 * Type helper for accessing nested field paths safely
 * This allows accessing child paths while maintaining some type safety
 */
export type FieldPathAccess<TValue> = {
  [K in keyof TValue]: SchemaPath<TValue[K]> | SchemaPathTree<TValue[K]>;
};
