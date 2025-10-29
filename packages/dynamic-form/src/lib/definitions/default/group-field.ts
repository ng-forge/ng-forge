import { FieldComponent, FieldDef } from '../base';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 */
export interface GroupField<TFields extends readonly FieldDef<Record<string, unknown>>[]> extends FieldDef<never> {
  /** Field type identifier */
  readonly type: 'group';

  readonly fields: TFields;
}

export function isGroupField<TFields extends readonly FieldDef<Record<string, unknown>>[]>(
  field: FieldDef<Record<string, unknown>>
): field is GroupField<TFields> {
  return field.type === 'group' && 'fields' in field;
}

export type GroupComponent<T extends readonly FieldDef<Record<string, unknown>>[]> = FieldComponent<GroupField<T>>;
