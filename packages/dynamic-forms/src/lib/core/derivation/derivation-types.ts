import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { DerivationLogicConfig, DerivationTrigger } from '../../models/logic/logic-config';

/**
 * Entry representing a collected derivation from field definitions.
 *
 * Created during form initialization when traversing field definitions
 * to collect all derivation rules (both shorthand and full logic configs).
 *
 * @public
 */
export interface DerivationEntry {
  /**
   * The key of the field where this derivation is defined.
   *
   * For shorthand derivations, this is the same as `targetFieldKey`.
   * For full logic derivations, this is the field containing the logic array.
   */
  sourceFieldKey: string;

  /**
   * The key of the field whose value will be set.
   *
   * Can be:
   * - Absolute path: 'fieldName' or 'nested.field.path'
   * - Relative path for arrays: '$.siblingField' (same index as source)
   */
  targetFieldKey: string;

  /**
   * Field keys that this derivation depends on.
   *
   * Extracted from conditions and expressions.
   * Used for:
   * - Cycle detection
   * - Reactive dependency tracking
   * - Determining evaluation order
   */
  dependsOn: string[];

  /**
   * Condition that determines when this derivation applies.
   *
   * Defaults to `true` (always apply) if not specified.
   */
  condition: ConditionalExpression | boolean;

  /**
   * Static value to set on the target field.
   *
   * Mutually exclusive with `expression` and `functionName`.
   */
  value?: unknown;

  /**
   * JavaScript expression to evaluate for the derived value.
   *
   * Mutually exclusive with `value` and `functionName`.
   */
  expression?: string;

  /**
   * Name of a registered custom derivation function.
   *
   * Mutually exclusive with `value` and `expression`.
   */
  functionName?: string;

  /**
   * When to evaluate the derivation.
   *
   * @default 'onChange'
   */
  trigger: DerivationTrigger;

  /**
   * Whether this derivation was created from the shorthand `derivation` property.
   *
   * Shorthand derivations always target the same field they're defined on.
   */
  isShorthand: boolean;

  /**
   * The original logic config if this entry was created from a full logic config.
   */
  originalConfig?: DerivationLogicConfig;
}

/**
 * Collection of all derivation entries from a form's field definitions.
 *
 * @public
 */
export interface DerivationCollection {
  /**
   * All derivation entries collected from field definitions.
   */
  entries: DerivationEntry[];

  /**
   * Map of target field key to entries that modify it.
   *
   * Used for quick lookup when processing derivations.
   */
  byTarget: Map<string, DerivationEntry[]>;

  /**
   * Map of source field key to entries defined on it.
   *
   * Used for finding derivations when a field's value changes.
   */
  bySource: Map<string, DerivationEntry[]>;
}

/**
 * Result of cycle detection in the derivation graph.
 *
 * @public
 */
export interface CycleDetectionResult {
  /**
   * Whether a cycle was detected.
   */
  hasCycle: boolean;

  /**
   * Field paths involved in the cycle, if one was detected.
   *
   * Example: ['country', 'currency', 'country'] for a country -> currency -> country cycle.
   */
  cyclePath?: string[];

  /**
   * Human-readable error message describing the cycle.
   */
  errorMessage?: string;
}

/**
 * Context for tracking derivation chain during runtime.
 *
 * Prevents infinite loops by tracking which derivations have already
 * been applied in the current update cycle.
 *
 * @internal
 */
export interface DerivationChainContext {
  /**
   * Set of derivation keys that have already been applied.
   *
   * Key format: "sourceFieldKey:targetFieldKey"
   */
  appliedDerivations: Set<string>;

  /**
   * Current iteration count in the derivation processing loop.
   */
  iteration: number;
}

/**
 * Creates an empty derivation collection.
 *
 * @returns Empty collection ready for population
 *
 * @internal
 */
export function createEmptyDerivationCollection(): DerivationCollection {
  return {
    entries: [],
    byTarget: new Map(),
    bySource: new Map(),
  };
}

/**
 * Creates a new derivation chain context for tracking applied derivations.
 *
 * @returns Fresh context for a new derivation cycle
 *
 * @internal
 */
export function createDerivationChainContext(): DerivationChainContext {
  return {
    appliedDerivations: new Set(),
    iteration: 0,
  };
}

/**
 * Creates a unique key for a derivation entry.
 *
 * @param sourceKey - The source field key
 * @param targetKey - The target field key
 * @returns Unique key for the derivation
 *
 * @internal
 */
export function createDerivationKey(sourceKey: string, targetKey: string): string {
  return `${sourceKey}:${targetKey}`;
}

/**
 * Parses a derivation key back into source and target field keys.
 *
 * @param key - The derivation key to parse
 * @returns Object containing source and target field keys
 *
 * @internal
 */
export function parseDerivationKey(key: string): { sourceKey: string; targetKey: string } {
  const colonIndex = key.indexOf(':');
  return {
    sourceKey: key.substring(0, colonIndex),
    targetKey: key.substring(colonIndex + 1),
  };
}
