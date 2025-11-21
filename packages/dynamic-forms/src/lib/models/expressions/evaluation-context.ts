/**
 * Runtime context for evaluating conditional expressions
 */
export interface EvaluationContext<TValue = unknown> {
  /** Current field value */
  fieldValue: TValue;

  /** Complete form value */
  formValue: Record<string, unknown>;

  /** Field path for relative references */
  fieldPath: string;

  /** Custom evaluation functions */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  /** Allow additional properties for flexible expression evaluation */
  [key: string]: unknown;
}
