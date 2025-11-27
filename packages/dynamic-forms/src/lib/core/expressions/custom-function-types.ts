import { EvaluationContext } from '../../models/expressions/evaluation-context';

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
