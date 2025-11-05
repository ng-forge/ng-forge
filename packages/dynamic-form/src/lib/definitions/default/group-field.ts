import { FieldComponent, FieldDef } from '../base';
import { GroupAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Groups should contain rows and leaf fields, but NOT pages or other groups.
 * Runtime validation enforces these rules.
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

export type GroupComponent<T extends GroupAllowedChildren[]> = FieldComponent<GroupField<T>>;
