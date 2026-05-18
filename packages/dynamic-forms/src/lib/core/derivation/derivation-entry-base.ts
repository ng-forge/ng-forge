import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { DerivationLogicConfig, LogicTrigger } from '../../models/logic/logic-config';
import type { CustomFunction } from '../expressions/custom-function-types';

/**
 * Common shape shared by `DerivationEntry` and `PropertyDerivationEntry`.
 *
 * Both entry types are produced by collecting `type: 'derivation'` logic from
 * field definitions; they diverge only in their write target (form value vs.
 * property override store) and a few specialized fields. Shared utilities
 * (`computeValueFromEntry`, `getDebouncePeriods`, etc.) operate on this shape
 * so they can be reused across both pipelines without casts.
 *
 * @public
 */
export interface BaseDerivationEntry {
  /**
   * The key of the field where this derivation is defined and targets.
   *
   * For array fields, this may include a placeholder path like 'items.$.x'
   * which is resolved to actual indices at runtime.
   */
  fieldKey: string;

  /**
   * Field keys that this derivation depends on.
   *
   * Extracted from explicit `dependsOn`, expressions, and conditions.
   */
  dependsOn: string[];

  /**
   * Condition that determines when this derivation applies.
   *
   * Defaults to `true` (always apply) if not specified in the config.
   */
  condition: ConditionalExpression | boolean;

  /**
   * Static value. Mutually exclusive with `expression` and `functionName`.
   */
  value?: unknown;

  /**
   * JavaScript expression to evaluate for the derived value.
   * Mutually exclusive with `value` and `functionName`.
   */
  expression?: string;

  /**
   * Name of a registered custom derivation function.
   * Mutually exclusive with `value`, `expression`, and `fn`.
   */
  functionName?: string;

  /**
   * Inline custom derivation function (code-only authoring).
   * Mutually exclusive with `functionName`. NOT JSON-serializable.
   */
  fn?: CustomFunction;

  /**
   * When to evaluate the derivation.
   *
   * @default 'onChange'
   */
  trigger: LogicTrigger;

  /**
   * Debounce duration in milliseconds. Only used when `trigger` is 'debounced'.
   *
   * @default 500
   */
  debounceMs?: number;

  /**
   * Optional debug name for easier identification in logs.
   */
  debugName?: string;

  /**
   * The original logic config if this entry was created from a full logic config.
   */
  originalConfig?: DerivationLogicConfig;
}
