import { FieldComponent, FieldDef } from '../base/field-def';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';

/**
 * An array item template is an array of allowed children that defines one OBJECT array item's fields.
 * Used for object arrays where each item is `{ key1: value1, key2: value2, ... }`.
 */
export type ArrayItemTemplate = readonly ArrayAllowedChildren[];

/**
 * An array item definition can be either:
 * - A single field (ArrayAllowedChildren) for PRIMITIVE array items - extracts field value directly
 * - An array of fields (ArrayItemTemplate) for OBJECT array items - merges fields into object
 */
export type ArrayItemDefinition = ArrayAllowedChildren | ArrayItemTemplate;

/** Array field interface for creating dynamic field collections that map to array values. */
export interface ArrayField<TFields extends readonly ArrayItemDefinition[] = readonly ArrayItemDefinition[]> extends FieldDef<never> {
  type: 'array';

  /**
   * Array of item definitions. Each element defines one array item:
   * - Single FieldDef = primitive item (field's value is extracted directly)
   * - Array of FieldDefs = object item (fields are merged into an object)
   * - Empty array `[]` = no initial items (add via buttons with explicit templates)
   * - Items can have different configurations (heterogeneous arrays supported)
   * - Initial values are set via `value` property on each field definition
   */
  readonly fields: TFields;

  /** Array fields do not have a label property * */
  readonly label?: never;

  /** Arrays do not support meta - they have no native form element * */
  readonly meta?: never;

  /**
   * Logic configurations for conditional array visibility.
   * Only 'hidden' type logic is supported for arrays.
   */
  readonly logic?: ContainerLogicConfig[];

  /**
   * Minimum number of items required in the array.
   * Validation fails if the array has fewer items than this value.
   */
  readonly minLength?: number;

  /**
   * Maximum number of items allowed in the array.
   * Validation fails if the array has more items than this value.
   */
  readonly maxLength?: number;
}

/**
 * Type guard for ArrayField with proper type narrowing.
 * Validates that the field is an array type with a fields property that is an array.
 * Fields can contain either single FieldDefs (primitive items) or arrays of FieldDefs (object items).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isArrayField(field: FieldDef<any>): field is ArrayField {
  return field.type === 'array' && 'fields' in field && Array.isArray(field.fields);
}

export type ArrayComponent<T extends ArrayItemTemplate[]> = FieldComponent<ArrayField<T>>;

/** Configuration for auto-generated add/remove buttons in simplified array fields. */
export interface ArrayButtonConfig {
  /** Custom label for the button */
  readonly label?: string;
  /** Additional properties passed to the button component */
  readonly props?: Record<string, unknown>;
}

/** Simplified array field interface for common use cases. */
export interface SimplifiedArrayField extends FieldDef<never> {
  type: 'array';

  /**
   * Template defining the structure of a single array item.
   * - Single field (ArrayAllowedChildren) → primitive array (each item is a single value)
   * - Array of fields (readonly ArrayAllowedChildren[]) → object array (each item is an object)
   */
  readonly template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];

  /** Initial values for the array. Each element creates one array item. */
  readonly value?: readonly unknown[];

  /**
   * Configuration for the auto-generated "Add" button, or `false` to disable it.
   * Defaults to a button with label "Add".
   */
  readonly addButton?: ArrayButtonConfig | false;

  /**
   * Configuration for the auto-generated "Remove" button on each item, or `false` to disable it.
   * Defaults to a button with label "Remove".
   */
  readonly removeButton?: ArrayButtonConfig | false;

  /** Simplified arrays do not support the label property */
  readonly label?: never;

  /** Simplified arrays do not support meta */
  readonly meta?: never;

  /**
   * Logic configurations for conditional array visibility.
   * Only 'hidden' type logic is supported for arrays.
   */
  readonly logic?: ContainerLogicConfig[];

  /**
   * Minimum number of items required in the array.
   * Validation fails if the array has fewer items than this value.
   */
  readonly minLength?: number;

  /**
   * Maximum number of items allowed in the array.
   * Validation fails if the array has more items than this value.
   */
  readonly maxLength?: number;

  /** Mutually exclusive with `template` — use `fields` for the full API instead */
  readonly fields?: never;
}

/**
 * Type guard for SimplifiedArrayField.
 * Checks for `type: 'array'` with a `template` property (discriminant from full ArrayField).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isSimplifiedArrayField(field: FieldDef<any>): field is SimplifiedArrayField {
  return field.type === 'array' && 'template' in field;
}
