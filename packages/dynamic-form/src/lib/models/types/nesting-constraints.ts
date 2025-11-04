import { RegisteredFieldTypes, ContainerFieldTypes, LeafFieldTypes } from '../registry/field-registry';

/**
 * Type constraints for field nesting rules
 * These ensure that container fields can only contain valid child field types
 */

/**
 * Fields that are allowed as children of Page fields
 * Pages can contain: rows, groups, and leaf fields (but NOT other pages)
 */
export type PageAllowedChildren = Exclude<RegisteredFieldTypes, { type: 'page' }>;

/**
 * Fields that are allowed as children of Row fields
 * Rows can contain: groups and leaf fields (but NOT pages or other rows)
 */
export type RowAllowedChildren = Exclude<RegisteredFieldTypes, { type: 'page' | 'row' }>;

/**
 * Fields that are allowed as children of Group fields
 * Groups can contain: rows and leaf fields (but NOT pages or other groups)
 */
export type GroupAllowedChildren = Exclude<RegisteredFieldTypes, { type: 'page' | 'group' }>;

/**
 * Validates that a fields array contains only allowed child types for a Page
 */
export type ValidatePageChildren<TFields extends readonly any[]> = TFields extends readonly PageAllowedChildren[] ? TFields : never;

/**
 * Validates that a fields array contains only allowed child types for a Row
 */
export type ValidateRowChildren<TFields extends readonly any[]> = TFields extends readonly RowAllowedChildren[] ? TFields : never;

/**
 * Validates that a fields array contains only allowed child types for a Group
 */
export type ValidateGroupChildren<TFields extends readonly any[]> = TFields extends readonly GroupAllowedChildren[] ? TFields : never;

/**
 * Type guard to check if a field is a container field at type level
 */
export type IsContainerField<T> = T extends { type: 'page' | 'row' | 'group' } ? true : false;

/**
 * Type guard to check if a field is a leaf field at type level
 */
export type IsLeafField<T> = T extends { type: 'page' | 'row' | 'group' } ? false : true;

/**
 * Extract all fields that have a value property (value-bearing fields)
 */
export type ValueBearingFields = Extract<RegisteredFieldTypes, { value: any }>;

/**
 * Extract all fields that don't have a value property (layout/display fields)
 */
export type NonValueBearingFields = Exclude<RegisteredFieldTypes, { value: any }>;
