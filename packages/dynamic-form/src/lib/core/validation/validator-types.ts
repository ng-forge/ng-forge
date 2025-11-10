import { FieldContext, ValidationError } from '@angular/forms/signals';

/**
 * Simple custom validator function signature
 * Takes field value and entire form value, returns validation error or null
 *
 * This is the simplest form of custom validation - use when you only need
 * access to the current field value and the entire form value.
 *
 * @example
 * ```typescript
 * const noSpaces: SimpleCustomValidator<string> = (value, formValue) => {
 *   if (typeof value === 'string' && value.includes(' ')) {
 *     return { kind: 'noSpaces', message: 'Spaces not allowed' };
 *   }
 *   return null;
 * };
 * ```
 */
export type SimpleCustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

/**
 * Context-aware validator function signature
 * Takes FieldContext (full Angular context) and optional params, returns validation error or null
 *
 * Use this when you need access to:
 * - Field state (errors, touched, dirty, etc.)
 * - Other fields in the form (via ctx.root() or ctx.parent())
 * - Field metadata
 * - Parameters from JSON configuration
 *
 * @example
 * ```typescript
 * const lessThanField: ContextAwareValidator<number> = (ctx, params) => {
 *   const value = ctx.value();
 *   const otherFieldName = params?.field as string;
 *   const otherValue = ctx.root()[otherFieldName]?.value();
 *
 *   if (otherValue !== undefined && value >= otherValue) {
 *     return {
 *       kind: 'notLessThan',
 *       message: `Must be less than ${otherFieldName}`
 *     };
 *   }
 *   return null;
 * };
 * ```
 */
export type ContextAwareValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationError | null;

/**
 * Tree validator function signature for cross-field validation
 * Can return errors with optional field targets for cross-field validation
 *
 * Use this when you need to validate relationships between multiple fields
 * in a form or group. Tree validators can return errors targeting specific
 * child fields.
 *
 * @example
 * ```typescript
 * const passwordsMatch: TreeValidator = (ctx) => {
 *   const password = ctx.password?.value();
 *   const confirmPassword = ctx.confirmPassword?.value();
 *
 *   if (password && confirmPassword && password !== confirmPassword) {
 *     // Return error with field target
 *     return {
 *       field: ctx.confirmPassword,
 *       kind: 'passwordMismatch',
 *       message: 'Passwords must match'
 *     };
 *   }
 *   return null;
 * };
 * ```
 */
export type TreeValidator<TModel = unknown> = (
  ctx: FieldContext<TModel>,
  params?: Record<string, unknown>
) => ValidationError | ValidationError[] | null;
