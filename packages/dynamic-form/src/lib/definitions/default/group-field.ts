import { FieldComponent, FieldDef } from '../base';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 *
 * The generic parameter preserves the exact field types for proper inference
 *
 * Note: We use `any[]` here instead of `RegisteredFieldTypes[]` to avoid circular dependency.
 * Type safety is enforced at the FormConfig level using `satisfies`.
 */
export interface GroupField<TFields extends any[] = any[]> extends FieldDef<never> {
  /** Field type identifier */
  type: 'group';

  fields: TFields;
}

/**
 * Type guard for GroupField with proper type narrowing
 * After this guard, TypeScript knows the field is a GroupField and can access its properties safely
 */
export function isGroupField(field: FieldDef<Record<string, unknown>>): field is GroupField {
  return field.type === 'group' && 'fields' in field;
}

export type GroupComponent<T extends any[]> = FieldComponent<GroupField<T>>;
