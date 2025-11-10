import { FieldContext, ValidationError } from '@angular/forms/signals';

/**
 * Simple custom validator function signature
 *
 * Takes field value and entire form value, returns validation error or null.
 * This is the simplest form of custom validation - use when you only need
 * access to the current field value and the entire form value.
 *
 * **Best Practice - Return Only Error Kind:**
 * Validators should focus on validation logic, not presentation.
 * Return just the error `kind` and configure messages at field level for i18n support.
 *
 * @example
 * ```typescript
 * // ✅ RECOMMENDED: Return only kind, configure message at field level
 * const noSpaces: SimpleCustomValidator<string> = (value) => {
 *   if (typeof value === 'string' && value.includes(' ')) {
 *     return { kind: 'noSpaces' };  // No hardcoded message
 *   }
 *   return null;
 * };
 *
 * // Field configuration with message
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }],
 *   validationMessages: {
 *     noSpaces: 'Spaces are not allowed'  // Or Observable/Signal for i18n
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // ⚠️ ACCEPTABLE: Include fallback message (can be overridden at field level)
 * const noSpaces: SimpleCustomValidator<string> = (value) => {
 *   if (typeof value === 'string' && value.includes(' ')) {
 *     return { kind: 'noSpaces', message: 'Spaces not allowed' };  // Fallback
 *   }
 *   return null;
 * };
 * ```
 *
 * **Message Resolution Priority (STRICT):**
 * 1. Field-level `validationMessages[kind]` (highest - allows per-field customization)
 * 2. ValidatorConfig `errorMessage` (per-validator inline)
 * 3. **No message configured = Warning logged + error NOT displayed**
 *
 * Note: Validator-returned messages are NOT used. All messages MUST be configured.
 */
export type SimpleCustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

/**
 * Context-aware validator function signature
 *
 * Takes FieldContext (full Angular context) and optional params, returns validation error or null.
 * Provides access to field state, form hierarchy, and other fields for complex validation logic.
 *
 * **Use this when you need access to:**
 * - Field state (errors, touched, dirty, etc.)
 * - Other fields in the form (via ctx.root() or ctx.parent())
 * - Field metadata
 * - Parameters from JSON configuration
 *
 * **Best Practice - Return Only Error Kind:**
 * @example
 * ```typescript
 * // ✅ RECOMMENDED: Return only kind, use field config for messages
 * const lessThanField: ContextAwareValidator<number> = (ctx, params) => {
 *   const value = ctx.value();
 *   const otherFieldName = params?.field as string;
 *   const rootValue = ctx.root()().value() as Record<string, unknown>;
 *   const otherValue = rootValue[otherFieldName];
 *
 *   if (otherValue !== undefined && value >= otherValue) {
 *     return { kind: 'notLessThan' };  // No hardcoded message
 *   }
 *   return null;
 * };
 *
 * // Field configuration with parameterized message
 * {
 *   validators: [{
 *     type: 'custom',
 *     functionName: 'lessThanField',
 *     params: { field: 'maxAge' }
 *   }],
 *   validationMessages: {
 *     notLessThan: 'Must be less than {{field}}'  // Interpolates params
 *   }
 * }
 * ```
 *
 * **Message Resolution Priority (STRICT):**
 * 1. Field-level `validationMessages[kind]` (highest)
 * 2. ValidatorConfig `errorMessage`
 * 3. **No message configured = Warning logged + error NOT displayed**
 *
 * Note: Validator-returned messages are NOT used. All messages MUST be configured.
 */
export type ContextAwareValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationError | null;

/**
 * Tree validator function signature for cross-field validation
 *
 * Validates relationships between multiple fields and can return single or multiple errors.
 * Use this when you need to validate relationships between multiple fields in a form or group.
 * Tree validators can return errors targeting specific child fields.
 *
 * **Best Practice - Return Only Error Kind:**
 * @example
 * ```typescript
 * // ✅ RECOMMENDED: Return only kind for single error
 * const passwordsMatch: TreeValidator = (ctx) => {
 *   const form = ctx.value() as Record<string, unknown>;
 *   const password = form.password;
 *   const confirmPassword = form.confirmPassword;
 *
 *   if (password && confirmPassword && password !== confirmPassword) {
 *     return { kind: 'passwordMismatch' };  // No hardcoded message
 *   }
 *   return null;
 * };
 *
 * // Configure message at group/field level
 * {
 *   key: 'credentials',
 *   type: 'group',
 *   validators: [{ type: 'customTree', functionName: 'passwordsMatch' }],
 *   validationMessages: {
 *     passwordMismatch: 'Passwords must match'
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // ✅ RECOMMENDED: Return multiple error kinds
 * const validateAddress: TreeValidator = (ctx) => {
 *   const form = ctx.value() as Record<string, unknown>;
 *   const errors: ValidationError[] = [];
 *
 *   if (!form.street) errors.push({ kind: 'streetRequired' });
 *   if (!form.city) errors.push({ kind: 'cityRequired' });
 *
 *   return errors.length > 0 ? errors : null;
 * };
 *
 * // Configure messages at group level
 * {
 *   validationMessages: {
 *     streetRequired: 'Street address is required',
 *     cityRequired: 'City is required'
 *   }
 * }
 * ```
 *
 * **Message Resolution Priority (STRICT):**
 * 1. Field-level `validationMessages[kind]` (highest)
 * 2. ValidatorConfig `errorMessage` (single message for validator)
 * 3. **No message configured = Warning logged + error NOT displayed**
 *
 * Note: Validator-returned messages are NOT used. All messages MUST be configured.
 */
export type TreeValidator<TModel = unknown> = (
  ctx: FieldContext<TModel>,
  params?: Record<string, unknown>
) => ValidationError | ValidationError[] | null;
