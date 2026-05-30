import { ConditionalExpression } from '@ng-forge/dynamic-forms/internal';
import { DerivationLogicConfig, LogicTrigger } from '@ng-forge/dynamic-forms/internal';
import type { CustomFunction } from '@ng-forge/dynamic-forms/internal';

/** Common shape shared by `DerivationEntry` and `PropertyDerivationEntry`. */
export interface BaseDerivationEntry {
  /** The key of the field where this derivation is defined and targets. */
  fieldKey: string;

  /** Field keys that this derivation depends on. */
  dependsOn: string[];

  /** Condition that determines when this derivation applies. */
  condition: ConditionalExpression | boolean;

  /** Static value. Mutually exclusive with `expression` and `functionName`. */
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

  /** Optional debug name for easier identification in logs. */
  debugName?: string;

  /** The original logic config if this entry was created from a full logic config. */
  originalConfig?: DerivationLogicConfig;
}
