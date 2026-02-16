/**
 * Mapping configuration for interpreting HTTP responses as validation results.
 *
 * Expressions in `validWhen` and `errorParams` are evaluated with scope `{ response }` only —
 * they do NOT have access to `formValue`, `fieldValue`, or the full `EvaluationContext`.
 * This is intentional for v1: response mapping is purely about interpreting the HTTP response.
 */
export interface HttpValidationResponseMapping {
  /**
   * Expression evaluated with scope `{ response }`. Truthy = valid (no error).
   *
   * NOTE: This is the OPPOSITE of the function-based HttpCustomValidator.onSuccess
   * convention, which maps successful HTTP responses to validation errors.
   * Here, truthy means "validation passed".
   */
  validWhen: string;

  /** Error kind returned when validation fails — maps to field-level `validationMessages` */
  errorKind: string;

  /**
   * Parameters to include in the validation error for message interpolation.
   * Map of parameter names to expressions evaluated against `{ response }`.
   */
  errorParams?: Record<string, string>;
}
