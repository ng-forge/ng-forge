import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from './built-in-fields';
import { FieldDef } from '../definitions/base';

// Re-export global types for module augmentation
export type { DynamicFormFieldRegistry, AvailableFieldTypes } from '../models/registry';
export type { RegisteredFieldTypes, InferGlobalFormValue } from '../models/types';

/**
 * Extract FieldDef type from FieldTypeDefinition
 */
type ExtractFieldDef<T> = T extends FieldTypeDefinition<infer F> ? F : never;

/**
 * Union of all FieldDef types from provided field types
 */
type FieldDefUnion<T extends readonly FieldTypeDefinition[]> = ExtractFieldDef<T[number]>;

/**
 * Infer form value type from field definitions
 */
type InferFormValue<TFieldDefs extends FieldDef<Record<string, unknown>>[]> = {
  [K in TFieldDefs[number]['key']]: any; // TODO: extract actual value type from field
};

/**
 * Provider result with type inference
 */
type ProvideDynamicFormResult<T extends readonly FieldTypeDefinition[]> = EnvironmentProviders & {
  __fieldDefs?: FieldDefUnion<T>;
  __formValue?: InferFormValue<FieldDefUnion<T>[]>;
};

/**
 * Provider function to configure the dynamic form system with field types and options.
 *
 * This function should be called in your application's bootstrap providers array
 * to register built-in field types and configure global form behavior. It provides
 * type-safe field registration with automatic type inference.
 *
 * @param fieldTypes - Custom field type definitions to register alongside built-in types
 * @returns Array of Angular providers for dependency injection with type inference
 *
 * @example
 * ```typescript
 * // Basic setup with built-in fields only
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm()
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Custom field types with type inference
 * import { CustomFieldType, AnotherFieldType } from './custom-fields';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(CustomFieldType, AnotherFieldType),
 *     // Other providers...
 *   ]
 * });
 *
 * // Form configuration now has access to custom types
 * const config: FormConfig = {
 *   fields: [
 *     { type: 'custom-input', key: 'customField' }, // Type-safe!
 *     { type: 'another-field', key: 'anotherField' }
 *   ]
 * };
 * ```
 *
 * @typeParam T - Array of field type definitions for type inference
 *
 * @public
 */
export function provideDynamicForm<const T extends readonly FieldTypeDefinition[]>(...fieldTypes: T): ProvideDynamicFormResult<T> {
  const fields = [...BUILT_IN_FIELDS, ...fieldTypes];

  const providers: Provider[] = [
    {
      provide: FIELD_REGISTRY,
      useFactory: () => {
        const registry = new Map();
        // Add custom field types
        fields.forEach((fieldType) => {
          if (registry.has(fieldType.name)) {
            console.warn(`Field type "${fieldType.name}" is already registered. Overwriting.`);
          }
          registry.set(fieldType.name, fieldType);
        });
        return registry;
      },
    },
  ];

  return makeEnvironmentProviders(providers) as ProvideDynamicFormResult<T>;
}

/**
 * Extract FieldDef types from provider result
 */
export type ExtractFieldDefs<T> = T extends { __fieldDefs?: infer F } ? F : never;

/**
 * Extract form value type from provider result
 */
export type ExtractFormValue<T> = T extends { __formValue?: infer V } ? V : never;
