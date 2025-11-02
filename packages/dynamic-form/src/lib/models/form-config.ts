import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './types';
import { SchemaDefinition } from './schemas';
import { EvaluationContext } from './expressions';

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
 * @since 1.0.0
 */
export interface FormConfig<
  TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[],
  TValue = InferFormValue<TFields>
> {
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
  readonly fields: TFields;
  
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
  readonly schema?: Schema<TValue>;
  
  /**
   * Global form configuration options.
   * 
   * Controls form-wide behavior like validation timing and disabled state.
   * 
   * @defaultValue {}
   */
  readonly options?: FormOptions;

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
  readonly schemas?: SchemaDefinition[];

  /**
   * Signal forms adapter configuration.
   * 
   * Advanced configuration for signal forms behavior including
   * legacy migration and custom expression functions.
   */
  readonly signalFormsConfig?: SignalFormsConfig;
}

/**
 * Signal forms adapter configuration for advanced form behavior.
 * 
 * Provides configuration options for signal forms integration including
 * legacy migration, custom functions, and validation behavior.
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
 *   }
 * }
 * ```
 * 
 * @public
 * @since 1.0.0
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
   * Custom evaluation functions for expressions.
   * 
   * Functions that can be called within field expressions for
   * conditional logic, computed values, and custom validation.
   * 
   * @example
   * ```typescript
   * customFunctions: {
   *   calculateAge: (context) => {
   *     const birthDate = new Date(context.birthDate);
   *     return new Date().getFullYear() - birthDate.getFullYear();
   *   }
   * }
   * ```
   */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

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
 * @since 1.0.0
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
  readonly validateOnChange?: boolean;
  
  /**
   * Enable validation on field blur.
   * 
   * When enabled, form fields are validated when they lose focus,
   * providing validation feedback after user interaction.
   * 
   * @defaultValue true
   */
  readonly validateOnBlur?: boolean;
  
  /**
   * Disable the entire form.
   * 
   * When enabled, all form fields become read-only and cannot
   * be modified by user interaction.
   * 
   * @defaultValue false
   */
  readonly disabled?: boolean;
}
