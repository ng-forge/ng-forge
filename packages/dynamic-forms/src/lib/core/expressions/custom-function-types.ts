import { EvaluationContext } from '../../models/expressions/evaluation-context';

/**
 * Scope of a custom function.
 *
 * - `'field'`: Function only uses `fieldValue` (the current field's value).
 *              These functions are evaluated at field-level for better performance.
 * - `'form'`: Function may use `formValue` (access to other fields).
 *             These functions are hoisted to form-level evaluation.
 *
 * Default: `'form'` (conservative - assumes function may access other fields)
 */
export type CustomFunctionScope = 'field' | 'form';

/**
 * Options for registering a custom function.
 */
export interface CustomFunctionOptions {
  /**
   * The scope of the function.
   *
   * - `'field'`: Function only uses `fieldValue` (no cross-field dependencies).
   *              Use this when your function only reads the current field's value.
   * - `'form'`: Function may use `formValue` (has cross-field dependencies).
   *             This is the default, and ensures proper reactivity when accessing
   *             other fields in the form.
   *
   * @default 'form'
   *
   * @example
   * ```typescript
   * // Field-only function - only uses the current field value
   * registry.registerCustomFunction('isEmpty', (ctx) => !ctx.fieldValue, { scope: 'field' });
   *
   * // Form-level function - accesses other fields (default)
   * registry.registerCustomFunction('isAdult', (ctx) => ctx.formValue.age >= 18);
   * ```
   */
  scope?: CustomFunctionScope;
}

/**
 * Custom function signature for conditional expressions
 *
 * Custom functions are used for conditional logic in:
 * - `when` conditions (field visibility, conditional validation)
 * - `readonly` logic (dynamic readonly state)
 * - `disabled` logic (dynamic disabled state)
 * - Dynamic value calculations
 *
 * Unlike validators, custom functions:
 * - Return any value (typically boolean for conditions, but could be strings, numbers, etc.)
 * - Do NOT return ValidationError objects
 * - Receive EvaluationContext (field values) not FieldContext (field state)
 *
 * @example
 * ```typescript
 * // Boolean condition function
 * const isAdult: CustomFunction = (ctx) => {
 *   return ctx.age >= 18;
 * };
 *
 * // Used in field configuration:
 * {
 *   key: 'alcoholPreference',
 *   type: 'select',
 *   when: { function: 'isAdult' }  // Only show if isAdult returns true
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Calculation function
 * const calculateDiscount: CustomFunction = (ctx) => {
 *   const price = ctx.price || 0;
 *   const isVip = ctx.isVip || false;
 *   return isVip ? price * 0.8 : price * 0.9;
 * };
 * ```
 */
export type CustomFunction = (context: EvaluationContext) => unknown;
