import { FieldComponent, FieldDef } from '../base/field-def';
import { GroupAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Groups should contain rows and leaf fields, but NOT pages or other groups.
 * Runtime validation enforces these rules.
 *
 * Note: Groups are container fields and do not support `meta` since they have no native form element.
 */
export interface GroupField<TFields extends readonly GroupAllowedChildren[] = readonly GroupAllowedChildren[]> extends FieldDef<never> {
  type: 'group';

  readonly fields: TFields;

  /** Groups do not have a label property - they are logical containers only **/
  readonly label?: never;

  /** Groups do not support meta - they have no native form element **/
  readonly meta?: never;

  /**
   * Logic configurations for conditional group visibility.
   * Only 'hidden' type logic is supported for groups.
   */
  readonly logic?: ContainerLogicConfig[];
}

/**
 * Type guard for GroupField with proper type narrowing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isGroupField(field: FieldDef<any>): field is GroupField {
  return field.type === 'group' && 'fields' in field;
}

export type GroupComponent<T extends GroupAllowedChildren[]> = FieldComponent<GroupField<T>>;
