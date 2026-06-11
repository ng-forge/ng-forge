import type { Logger } from '../../providers/features/logger/logger.interface';
import type { WarningTracker } from '../../utils/warning-tracker';
import type { FieldStateContext, FormFieldStateMap } from './field-state-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default `any` for TFormValue ensures backward compatibility at registry boundaries
export interface EvaluationContext<TValue = unknown, TFormValue extends Record<string, unknown> = any> {
  /** Current field value */
  fieldValue: TValue;

  /** Form value for the current evaluation scope. */
  formValue: TFormValue;

  /** Field path for relative references */
  fieldPath: string;

  /** Custom evaluation functions */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /**
   * Value of the field's nearest parent **group** (or array item, when the
   * field has no inner group above the array boundary).
   */
  groupValue?: unknown;

  /**
   * Root form value. Reaches the whole form when `formValue` is scoped to an
   * array item or a parent group; equals `formValue` at form root. Always set
   * in derivation contexts; in condition contexts only set inside array items.
   */
  rootFormValue?: Record<string, unknown>;

  /** Current array index when inside an array derivation. */
  arrayIndex?: number;

  /** Path to the array field when inside an array derivation. */
  arrayPath?: string;

  /** External data signals resolved to their current values. */
  externalData?: Record<string, unknown>;

  /**
   * DI-scoped tracker for deprecation warnings.
   * Used by the condition evaluator to deduplicate deprecation warnings.
   */
  deprecationTracker?: WarningTracker;

  /** State of the current field being evaluated. */
  fieldState?: FieldStateContext;

  /** State of all fields in the form, keyed by field key. */
  formFieldState?: FormFieldStateMap;

  /** Allow additional properties for flexible expression evaluation */
  [key: string]: unknown;
}
