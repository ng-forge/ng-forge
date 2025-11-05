import { FieldComponent, FieldDef } from '../base';
import { isArray } from 'lodash-es';

/**
 * Helper interface for container fields (row/group) within nested checking
 */
interface ContainerFieldWithFields extends FieldDef<Record<string, unknown>> {
  fields: FieldDef<Record<string, unknown>>[];
}

/**
 * Page field interface for creating top-level page layouts
 * This is a special field type that contains other field definitions
 * The page itself doesn't have a value - it's a layout container like row
 * Pages can only be used at the top level and cannot be nested
 * This is a programmatic field type only - users cannot customize this field type
 *
 * The generic parameter preserves the exact field types for proper inference
 * Note: We use `any[]` here instead of `RegisteredFieldTypes[]` to avoid circular dependency.
 * Type safety is enforced at the FormConfig level using `satisfies`.
 */
export interface PageField<TFields extends any[] = any[]> extends FieldDef<never> {
  /** Field type identifier */
  type: 'page';

  /** Child field definitions to render within this page */
  fields: TFields;

  /** Page title (optional) */
  title?: string;

  /** Page description (optional) */
  description?: string;
}

/**
 * Type guard for PageField with proper type narrowing
 * After this guard, TypeScript knows the field is a PageField and can access its properties safely
 */
export function isPageField(field: FieldDef<Record<string, unknown>>): field is PageField {
  return field.type === 'page' && 'fields' in field && isArray((field as PageField).fields);
}

export type PageComponent = FieldComponent<PageField<any[]>>;

/**
 * Validates that a page field doesn't contain nested page fields
 * @param pageField The page field to validate
 * @returns true if valid (no nested pages), false otherwise
 */
export function validatePageNesting(pageField: PageField<any[]>): boolean {
  return !hasNestedPages(pageField.fields as FieldDef<Record<string, unknown>>[]);
}

/**
 * Type guard to check if a field is a container with fields property
 */
function isContainerWithFields(field: FieldDef<Record<string, unknown>>): field is ContainerFieldWithFields {
  return (field.type === 'row' || field.type === 'group') && 'fields' in field && isArray((field as ContainerFieldWithFields).fields);
}

/**
 * Recursively checks if fields contain any nested page fields
 * @param fields Array of field definitions to check
 * @returns true if nested pages found, false otherwise
 */
function hasNestedPages(fields: FieldDef<Record<string, unknown>>[]): boolean {
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
