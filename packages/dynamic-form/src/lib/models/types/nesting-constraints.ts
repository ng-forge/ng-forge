import { LeafFieldTypes } from '../registry/field-registry';
import type { RowField } from '../../definitions/default/row-field';
import type { GroupField } from '../../definitions/default/group-field';
import type { ArrayField } from '../../definitions/default/array-field';

/**
 * Type constraints for field nesting rules
 * These ensure that container fields can only contain valid child field types
 *
 * Note: We explicitly list types instead of using Exclude to avoid circular dependencies
 */

/**
 * Fields that are allowed as children of Page fields
 * Pages can contain: rows, groups, arrays, and leaf fields (but NOT other pages)
 */
export type PageAllowedChildren = LeafFieldTypes | RowField | GroupField | ArrayField;

/**
 * Fields that are allowed as children of Row fields
 * Rows can contain: groups, arrays, and leaf fields (but NOT pages or other rows)
 */
export type RowAllowedChildren = LeafFieldTypes | GroupField | ArrayField;

/**
 * Fields that are allowed as children of Group fields
 * Groups can contain: rows and leaf fields (but NOT pages or other groups)
 */
export type GroupAllowedChildren = LeafFieldTypes | RowField;

/**
 * Fields that are allowed as children of Array fields
 * Arrays can contain: rows and leaf fields (but NOT pages or other arrays)
 */
export type ArrayAllowedChildren = LeafFieldTypes | RowField;

/**
 * Validates that a fields array contains only allowed child types for a Page
 */
export type ValidatePageChildren<TFields extends unknown[]> = TFields extends PageAllowedChildren[] ? TFields : never;

/**
 * Validates that a fields array contains only allowed child types for a Row
 */
export type ValidateRowChildren<TFields extends unknown[]> = TFields extends RowAllowedChildren[] ? TFields : never;

/**
 * Validates that a fields array contains only allowed child types for a Group
 */
export type ValidateGroupChildren<TFields extends unknown[]> = TFields extends GroupAllowedChildren[] ? TFields : never;

/**
 * Validates that a fields array contains only allowed child types for an Array
 */
export type ValidateArrayChildren<TFields extends unknown[]> = TFields extends ArrayAllowedChildren[] ? TFields : never;

/**
 * Type guard to check if a field is a container field at type level
 */
export type IsContainerField<T> = T extends { type: 'page' | 'row' | 'group' | 'array' } ? true : false;

/**
 * Type guard to check if a field is a leaf field at type level
 */
export type IsLeafField<T> = T extends { type: 'page' | 'row' | 'group' | 'array' } ? false : true;

/**
 * Extract all fields that have a value property (value-bearing fields)
 * Note: Using `unknown` in the Extract condition to match any value type
 */
export type ValueBearingFields = Extract<LeafFieldTypes, { value: unknown }>;

/**
 * Extract all fields that don't have a value property (layout/display fields)
 * Note: Using `unknown` in the Exclude condition to match any value type
 * This includes container fields (page, row, group, array) and non-value leaf fields
 */
export type NonValueBearingFields = Exclude<LeafFieldTypes, { value: unknown }> | RowField | GroupField | ArrayField;
