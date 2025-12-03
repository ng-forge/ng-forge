import { FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { Observable } from 'rxjs';

/**
 * The result type for submission actions.
 * Can be either a Promise or an Observable.
 *
 * For success: return `undefined`, `null`, `void`, or any non-TreeValidationResult value.
 * For server errors: return `TreeValidationResult` (array of field errors).
 */
export type SubmissionActionResult = Promise<TreeValidationResult> | Observable<TreeValidationResult | unknown>;

/**
 * Configuration for form submission handling.
 *
 * When provided, enables integration with Angular Signal Forms' native `submit()` function.
 * The submission mechanism is **optional** - you can still handle submission manually
 * via the `(submitted)` output if you prefer.
 *
 * Supports both Promise-based and Observable-based submission actions. When an Observable
 * is returned, it will be automatically converted using `firstValueFrom`.
 *
 * @example
 * ```typescript
 * // Using Observable (recommended for HTTP calls)
 * // Simply return the HTTP observable - no need to map the result
 * const config: FormConfig = {
 *   fields: [...],
 *   submission: {
 *     action: (form) => this.http.post('/api/submit', form().value())
 *   }
 * };
 *
 * // With error handling for server validation errors
 * const config: FormConfig = {
 *   fields: [...],
 *   submission: {
 *     action: (form) => {
 *       return this.http.post('/api/submit', form().value()).pipe(
 *         catchError((error) => {
 *           if (error.error?.code === 'EMAIL_EXISTS') {
 *             return of([{ field: form.email, error: { kind: 'server', message: 'Email already exists' }}]);
 *           }
 *           throw error;
 *         })
 *       );
 *     }
 *   }
 * };
 *
 * // Using Promise (also supported)
 * const config: FormConfig = {
 *   fields: [...],
 *   submission: {
 *     action: async (form) => {
 *       const value = form().value();
 *       try {
 *         await this.api.submit(value);
 *         return undefined;
 *       } catch (error) {
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
   * Action called when the form is submitted.
   *
   * This function receives the form's `FieldTree` and should return either a Promise or
   * an Observable. For Observable returns, it will be automatically converted using `firstValueFrom`.
   *
   * **Return values:**
   * - For success: return `undefined`, `null`, or simply let the Observable complete (the emitted value is ignored unless it's a TreeValidationResult)
   * - For server errors: return `TreeValidationResult` (array of field/error pairs)
   *
   * **Observable support:** You can return an HttpClient observable directly without mapping the result.
   * The form will treat Observable completion as success. Only return `TreeValidationResult` if you need
   * to report server-side validation errors.
   *
   * Server errors returned will be automatically applied to the corresponding form fields.
   *
   * While this action is executing, `form().submitting()` will be `true`, enabling
   * automatic button disabling and loading states.
   *
   * @param form - The form's FieldTree instance
   * @returns Promise or Observable - for errors, return TreeValidationResult
   *
   * @example
   * ```typescript
   * // Simple - just return the HTTP observable
   * action: (form) => this.http.post('/api/register', form().value())
   *
   * // With server error handling
   * action: (form) => {
   *   return this.http.post('/api/register', form().value()).pipe(
   *     catchError((error) => {
   *       if (error.status === 409) {
   *         return of([{
   *           field: form.email,
   *           error: { kind: 'server', message: 'Email already exists' }
   *         }]);
   *       }
   *       throw error;
   *     })
   *   );
   * }
   *
   * // Promise-based alternative
   * action: async (form) => {
   *   await fetch('/api/register', {
   *     method: 'POST',
   *     body: JSON.stringify(form().value())
   *   });
   *   // Return undefined for success, or TreeValidationResult for errors
   * }
   * ```
   */
  action: (form: FieldTree<TValue>) => SubmissionActionResult;
}
