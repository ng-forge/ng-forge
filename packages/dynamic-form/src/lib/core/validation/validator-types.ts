import { FieldContext, ValidationError } from '@angular/forms/signals';

/**
 * Custom validator function signature using Angular's public FieldContext API
 *
 * Takes FieldContext (full Angular context) and optional params, returns validation error(s) or null.
 * Provides access to field state, form hierarchy, and other fields for validation logic.
 *
 * **Use FieldContext public APIs to access:**
 * - Current field value: `ctx.value()`
 * - Field state: `ctx.state` (errors, touched, dirty, etc.)
 * - Other field values: `ctx.valueOf(path)` where path is a FieldPath
 * - Other field states: `ctx.stateOf(path)`
 * - Other fields: `ctx.fieldOf(path)`
 * - Current field tree: `ctx.field`
 *
 * **Return Types:**
 * - Single error: `{ kind: 'errorKind' }` for field-level validation
 * - Multiple errors: `[{ kind: 'error1' }, { kind: 'error2' }]` for cross-field validation
 * - No error: `null` when validation passes
 *
 * **Best Practice - Return Only Error Kind:**
 * Validators should focus on validation logic, not presentation.
 * Return just the error `kind` and configure messages at field level for i18n support.
 *
 * @example Single Field Validation
 * ```typescript
 * const noSpaces: CustomValidator<string> = (ctx) => {
 *   const value = ctx.value();
 *   if (typeof value === 'string' && value.includes(' ')) {
 *     return { kind: 'noSpaces' };
 *   }
 *   return null;
 * };
 *
 * // Field configuration
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }],
 *   validationMessages: {
 *     noSpaces: 'Spaces are not allowed'
 *   }
 * }
 * ```
 *
 * @example Cross-Field Validation with valueOf()
 * ```typescript
 * // Compare two fields using public API
 * const lessThan: CustomValidator<number> = (ctx, params) => {
 *   const value = ctx.value();
 *   const compareToPath = params?.field as string;
 *
 *   // Use valueOf() to access other field - public API!
 *   const otherValue = ctx.valueOf(compareToPath as any);
 *
 *   if (otherValue !== undefined && value >= otherValue) {
 *     return { kind: 'notLessThan' };
 *   }
 *   return null;
 * };
 * ```
 *
 * @example Multiple Errors (Cross-Field Validation)
 * ```typescript
 * const validateDateRange: CustomValidator = (ctx) => {
 *   const errors: ValidationError[] = [];
 *
 *   const startDate = ctx.valueOf('startDate' as any);
 *   const endDate = ctx.valueOf('endDate' as any);
 *
 *   if (!startDate) errors.push({ kind: 'startDateRequired' });
 *   if (!endDate) errors.push({ kind: 'endDateRequired' });
 *   if (startDate && endDate && startDate > endDate) {
 *     errors.push({ kind: 'invalidDateRange' });
 *   }
 *
 *   return errors.length > 0 ? errors : null;
 * };
 * ```
 *
 * **Message Resolution Priority:**
 * 1. Field-level `validationMessages[kind]` (highest priority - per-field customization)
 * 2. Form-level `defaultValidationMessages[kind]` (fallback for common messages)
 * 3. **No message configured = Warning logged + error NOT displayed**
 *
 * **Important:** Validator-returned messages are NOT used. All messages MUST be explicitly configured.
 *
 * @template TValue The type of value stored in the field being validated
 */
export type CustomValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationError | ValidationError[] | null;
