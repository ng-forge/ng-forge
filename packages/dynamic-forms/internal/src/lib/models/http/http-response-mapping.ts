/** Mapping configuration for interpreting HTTP responses as validation results. */
export interface HttpValidationResponseMapping {
  /** Expression evaluated with scope `{ response }`. Must evaluate to `true` (strict boolean) to be valid. */
  validWhen: string;

  /** Error kind returned when validation fails — maps to field-level `validationMessages` */
  errorKind: string;

  /**
   * Parameters to include in the validation error for message interpolation.
   * Map of parameter names to expressions evaluated against `{ response }`.
   */
  errorParams?: Record<string, string>;
}
