import { FieldDef, GroupField, PageField, RowField } from '../../definitions';

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
  row: RowField<readonly FieldDef<Record<string, unknown>>[]>;
  group: GroupField<readonly FieldDef<Record<string, unknown>>[]>;
  page: PageField<readonly FieldDef<Record<string, unknown>>[]>;
}

/**
 * Union type of all registered field definitions
 */
export type RegisteredFieldTypes = DynamicFormFieldRegistry[keyof DynamicFormFieldRegistry];

/**
 * Extract field types that are available in the registry
 */
export type AvailableFieldTypes = keyof DynamicFormFieldRegistry;
