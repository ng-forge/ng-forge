import { FieldTree, TreeValidationResult } from '@angular/forms/signals';

/**
 * Configuration for form submission handling.
 *
 * When provided, enables integration with Angular Signal Forms' native `submit()` function.
 * The submission mechanism is **optional** - you can still handle submission manually
 * via the `(submitted)` output if you prefer.
 *
 * @example
 * ```typescript
 * const config: FormConfig = {
 *   fields: [...],
 *   submission: {
 *     action: async (form) => {
 *       const value = form().value();
 *       try {
 *         await this.api.submit(value);
 *         return undefined; // No errors
 *       } catch (error) {
 *         // Return server errors to apply to form fields
 *         if (error.code === 'EMAIL_EXISTS') {
 *           return [{ field: form.email, error: { kind: 'server', message: 'Email already exists' }}];
 *         }
 *         throw error;
 *       }
 *     }
 *   }
 * };
 * ```
 *
 * @typeParam TValue - The form value type
 *
 * @public
 * @experimental
 */
export interface SubmissionConfig<TValue = unknown> {
  /**
   * Async action called when the form is submitted.
   *
   * This function receives the form's `FieldTree` and should return a Promise that resolves to:
   * - `undefined` or `null` for successful submission (no errors)
   * - An array of `TreeValidationResult` for server-side validation errors
   *
   * Server errors returned will be automatically applied to the corresponding form fields.
   *
   * While this action is executing, `form().submitting()` will be `true`, enabling
   * automatic button disabling and loading states.
   *
   * @param form - The form's FieldTree instance
   * @returns Promise resolving to server validation errors or undefined
   *
   * @example
   * ```typescript
   * action: async (form) => {
   *   const response = await fetch('/api/register', {
   *     method: 'POST',
   *     body: JSON.stringify(form().value())
   *   });
   *
   *   if (!response.ok) {
   *     const errors = await response.json();
   *     return errors.map(e => ({
   *       field: form[e.field as keyof typeof form],
   *       error: { kind: 'server', message: e.message }
   *     }));
   *   }
   *
   *   return undefined;
   * }
   * ```
   */
  action: (form: FieldTree<TValue>) => Promise<TreeValidationResult>;
}
