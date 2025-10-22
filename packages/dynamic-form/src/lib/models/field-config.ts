import { Signal } from '@angular/core';
import { UnwrapField } from '../utils';
import { FormUiControl } from '@angular/forms/signals';

/**
 * Field definition following Angular Architects signal forms pattern
 * Clean, minimal interface inspired by the example implementation
 */
export interface FieldDef<TKey extends string = string, TValue = unknown> extends UnwrapField<FormUiControl> {
  /** Unique field identifier - required for form binding */
  readonly key: TKey;

  /** Field type for component selection (input, select, checkbox, etc.) */
  readonly type: string;

  /** Human-readable field label */
  readonly label: string;

  /** Default field value */
  readonly defaultValue?: TValue;

  /** Validation rules using signal forms pattern */
  readonly validation?: ValidationRules<TValue>;

  /** Field-specific properties (placeholder, options, etc.) */
  readonly props?: Record<string, unknown>;

  /** Conditional field behavior */
  readonly conditionals?: ConditionalRules;

  /** Additional CSS classes */
  readonly className?: string;
}

/**
 * Form configuration containing field definitions
 */
export interface FormConfig<TFields extends readonly FieldDef[] = readonly FieldDef[]> {
  readonly fields: TFields;
  readonly options?: FormOptions;
}

/**
 * Validation rules following Angular Architects pattern
 */
export interface ValidationRules<TValue = unknown> {
  /** Field is required */
  required?: boolean;

  /** Email validation */
  email?: boolean;

  /** Minimum value for numbers */
  min?: number;

  /** Maximum value for numbers */
  max?: number;

  /** Minimum length for strings */
  minLength?: number;

  /** Maximum length for strings */
  maxLength?: number;

  /** Pattern validation */
  pattern?: string | RegExp;

  /** Custom validation functions */
  custom?: CustomValidator<TValue>[];

  /** Custom error messages in user's language */
  messages?: ValidationMessages;
}

/**
 * Custom error messages following Angular Architects approach
 */
export interface ValidationMessages {
  required?: string;
  email?: string;
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  [key: string]: string | undefined;
}

/**
 * Custom validator function following signal forms pattern
 */
export type CustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

/**
 * Validation error structure
 */
export interface ValidationError {
  readonly type: string;
  readonly message: string;
  readonly params?: Record<string, unknown>;
}

/**
 * Conditional field behavior rules
 */
export interface ConditionalRules {
  /** Show field when condition is true */
  show?: (formValue: unknown) => boolean;

  /** Hide field when condition is true */
  hide?: (formValue: unknown) => boolean;

  /** Enable field when condition is true */
  enable?: (formValue: unknown) => boolean;

  /** Disable field when condition is true */
  disable?: (formValue: unknown) => boolean;
}

/**
 * Form options for global form behavior
 */
export interface FormOptions {
  readonly validateOnChange?: boolean;
  readonly validateOnBlur?: boolean;
  readonly disabled?: boolean;
}

/**
 * Field state signals for reactive form management
 */
export interface FieldState<TValue = unknown> {
  readonly value: Signal<TValue>;
  readonly errors: Signal<ValidationError[]>;
  readonly valid: Signal<boolean>;
  readonly touched: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly visible: Signal<boolean>;
}

/**
 * Form state signals for reactive form management
 */
export interface FormState<TValue = unknown> {
  readonly value: Signal<TValue>;
  readonly errors: Signal<ValidationError[]>;
  readonly valid: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly submitted: Signal<boolean>;
  readonly disabled: Signal<boolean>;
}

/**
 * Type inference helper for form values from field definitions
 */
export type InferFormValue<TFields extends readonly FieldDef[]> = {
  readonly [K in TFields[number]['key']]: ExtractFieldValue<Extract<TFields[number], { key: K }>>;
};

/**
 * Extract field value type from field definition
 */
type ExtractFieldValue<TField extends FieldDef> = TField extends FieldDef<string, infer TValue> ? TValue : unknown;

/**
 * Helper function to create strongly typed field definitions
 * Following the pattern from Angular Architects examples
 */
export function defineField<TKey extends string, TValue = unknown>(config: FieldDef<TKey, TValue>): FieldDef<TKey, TValue> {
  return config;
}

/**
 * Helper function to create strongly typed form configurations
 * Following the pattern from Angular Architects examples
 */
export function defineForm<TFields extends readonly FieldDef[]>(config: FormConfig<TFields>): FormConfig<TFields> {
  return config;
}

/**
 * Schema creation helper following Angular Architects pattern
 * This will be used to bridge with Angular signal forms when stable
 */
export function createFormSchema<TFields extends readonly FieldDef[]>(fields: TFields): ValidationRules {
  // This can be enhanced to create actual signal forms schema
  // when Angular signal forms become stable
  return {};
}
