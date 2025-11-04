import { FieldComponent, FieldDef } from '../base';
import { isArray } from 'lodash-es';

/**
 * Page field interface for creating top-level page layouts
 * This is a special field type that contains other field definitions
 * The page itself doesn't have a value - it's a layout container like row
 * Pages can only be used at the top level and cannot be nested
 * This is a programmatic field type only - users cannot customize this field type
 *
 * The generic parameter preserves the exact field types for proper inference
 */
export interface PageField<TFields extends readonly any[] = readonly any[]> extends FieldDef<never> {
  /** Field type identifier */
  readonly type: 'page';

  /** Child field definitions to render within this page */
  readonly fields: TFields;

  /** Page title (optional) */
  readonly title?: string;

  /** Page description (optional) */
  readonly description?: string;
}

/** Type guard for PageField */
export function isPageField<TFields extends readonly any[]>(field: FieldDef<Record<string, unknown>>): field is PageField<readonly any[]> {
  return field.type === 'page' && 'fields' in field && isArray((field as { fields: TFields }).fields);
}

export type PageComponent = FieldComponent<PageField<readonly any[]>>;

/**
 * Validates that a page field doesn't contain nested page fields
 * @param pageField The page field to validate
 * @returns true if valid (no nested pages), false otherwise
 */
export function validatePageNesting(pageField: PageField<any>): boolean {
  return !hasNestedPages(pageField.fields);
}

/**
 * Recursively checks if fields contain any nested page fields
 * @param fields Array of field definitions to check
 * @returns true if nested pages found, false otherwise
 */
function hasNestedPages(fields: readonly FieldDef<Record<string, unknown>>[]): boolean {
  for (const field of fields) {
    if (isPageField(field)) {
      return true;
    }

    // Check row and group fields for nested pages
    if (field.type === 'row' || field.type === 'group') {
      const containerField = field as any;
      if (containerField.fields && isArray(containerField.fields)) {
        if (hasNestedPages(containerField.fields)) {
          return true;
        }
      }
    }
  }
  return false;
}
