import type { Logger } from '../../providers/features/logger/logger.interface';

export interface EvaluationContext<TValue = unknown> {
  /** Current field value */
  fieldValue: TValue;

  /** Complete form value (or array item value for array derivations) */
  formValue: Record<string, unknown>;

  /** Field path for relative references */
  fieldPath: string;

  /** Custom evaluation functions */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /**
   * Root form value when inside an array context.
   * This provides access to values outside the current array item.
   */
  rootFormValue?: Record<string, unknown>;

  /**
   * Current array index when inside an array derivation.
   */
  arrayIndex?: number;

  /**
   * Path to the array field when inside an array derivation.
   */
  arrayPath?: string;

  /** Allow additional properties for flexible expression evaluation */
  [key: string]: unknown;
}
