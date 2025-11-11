import { FieldComponent, FieldDef } from '../base';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Array field interface for creating field collections that map to array values
 * Arrays create nested form structures where child field values are collected into an array
 * This is a programmatic grouping only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Arrays should contain rows and leaf fields, but NOT pages or other arrays.
 * Runtime validation enforces these rules.
 */
export interface ArrayField<TFields extends ArrayAllowedChildren[] = ArrayAllowedChildren[]> extends FieldDef<never> {
  /** Field type identifier */

  fields: TFields;
}

/**
 * Type guard for ArrayField with proper type narrowing
 * After this guard, TypeScript knows the field is an ArrayField and can access its properties safely
 */
export function isArrayField(field: FieldDef<any>): field is ArrayField {
  return field.type === 'array' && 'fields' in field;
}

export type ArrayComponent<T extends ArrayAllowedChildren[]> = FieldComponent<ArrayField<T>>;
