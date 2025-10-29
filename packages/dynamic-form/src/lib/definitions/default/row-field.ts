import { FieldComponent, FieldDef } from '../base';
import { isArray } from 'lodash-es';

/**
 * Row field interface for creating horizontal layouts
 * This is a special field type that contains other definitions arranged horizontally
 * The row itself doesn't have a value - it's a layout container
 * This is a programmatic field type only - users cannot customize this field type
 */
export interface RowField<TFields extends readonly FieldDef<Record<string, unknown>>[]> extends FieldDef<never> {
  /** Field type identifier */
  readonly type: 'row';

  /** Child definitions to render within this row */
  readonly fields: TFields;
}

/** Type guard for RowField */
export function isRowField<TFields extends readonly FieldDef<Record<string, unknown>>[]>(
  field: FieldDef<Record<string, unknown>>
): field is RowField<readonly FieldDef<Record<string, unknown>>[]> {
  return field.type === 'row' && 'fields' in field && isArray((field as { fields: TFields }).fields);
}

export type RowComponent = FieldComponent<RowField<readonly FieldDef<Record<string, unknown>>[]>>;

/**
 * Row child field with column layout properties
 */
export interface RowChildField extends Omit<FieldDef<Record<string, unknown>>, 'col'> {
  col?: {
    span?: number;
    start?: number;
    end?: number;
  };
}
