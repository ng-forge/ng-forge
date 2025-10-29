export { DynamicForm } from './dynamic-form.component';
export { FieldRendererDirective } from './directives/dynamic-form.directive';

// Schema interfaces and types (now integrated into FormConfig)
import type { DynamicFormSchemaDefinition } from './models/field-config';

export type { DynamicFormSchemaDefinition, SchemaMetadata } from './models/field-config';

export { buildValidationRules } from './models/field-config';

// Core interfaces and types - clean signal forms API
export type {
  FieldDef,
  FormConfig,
  ValidationRules,
  ValidationError,
  ValidationMessages,
  FieldState,
  FormState,
  ConditionalRules,
  CustomValidator,
  InferFormValue,
  FormOptions,
  FieldTypeDefinition,
  FieldWrapperDefinition,
} from './models';

// Builder functions for type-safe form definitions
export { defineField, defineForm, createFormSchema } from './models';

// Provider system for dependency injection
export { provideDynamicForm, withConfig, type ProvidedFormResult, type DynamicFormFeature, type DynamicFormConfig } from './providers';

// Field registry for custom field types
export { FieldRegistry } from './core/field-registry';

// Field interfaces for custom field fields
export * from './definitions';

// Field fields
export * from './fields';

// Events
export * from './events';

// Type helpers
export type InferSchemaFormValue<T extends DynamicFormSchemaDefinition> = T extends DynamicFormSchemaDefinition ? T['fieldDefs'] : unknown;
