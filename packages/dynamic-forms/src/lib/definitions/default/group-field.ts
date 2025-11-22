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
export interface GroupField<TFields extends readonly GroupAllowedChildren[] = readonly GroupAllowedChildren[]> extends FieldDef<never> {
  type: 'group';

  readonly fields: TFields;

  /** Array fields do not have a label property **/
  readonly label?: undefined;
}

/**
 * Type guard for GroupField with proper type narrowing
 */
export function isGroupField(field: FieldDef<any>): field is GroupField {
  return field.type === 'group' && 'fields' in field;
}

export type GroupComponent<T extends GroupAllowedChildren[]> = FieldComponent<GroupField<T>>;
