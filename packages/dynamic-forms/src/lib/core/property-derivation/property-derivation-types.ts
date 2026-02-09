import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { LogicTrigger, PropertyDerivationLogicConfig } from '../../models/logic/logic-config';

/**
 * Entry representing a collected property derivation from field definitions.
 *
 * Created during form initialization when traversing field definitions
 * to collect all `type: 'propertyDerivation'` logic entries.
 *
 * All property derivations are self-targeting: the `fieldKey` is both where the
 * derivation is defined AND where the derived property will be set.
 *
 * @public
 */
export interface PropertyDerivationEntry {
  /**
   * The key of the field where this property derivation is defined and targets.
   *
   * For array fields, this may include a placeholder path like 'items.$.endDate'
   * which is resolved to actual indices at runtime.
   */
  fieldKey: string;

  /**
   * The target property to set on the field component.
   *
   * Supports dot-notation for nested properties (max 2 levels).
   */
  targetProperty: string;

  /**
   * Field keys that this property derivation depends on.
   *
   * Extracted from conditions and expressions. Used for reactive
   * dependency tracking and determining which entries to re-evaluate.
   */
  dependsOn: string[];

  /**
   * Condition that determines when this property derivation applies.
   *
   * Defaults to `true` (always apply) if not specified in the config.
   *
   * Note: This default behavior is consistent with `DerivationLogicConfig` (where
   * `condition` is also optional and defaults to `true`) but differs from
   * `StateLogicConfig` where `condition` is **required**. This is intentional:
   * state logic always needs a condition to evaluate, whereas derivations and
   * property derivations make sense as unconditional by default (always compute).
   */
  condition: ConditionalExpression | boolean;

  /**
   * Static value to set on the target property.
   *
   * Mutually exclusive with `expression` and `functionName`.
   */
  value?: unknown;

  /**
   * JavaScript expression to evaluate for the derived property value.
   *
   * Mutually exclusive with `value` and `functionName`.
   */
  expression?: string;

  /**
   * Name of a registered custom property derivation function.
   *
   * Mutually exclusive with `value` and `expression`.
   */
  functionName?: string;

  /**
   * When to evaluate the property derivation.
   *
   * @default 'onChange'
   */
  trigger: LogicTrigger;

  /**
   * Debounce duration in milliseconds.
   *
   * Only used when `trigger` is 'debounced'.
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
  originalConfig?: PropertyDerivationLogicConfig;
}

/**
 * Collection of all property derivation entries from a form's field definitions.
 *
 * @public
 */
export interface PropertyDerivationCollection {
  /**
   * All property derivation entries collected from field definitions.
   *
   * No topological sort needed — property derivations don't chain among
   * themselves (they read formValue and write to the store, never reading
   * from the store).
   */
  entries: PropertyDerivationEntry[];
}

/**
 * Creates an empty property derivation collection.
 *
 * @returns Empty collection
 *
 * @internal
 */
export function createEmptyPropertyDerivationCollection(): PropertyDerivationCollection {
  return { entries: [] };
}
