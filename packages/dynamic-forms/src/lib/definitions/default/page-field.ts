import { FieldComponent, FieldDef } from '../base';
import { PageAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Helper interface for container fields (row/group) within nested checking
 */
interface ContainerFieldWithFields extends FieldDef<any> {
  fields: FieldDef<any>[];
}

/**
 * Page field interface for creating top-level page layouts
 * This is a special field type that contains other field definitions
 * The page itself doesn't have a value - it's a layout container like row
 * Pages can only be used at the top level and cannot be nested
 * This is a programmatic field type only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Pages should contain rows, groups, and leaf fields, but NOT other pages.
 * Runtime validation enforces these rules.
 */
export interface PageField<TFields extends readonly PageAllowedChildren[] = PageAllowedChildren[]> extends FieldDef<never> {
  type: 'page';

  /** Child field definitions to render within this page */
  readonly fields: TFields;

  /** Page fields do not have a label property **/
  readonly label?: undefined;
}

/**
 * Type guard for PageField with proper type narrowing
 */
export function isPageField(field: FieldDef<any>): field is PageField {
  return field.type === 'page' && 'fields' in field && Array.isArray((field as PageField).fields);
}

export type PageComponent = FieldComponent<PageField>;

/**
 * Validates that a page field doesn't contain nested page fields
 * @param pageField The page field to validate
 * @returns true if valid (no nested pages), false otherwise
 */
export function validatePageNesting(pageField: PageField): boolean {
  return !hasNestedPages(pageField.fields as FieldDef<any>[]);
}

/**
 * Type guard to check if a field is a container with fields property
 */
function isContainerWithFields(field: FieldDef<any>): field is ContainerFieldWithFields {
  return (field.type === 'row' || field.type === 'group') && 'fields' in field && Array.isArray((field as ContainerFieldWithFields).fields);
}

/**
 * Recursively checks if fields contain any nested page fields
 * @param fields Array of field definitions to check
 * @returns true if nested pages found, false otherwise
 */
function hasNestedPages(fields: FieldDef<any>[]): boolean {
  for (const field of fields) {
    if (isPageField(field)) {
      return true;
    }

    // Check row and group fields for nested pages
    if (isContainerWithFields(field)) {
      if (hasNestedPages(field.fields)) {
        return true;
      }
    }
  }
  return false;
}
