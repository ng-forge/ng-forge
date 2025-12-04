import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Special form-state conditions for button disabled logic.
 *
 * These conditions evaluate form or page-level state rather than field values,
 * and are primarily used for controlling button disabled states.
 *
 * @example
 * ```typescript
 * // Disable submit button when form is invalid or submitting
 * {
 *   key: 'submit',
 *   type: 'submit',
 *   label: 'Submit',
 *   logic: [
 *     { type: 'disabled', condition: 'formInvalid' },
 *     { type: 'disabled', condition: 'formSubmitting' },
 *   ]
 * }
 *
 * // Disable next button when current page is invalid
 * nextButton({
 *   key: 'next',
 *   label: 'Next',
 *   logic: [
 *     { type: 'disabled', condition: 'pageInvalid' },
 *   ]
 * })
 * ```
 *
 * @public
 */
export type FormStateCondition =
  /** True when form.valid() === false */
  | 'formInvalid'
  /** True when form.submitting() === true */
  | 'formSubmitting'
  /** True when fields on the current page are invalid (for paged forms) */
  | 'pageInvalid';

/**
 * Configuration for conditional field logic.
 *
 * Defines how field behavior changes based on conditions.
 * Supports hiding, disabling, making readonly, or requiring fields
 * based on form state or field values.
 *
 * @example
 * ```typescript
 * // Hide email field when contact method is not email
 * {
 *   type: 'hidden',
 *   condition: {
 *     type: 'fieldValue',
 *     fieldPath: 'contactMethod',
 *     operator: 'notEquals',
 *     value: 'email'
 *   }
 * }
 *
 * // Disable button when form is submitting
 * {
 *   type: 'disabled',
 *   condition: 'formSubmitting'
 * }
 * ```
 *
 * @public
 */
export interface LogicConfig {
  /**
   * Logic type identifier.
   *
   * - `hidden`: Hide the field from view (still participates in form state)
   * - `readonly`: Make the field read-only
   * - `disabled`: Disable user interaction
   * - `required`: Make the field required
   */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /**
   * Condition that determines when this logic applies.
   *
   * Can be:
   * - `boolean`: Static value (always applies or never applies)
   * - `ConditionalExpression`: Expression evaluated against field/form values
   * - `FormStateCondition`: Special form/page state check (for buttons)
   *
   * @example
   * ```typescript
   * // Static condition
   * condition: true
   *
   * // Field value condition
   * condition: {
   *   type: 'fieldValue',
   *   fieldPath: 'status',
   *   operator: 'equals',
   *   value: 'locked'
   * }
   *
   * // Form state condition (for buttons)
   * condition: 'formSubmitting'
   * ```
   */
  condition: ConditionalExpression | boolean | FormStateCondition;
}

/**
 * Type guard to check if a condition is a FormStateCondition.
 *
 * @param condition - The condition to check
 * @returns true if the condition is a FormStateCondition
 *
 * @public
 */
export function isFormStateCondition(condition: LogicConfig['condition']): condition is FormStateCondition {
  return typeof condition === 'string' && ['formInvalid', 'formSubmitting', 'pageInvalid'].includes(condition);
}
