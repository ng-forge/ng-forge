import { BaseCheckedField, BaseValueField, FieldDef } from '../definitions/base';
import { RowField } from '../definitions/default/row-field';
import { GroupField } from '../definitions/default/group-field';

/**
 * Global interface for dynamic form field definitions
 * Users can augment this interface to add their custom field types
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-form' {
 *   interface DynamicFormFieldRegistry {
 *     'my-custom-field': MyCustomFieldDef;
 *     'another-field': AnotherFieldDef;
 *   }
 * }
 * ```
 */
export interface DynamicFormFieldRegistry {
  // Built-in field types will be added here by the library
  row: RowField<readonly FieldDef<Record<string, unknown>>[]>;
  group: GroupField<readonly FieldDef<Record<string, unknown>>[]>;
}

/**
 * Default field types when registry is empty or not fully populated
 */
type DefaultFieldTypes =
  | FieldDef<Record<string, unknown>>
  | BaseValueField<Record<string, unknown>, any>
  | BaseCheckedField<Record<string, unknown>>;

/**
 * Union type of all registered field definitions
 */
export type RegisteredFieldTypes = DynamicFormFieldRegistry[keyof DynamicFormFieldRegistry];

/**
 * Infer form value type from a specific array of field definitions
 */
export type InferFormValue<T extends readonly RegisteredFieldTypes[]> = {
  [K in T[number] as K['key']]: K extends BaseValueField<any, infer TValue>
    ? K['required'] extends true
      ? TValue
      : TValue | undefined
    : K extends BaseCheckedField<any>
    ? K['required'] extends true
      ? boolean
      : boolean | undefined
    : unknown;
};

/**
 * Infer form value type from registered field definitions (legacy)
 */
export type InferGlobalFormValue = RegisteredFieldTypes extends FieldDef<Record<string, unknown>>
  ? {
      [K in RegisteredFieldTypes['key']]: any; // TODO: extract actual value type from field
    }
  : Record<string, unknown>;

/**
 * Extract field types that are available in the registry
 */
export type AvailableFieldTypes = keyof DynamicFormFieldRegistry;
