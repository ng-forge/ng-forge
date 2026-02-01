import { EnvironmentProviders, inject, makeEnvironmentProviders, Provider } from '@angular/core';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from './built-in-fields';
import { FieldDef } from '../definitions/base/field-def';
import { DynamicFormFeature, isDynamicFormFeature } from './features/dynamic-form-feature';
import { DynamicFormLogger } from './features/logger/logger.token';
import { ConsoleLogger } from './features/logger/console-logger';
import type { InferFormValue as RealInferFormValue } from '../models/types/form-value-inference';

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
 * Infer form value type from field definitions using the real inference type.
 */
type InferFormValue<TFieldDefs extends FieldDef<unknown>[]> = RealInferFormValue<TFieldDefs>;

/**
 * Provider result with type inference
 */
type ProvideDynamicFormResult<T extends FieldTypeDefinition[]> = EnvironmentProviders & {
  __fieldDefs?: FieldDefUnion<T>;
  __formValue?: InferFormValue<FieldDefUnion<T>[]>;
};

/**
 * Union type for items that can be passed to provideDynamicForm
 */
type FieldTypeOrFeature = FieldTypeDefinition | DynamicFormFeature;

/**
 * Extract only FieldTypeDefinition items from a tuple type
 */
type ExtractFieldTypes<T extends FieldTypeOrFeature[]> = {
  [K in keyof T]: T[K] extends FieldTypeDefinition ? T[K] : never;
}[number] extends infer U
  ? U extends FieldTypeDefinition
    ? U[]
    : never
  : never;

/**
 * Provider function to configure the dynamic form system with field types and options.
 *
 * This function creates environment providers that can be used at application or route level
 * to register field types. It provides type-safe field registration with automatic type inference.
 *
 * @param items - Field type definitions and/or features (like withLoggerConfig)
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
 * // Disable logging
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(
 *       ...withMaterialFields(),
 *       withLoggerConfig(false)
 *     )
 *   ]
 * });
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
export function provideDynamicForm<const T extends FieldTypeOrFeature[]>(
  ...items: T
): ProvideDynamicFormResult<ExtractFieldTypes<T> extends FieldTypeDefinition[] ? ExtractFieldTypes<T> : FieldTypeDefinition[]> {
  // Separate field types from features
  const fieldTypes = items.filter((item): item is FieldTypeDefinition => !isDynamicFormFeature(item));
  const features = items.filter(isDynamicFormFeature);

  const fields = [...BUILT_IN_FIELDS, ...fieldTypes];

  // Extract config providers from field type arrays
  const configProviders: Provider[] = [];
  fieldTypes.forEach((fieldTypeArray) => {
    const fieldTypeWithConfig = fieldTypeArray as unknown as FieldTypeDefinitionsWithConfig;
    if (fieldTypeWithConfig.__configProviders) {
      configProviders.push(...fieldTypeWithConfig.__configProviders);
    }
  });

  // Extract providers from features
  const featureProviders: Provider[] = [];
  const hasLoggerFeature = features.some((feature) => feature.ɵkind === 'logger');
  features.forEach((feature) => {
    featureProviders.push(...feature.ɵproviders);
  });

  // Default logger provider (ConsoleLogger) if no logger feature was provided
  const defaultLoggerProvider: Provider[] = hasLoggerFeature ? [] : [{ provide: DynamicFormLogger, useValue: new ConsoleLogger() }];

  return makeEnvironmentProviders([
    ...defaultLoggerProvider,
    // Always provide default Signal Forms classes (ng-touched, ng-invalid, etc.)
    provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
    {
      provide: FIELD_REGISTRY,
      useFactory: () => {
        const logger = inject(DynamicFormLogger);
        const registry = new Map();
        // Add custom field types
        fields.forEach((fieldType) => {
          if (registry.has(fieldType.name)) {
            logger.warn(`Field type "${fieldType.name}" is already registered. Overwriting.`);
          }
          registry.set(fieldType.name, fieldType);
        });
        return registry;
      },
    },
    ...configProviders,
    ...featureProviders,
  ]) as ProvideDynamicFormResult<ExtractFieldTypes<T> extends FieldTypeDefinition[] ? ExtractFieldTypes<T> : FieldTypeDefinition[]>;
}

/**
 * Extract FieldDef types from provider result
 */
export type ExtractFieldDefs<T> = T extends { __fieldDefs?: infer F } ? F : never;

/**
 * Extract form value type from provider result
 */
export type ExtractFormValue<T> = T extends { __formValue?: infer V } ? V : never;
