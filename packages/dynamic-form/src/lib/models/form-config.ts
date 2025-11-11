import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './types';
import { SchemaDefinition } from './schemas';
import { ContextAwareValidator, SimpleCustomValidator, TreeValidator } from '../core/validation/validator-types';
import { CustomFunction } from '../core/expressions/custom-function-types';
import { EvaluationContext } from './expressions';
import { ValidationMessages } from './validation-types';

/**
 * Configuration interface for defining dynamic form structure and behavior.
 *
 * This interface defines the complete form schema including field definitions,
 * validation rules, conditional logic, and submission handling using Angular's
 * signal-based reactive forms.
 *
 * @example
 * ```typescript
 * const formConfig: FormConfig = {
 *   fields: [
 *     { type: 'input', key: 'email', label: 'Email', validation: ['required', 'email'] },
 *     { type: 'group', key: 'address', label: 'Address', fields: [
 *       { type: 'input', key: 'street', label: 'Street' },
 *       { type: 'input', key: 'city', label: 'City' }
 *     ]},
 *     { type: 'button', key: 'submit', label: 'Submit', buttonType: 'submit' }
 *   ],
 *   options: { validateOnChange: true },
 *   schemas: [
 *     { name: 'emailSchema', schema: { email: validators.email } }
 *   ]
 * };
 * ```
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TValue - The strongly-typed interface for form values
 *
 * @public
 */
export interface FormConfig<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[], TValue = InferFormValue<TFields>> {
  /**
   * Array of field definitions that define the form structure.
   *
   * Fields are rendered in the order they appear in this array.
   * Supports nested groups and conditional field visibility.
   *
   * @example
   * ```typescript
   * fields: [
   *   { type: 'input', key: 'firstName', label: 'First Name' },
   *   { type: 'group', key: 'address', label: 'Address', fields: [
   *     { type: 'input', key: 'street', label: 'Street' }
   *   ]}
   * ]
   * ```
   */
  fields: TFields;

  /**
   * Optional form-level validation schema.
   *
   * Provides additional validation beyond field-level validation.
   * Useful for cross-field validation rules.
   *
   * @example
   * ```typescript
   * schema: {
   *   passwordConfirm: validators.equals('password')
   * }
   * ```
   */
  schema?: Schema<TValue>;

  /**
   * Global form configuration options.
   *
   * Controls form-wide behavior like validation timing and disabled state.
   *
   * @defaultValue {}
   */
  options?: FormOptions;

  /**
   * Global schemas available to all fields.
   *
   * Reusable validation schemas that can be referenced by field definitions.
   * Promotes consistency and reduces duplication.
   *
   * @example
   * ```typescript
   * schemas: [
   *   { name: 'addressSchema', schema: {
   *     street: validators.required,
   *     zipCode: validators.pattern(/^\d{5}$/)
   *   }}
   * ]
   * ```
   */
  schemas?: SchemaDefinition[];

  /**
   * Form-level validation messages that act as fallback for field-level messages.
   *
   * These messages are used when a field has validation errors but no
   * field-level `validationMessages` are defined for that specific error.
   * This allows you to define common validation messages once at the form level
   * instead of repeating them for each field.
   *
   * @example
   * ```typescript
   * defaultValidationMessages: {
   *   required: 'This field is required',
   *   email: 'Please enter a valid email address',
   *   minLength: 'Must be at least {{requiredLength}} characters'
   * }
   * ```
   */
  defaultValidationMessages?: ValidationMessages;

  /**
   * Signal forms adapter configuration.
   *
   * Advanced configuration for signal forms behavior including
   * legacy migration and custom expression functions.
   */
  signalFormsConfig?: SignalFormsConfig;
}

/**
 * Signal forms adapter configuration for advanced form behavior.
 *
 * Provides configuration options for signal forms integration including
 * legacy migration, custom functions, and custom validators.
 *
 * @example
 * ```typescript
 * signalFormsConfig: {
 *   migrateLegacyValidation: true,
 *   strictMode: false,
 *   customFunctions: {
 *     isAdult: (context) => context.age >= 18,
 *     formatCurrency: (context) => new Intl.NumberFormat('en-US', {
 *       style: 'currency',
 *       currency: 'USD'
 *     }).format(context.value)
 *   },
 *   simpleValidators: {
 *     noSpaces: (value) => {
 *       return typeof value === 'string' && value.includes(' ')
 *         ? { kind: 'noSpaces', message: 'Spaces not allowed' }
 *         : null;
 *     }
 *   },
 *   contextValidators: {
 *     lessThanField: (ctx, params) => {
 *       const value = ctx.value();
 *       const otherField = params?.field as string;
 *       const otherValue = ctx.root()[otherField]?.value();
 *       if (otherValue !== undefined && value >= otherValue) {
 *         return { kind: 'notLessThan', message: `Must be less than ${otherField}` };
 *       }
 *       return null;
 *     }
 *   }
 * }
 * ```
 *
 * @public
 */
export interface SignalFormsConfig {
  /**
   * Enable automatic migration from legacy validation.
   *
   * When enabled, automatically converts legacy Angular reactive forms
   * validation to signal forms validation.
   *
   * @defaultValue false
   */
  migrateLegacyValidation?: boolean;

  /**
   * Custom evaluation functions for conditional expressions.
   *
   * Used for: when/readonly/disabled logic
   * Return type: any value (typically boolean)
   *
   * @example
   * ```typescript
   * customFunctions: {
   *   isAdult: (context) => context.age >= 18,
   *   calculateAge: (context) => {
   *     const birthDate = new Date(context.birthDate);
   *     return new Date().getFullYear() - birthDate.getFullYear();
   *   }
   * }
   * ```
   */
  customFunctions?: Record<string, CustomFunction>;

  /**
   * Simple custom validators (value, formValue) => ValidationError | null
   *
   * Used for: basic validation that only needs field value and form value
   * Return type: ValidationError | null
   *
   * @example
   * ```typescript
   * simpleValidators: {
   *   noSpaces: (value) => {
   *     return typeof value === 'string' && value.includes(' ')
   *       ? { kind: 'noSpaces', message: 'Spaces not allowed' }
   *       : null;
   *   },
   *   minLength3: (value) => {
   *     return typeof value === 'string' && value.length < 3
   *       ? { kind: 'minLength', message: 'Must be at least 3 characters' }
   *       : null;
   *   }
   * }
   * ```
   */
  simpleValidators?: Record<string, SimpleCustomValidator>;

  /**
   * Context-aware validators (ctx, params?) => ValidationError | null
   *
   * Used for: validation that needs access to field state or other fields
   * Return type: ValidationError | null
   *
   * @example
   * ```typescript
   * contextValidators: {
   *   lessThanField: (ctx, params) => {
   *     const value = ctx.value();
   *     const otherField = params?.field as string;
   *     const otherValue = ctx.root()[otherField]?.value();
   *     if (otherValue !== undefined && value >= otherValue) {
   *       return { kind: 'notLessThan', message: `Must be less than ${otherField}` };
   *     }
   *     return null;
   *   }
   * }
   * ```
   */
  contextValidators?: Record<string, ContextAwareValidator>;

  /**
   * Tree validators for cross-field validation (ctx, params?) => ValidationError | ValidationError[] | null
   *
   * Used for: validation relationships between multiple fields
   * Can target errors to specific child fields
   *
   * @example
   * ```typescript
   * treeValidators: {
   *   passwordsMatch: (ctx) => {
   *     const password = ctx.password?.value();
   *     const confirmPassword = ctx.confirmPassword?.value();
   *     if (password && confirmPassword && password !== confirmPassword) {
   *       return {
   *         field: ctx.confirmPassword,
   *         kind: 'passwordMismatch',
   *         message: 'Passwords must match'
   *       };
   *     }
   *     return null;
   *   }
   * }
   * ```
   */
  treeValidators?: Record<string, TreeValidator>;

  /**
   * Strict mode for expression evaluation.
   *
   * When enabled, throws errors for invalid expressions instead of
   * failing silently. Useful for debugging and development.
   *
   * @defaultValue false
   */
  strictMode?: boolean;
}

/**
 * Global form configuration options.
 *
 * Controls form-wide behavior including validation timing,
 * disabled state, and user interaction handling.
 *
 * @example
 * ```typescript
 * options: {
 *   validateOnChange: true,
 *   validateOnBlur: false,
 *   disabled: false
 * }
 * ```
 *
 * @public
 */
export interface FormOptions {
  /**
   * Enable validation on value change.
   *
   * When enabled, form fields are validated immediately when
   * their values change, providing real-time feedback.
   *
   * @defaultValue false
   */
  validateOnChange?: boolean;

  /**
   * Enable validation on field blur.
   *
   * When enabled, form fields are validated when they lose focus,
   * providing validation feedback after user interaction.
   *
   * @defaultValue true
   */
  validateOnBlur?: boolean;

  /**
   * Disable the entire form.
   *
   * When enabled, all form fields become read-only and cannot
   * be modified by user interaction.
   *
   * @defaultValue false
   */
  disabled?: boolean;
}
