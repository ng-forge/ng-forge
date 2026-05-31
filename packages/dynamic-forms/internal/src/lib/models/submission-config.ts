import { FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { Observable } from 'rxjs';

/**
 * The result type for submission actions.
 * Can be either a Promise or an Observable.
 */
export type SubmissionActionResult = Promise<TreeValidationResult> | Observable<TreeValidationResult | unknown>;

/**
 * Configuration for form submission handling.
 *
 * @typeParam TValue - The form value type
 */
export interface SubmissionConfig<TValue = unknown> {
  /**
   * Action called when the form is submitted.
   *
   * @param form - The form's FieldTree instance
   * @returns Promise or Observable - for errors, return TreeValidationResult
   */
  action: (form: FieldTree<TValue>) => SubmissionActionResult;
}
