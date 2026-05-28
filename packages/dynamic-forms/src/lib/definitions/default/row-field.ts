import { FieldComponent, FieldDef } from '../base/field-def';
import { RowAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * Row field interface for creating horizontal layouts.
 * A row is a synthetic field type that resolves to a Container at runtime,
 * with a synthesized `{ type: 'row' }` wrapper applied for layout. The row
 * itself does not hold a value — its children flatten into the parent form.
 */
export interface RowField<TFields extends readonly RowAllowedChildren[] = readonly RowAllowedChildren[]> extends FieldDef<never> {
  type: 'row';

  /** Child definitions to render within this row */
  readonly fields: TFields;

  /** Row fields do not have a label property * */
  readonly label?: never;

  /** Rows do not support meta - they have no native form element * */
  readonly meta?: never;

  /**
   * Logic configurations for conditional row visibility.
   * Only 'hidden' type logic is supported for rows.
   */
  readonly logic?: ContainerLogicConfig[];
}

/** Type guard for RowField with proper type narrowing */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isRowField(field: FieldDef<any>): field is RowField {
  return field.type === 'row' && 'fields' in field && Array.isArray((field as RowField).fields);
}

export type RowComponent = FieldComponent<RowField<RowAllowedChildren[]>>;
