/**
 * Mapping configuration for interpreting HTTP responses as validation results.
 *
 * Expressions in `validWhen` and `errorParams` are evaluated with scope `{ response }` only —
 * they do NOT have access to `formValue`, `fieldValue`, or the full `EvaluationContext`.
 * This is intentional for v1: response mapping is purely about interpreting the HTTP response.
 */
export interface HttpValidationResponseMapping {
  /**
   * Expression evaluated with scope `{ response }`. Must evaluate to `true` (strict boolean) to be valid.
   *
   * NOTE: This is the OPPOSITE of the function-based HttpCustomValidator.onSuccess
   * convention, which maps successful HTTP responses to validation errors.
   * Here, `=== true` means "validation passed". Non-boolean results are treated as invalid and trigger a warning.
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
