import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from './built-in-fields';
import { FieldDef } from '../definitions/base';

// Re-export global types for module augmentation
export type { DynamicFormFieldRegistry, AvailableFieldTypes } from '../models/registry';
export type { RegisteredFieldTypes } from '../models/types';

/**
 * Field type definitions with optional config providers
 */
type FieldTypeDefinitionsWithConfig = FieldTypeDefinition[] & {
  __configProviders?: Provider[];
};

/**
 * Extract FieldDef type from FieldTypeDefinition
 */
type ExtractFieldDef<T> = T extends FieldTypeDefinition<infer F> ? F : never;

/**
 * Union of all FieldDef types from provided field types
 */
type FieldDefUnion<T extends FieldTypeDefinition[]> = ExtractFieldDef<T[number]>;

/**
 * Infer form value type from field definitions
 */
type InferFormValue<TFieldDefs extends FieldDef<any>[]> = {
  [K in TFieldDefs[number]['key']]: any; // TODO: extract actual value type from field
};

/**
 * Provider result with type inference
 */
type ProvideDynamicFormResult<T extends FieldTypeDefinition[]> = EnvironmentProviders & {
  __fieldDefs?: FieldDefUnion<T>;
  __formValue?: InferFormValue<FieldDefUnion<T>[]>;
};

/**
 * Provider function to configure the dynamic form system with field types and options.
 *
 * This function creates environment providers that can be used at application or route level
 * to register field types. It provides type-safe field registration with automatic type inference.
 *
 * @param fieldTypes - Custom field type definitions to register alongside built-in types
 * @returns Environment providers for dependency injection with type inference
 *
 * @example
 * ```typescript
 * // Application-level setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields())
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Route-level setup
 * const routes: Routes = [
 *   {
 *     path: 'form',
 *     component: FormComponent,
 *     providers: [provideDynamicForm(...withMaterialFields())]
 *   }
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // Custom field types with type inference
 * import { CustomFieldType, AnotherFieldType } from './custom-fields';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(CustomFieldType, AnotherFieldType)
 *   ]
 * };
 * ```
 *
 * @typeParam T - Array of field type definitions for type inference
 *
 * @public
 */
export function provideDynamicForm<const T extends FieldTypeDefinition[]>(...fieldTypes: T): ProvideDynamicFormResult<T> {
  const fields = [...BUILT_IN_FIELDS, ...fieldTypes];

  // Extract config providers from field type arrays
  const configProviders: Provider[] = [];
  fieldTypes.forEach((fieldTypeArray) => {
    const fieldTypeWithConfig = fieldTypeArray as unknown as FieldTypeDefinitionsWithConfig;
    if (fieldTypeWithConfig.__configProviders) {
      configProviders.push(...fieldTypeWithConfig.__configProviders);
    }
  });

  return makeEnvironmentProviders([
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
    ...configProviders,
  ]) as ProvideDynamicFormResult<T>;
}

/**
 * Extract FieldDef types from provider result
 */
export type ExtractFieldDefs<T> = T extends { __fieldDefs?: infer F } ? F : never;

/**
 * Extract form value type from provider result
 */
export type ExtractFormValue<T> = T extends { __formValue?: infer V } ? V : never;
