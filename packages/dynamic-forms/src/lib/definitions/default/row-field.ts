import { FieldComponent, FieldDef } from '../base/field-def';
import { RowAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Row field interface for creating horizontal layouts
 * This is a special field type that contains other definitions arranged horizontally
 * The row itself doesn't have a value - it's a layout container
 * This is a programmatic field type only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Rows should contain groups and leaf fields, but NOT pages or other rows.
 * Runtime validation enforces these rules.
 */
export interface RowField<TFields extends readonly RowAllowedChildren[] = readonly RowAllowedChildren[]> extends FieldDef<never> {
  type: 'row';

  /** Child definitions to render within this row */
  readonly fields: TFields;

  /** Row fields do not have a label property **/
  readonly label?: never;
}

/**
 * Type guard for RowField with proper type narrowing
 */
export function isRowField<T>(field: FieldDef<T>): field is FieldDef<T> & RowField {
  return field.type === 'row' && 'fields' in field && Array.isArray((field as RowField).fields);
}

export type RowComponent = FieldComponent<RowField<RowAllowedChildren[]>>;
