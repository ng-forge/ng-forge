import { LeafFieldTypes } from '../registry/field-registry';
import type { RowField } from '../../definitions/default/row-field';
import type { GroupField } from '../../definitions/default/group-field';
import type { ArrayField } from '../../definitions/default/array-field';
import type { HiddenField } from '../../definitions/default/hidden-field';

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
 * Rows can contain: groups, arrays, and leaf fields (but NOT pages, other rows, or hidden fields)
 * Hidden fields are excluded because rows are for horizontal layouts and hidden fields don't render
 */
export type RowAllowedChildren = Exclude<LeafFieldTypes, HiddenField> | GroupField | ArrayField;

/**
 * Fields that are allowed as children of Group fields
 * Groups can contain: rows and leaf fields (but NOT pages or other groups)
 */
export type GroupAllowedChildren = LeafFieldTypes | RowField;

/**
 * Fields that are allowed as children of Array fields
 * Arrays can contain: rows, groups, and leaf fields (but NOT pages or other arrays)
 * Groups are used for creating object arrays where each array item is an object
 */
export type ArrayAllowedChildren = LeafFieldTypes | RowField | GroupField;
