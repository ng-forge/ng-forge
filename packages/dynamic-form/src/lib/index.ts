// Core components following Angular Architects pattern
export { DynamicForm } from './dynamic-form.component';
export { TypedDynamicForm } from './typed-dynamic-form.component';

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
} from './models';

// Builder functions for type-safe form definitions
export { defineField, defineForm, createFormSchema } from './models';

// Provider system for dependency injection
export { provideDynamicForm, withConfig, type ProvidedFormResult, type DynamicFormFeature, type DynamicFormConfig } from './providers';

// Field registry for custom field types
export { FieldRegistry } from './core/field-registry';

// Signal-based form state management
export { SignalFormState } from './core/signal-form-state';

// Field interfaces for custom field components
export * from './fields';
