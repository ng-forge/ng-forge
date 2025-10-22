// Field types
export * from './field-type';

// Core interfaces following Angular Architects signal forms patterns
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
} from './field-config';

// Builder functions for type-safe form definitions
export { defineField, defineForm, createFormSchema } from './field-config';
