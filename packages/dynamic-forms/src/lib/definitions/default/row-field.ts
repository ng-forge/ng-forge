import { FieldComponent, FieldDef } from '../base/field-def';
import { RowAllowedChildren } from '../../models/types/nesting-constraints';
import { isHiddenField } from './hidden-field';
import { isGroupField } from './group-field';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * Row field interface for creating horizontal layouts
 * This is a special field type that contains other definitions arranged horizontally
 * The row itself doesn't have a value - it's a layout container
 * This is a programmatic field type only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Rows should contain groups and leaf fields, but NOT pages, other rows, or hidden fields.
 * Runtime validation enforces these rules.
 *
 * Note: Rows are container fields and do not support `meta` since they have no native form element.
 */
export interface RowField<TFields extends readonly RowAllowedChildren[] = readonly RowAllowedChildren[]> extends FieldDef<never> {
  type: 'row';

  /** Child definitions to render within this row */
  readonly fields: TFields;

  /** Row fields do not have a label property **/
  readonly label?: never;

  /** Rows do not support meta - they have no native form element **/
  readonly meta?: never;

  /**
   * Logic configurations for conditional row visibility.
   * Only 'hidden' type logic is supported for rows.
   */
  readonly logic?: ContainerLogicConfig[];
}

/**
 * Type guard for RowField with proper type narrowing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isRowField(field: FieldDef<any>): field is RowField {
  return field.type === 'row' && 'fields' in field && Array.isArray((field as RowField).fields);
}

/**
 * Validates that a row field doesn't contain hidden fields.
 * Hidden fields are not allowed in rows because rows are for horizontal layouts,
 * and hidden fields don't render anything.
 *
 * @param rowField The row field to validate
 * @returns true if valid (no hidden fields), false otherwise
 */
export function validateRowNesting(rowField: RowField): boolean {
  return !hasHiddenFields(rowField.fields);
}

/**
 * Recursively checks if fields contain any hidden fields
 * @param fields Array of field definitions to check
 * @returns true if hidden fields found, false otherwise
 */
function hasHiddenFields(fields: readonly FieldDef<unknown>[]): boolean {
  for (const field of fields) {
    if (isHiddenField(field)) {
      return true;
    }

    // Check group fields for nested hidden fields
    if (isGroupField(field)) {
      if (hasHiddenFields(field.fields)) {
        return true;
      }
    }
  }
  return false;
}

export type RowComponent = FieldComponent<RowField<RowAllowedChildren[]>>;
