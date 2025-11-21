import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './types';
import { SchemaDefinition } from './schemas';
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
   * @value {}
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
   * @value false
   */
  validateOnChange?: boolean;

  /**
   * Enable validation on field blur.
   *
   * When enabled, form fields are validated when they lose focus,
   * providing validation feedback after user interaction.
   *
   * @value true
   */
  validateOnBlur?: boolean;

  /**
   * Disable the entire form.
   *
   * When enabled, all form fields become read-only and cannot
   * be modified by user interaction.
   *
   * @value false
   */
  disabled?: boolean;
}
