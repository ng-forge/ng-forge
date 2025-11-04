import { FieldComponent, FieldDef } from '../base';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 *
 * The generic parameter preserves the exact field types for proper inference
 */
export interface GroupField<TFields extends readonly any[] = readonly any[]> extends FieldDef<never> {
  /** Field type identifier */
  readonly type: 'group';

  readonly fields: TFields;
}

/**
 * Type guard for GroupField with proper type narrowing
 * After this guard, TypeScript knows the field is a GroupField and can access its properties safely
 */
export function isGroupField(field: FieldDef<Record<string, unknown>>): field is GroupField {
  return field.type === 'group' && 'fields' in field;
}

export type GroupComponent<T extends readonly any[]> = FieldComponent<GroupField<T>>;
