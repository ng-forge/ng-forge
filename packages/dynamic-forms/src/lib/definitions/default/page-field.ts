import { FieldDef } from '../base/field-def';
import { PageAllowedChildren } from '../../models/types/nesting-constraints';
import { isRowField } from './row-field';
import { isGroupField } from './group-field';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * Logic configuration for page fields.
 * @deprecated Use `ContainerLogicConfig` instead. This is a backwards-compatible alias.
 */
export type PageLogicConfig = ContainerLogicConfig;

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
 *
 * Note: Pages are container fields and do not support `meta` since they have no native form element.
 */
export interface PageField<TFields extends readonly PageAllowedChildren[] = PageAllowedChildren[]> extends FieldDef<never> {
  type: 'page';

  /** Child field definitions to render within this page */
  readonly fields: TFields;

  /** Page fields do not have a label property **/
  readonly label?: never;

  /** Pages do not support meta - they have no native form element **/
  readonly meta?: never;

  /**
   * Logic configurations for conditional page visibility.
   * Only 'hidden' type logic is supported for pages.
   *
   * @example
   * ```typescript
   * {
   *   key: 'businessPage',
   *   type: 'page',
   *   logic: [{
   *     type: 'hidden',
   *     condition: {
   *       type: 'fieldValue',
   *       fieldPath: 'accountType',
   *       operator: 'notEquals',
   *       value: 'business',
   *     },
   *   }],
   *   fields: [...]
   * }
   * ```
   */
  readonly logic?: ContainerLogicConfig[];
}

/**
 * Type guard for PageField with proper type narrowing
 */
export function isPageField(field: FieldDef<unknown>): field is PageField {
  return field.type === 'page' && 'fields' in field && Array.isArray((field as PageField).fields);
}

/**
 * Validates that a page field doesn't contain nested page fields
 * @param pageField The page field to validate
 * @returns true if valid (no nested pages), false otherwise
 */
export function validatePageNesting(pageField: PageField): boolean {
  return !hasNestedPages(pageField.fields);
}

/**
 * Type guard to check if a field is a container with fields property
 */
function isContainerWithFields(field: FieldDef<unknown>): field is FieldDef<unknown> & { readonly fields: readonly FieldDef<unknown>[] } {
  return (isRowField(field) || isGroupField(field)) && 'fields' in field && Array.isArray((field as { fields: unknown }).fields);
}

/**
 * Recursively checks if fields contain any nested page fields
 * @param fields Array of field definitions to check
 * @returns true if nested pages found, false otherwise
 */
function hasNestedPages(fields: readonly FieldDef<unknown>[]): boolean {
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
