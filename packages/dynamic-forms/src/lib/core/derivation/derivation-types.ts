import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { DerivationLogicConfig, LogicTrigger } from '../../models/logic/logic-config';

/**
 * Entry representing a collected derivation from field definitions.
 *
 * Created during form initialization when traversing field definitions
 * to collect all derivation rules (both shorthand and full logic configs).
 *
 * All derivations are self-targeting: the `fieldKey` is both where the
 * derivation is defined AND where the computed value will be set.
 *
 * @public
 */
export interface DerivationEntry {
  /**
   * The key of the field where this derivation is defined and targets.
   *
   * Derivations always target the field they are defined on (self-targeting).
   * For array fields, this may include a placeholder path like 'items.$.lineTotal'
   * which is resolved to actual indices at runtime.
   */
  fieldKey: string;

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
   * Static value to set on this field.
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
   * - `onChange`: Evaluate immediately when dependencies change (default)
   * - `debounced`: Evaluate after value has stabilized for debounceMs
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
   * Whether this derivation was created from the shorthand `derivation` property.
   *
   * Shorthand derivations use a string expression directly on the field.
   */
  isShorthand: boolean;

  /**
   * The original logic config if this entry was created from a full logic config.
   */
  originalConfig?: DerivationLogicConfig;

  /**
   * Optional debug name for easier identification in logs.
   *
   * Copied from the originalConfig if provided. When set, this name
   * appears in verbose derivation logs instead of the field key.
   */
  debugName?: string;
}

/**
 * Collection of all derivation entries from a form's field definitions.
 *
 * This interface is intentionally minimal - it contains only the core data.
 *
 * @public
 */
export interface DerivationCollection {
  /**
   * All derivation entries collected from field definitions,
   * sorted in topological order for efficient processing.
   */
  entries: DerivationEntry[];
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
   * Bidirectional derivation pairs detected (A↔B patterns).
   *
   * These are allowed and stabilize via equality checks, but may oscillate
   * with floating-point precision issues (e.g., currency conversions).
   *
   * Format: ['fieldA↔fieldB', 'fieldC↔fieldD']
   */
  bidirectionalPairs?: string[];

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
   * Key format: "fieldKey"
   *
   * For array derivations, the caller is responsible for resolving
   * array placeholders (e.g., 'items.$.lineTotal' -> 'items.0.lineTotal')
   * before adding to this set.
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
  return { entries: [] };
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
 * Since derivations are self-targeting, the key is simply the field key.
 * This function exists for semantic clarity and to provide a single point
 * of change if the key format needs to be extended in the future.
 *
 * Note: For array derivations, callers must resolve placeholders
 * (e.g., 'items.$.lineTotal' -> 'items.0.lineTotal') before calling this.
 *
 * @param fieldKey - The field key (with array index already resolved)
 * @returns Unique key for the derivation
 *
 * @internal
 */
export function createDerivationKey(fieldKey: string): string {
  return fieldKey;
}

/**
 * Parses a derivation key back into field key.
 *
 * @param key - The derivation key to parse
 * @returns Object containing the field key
 *
 * @internal
 */
export function parseDerivationKey(key: string): { fieldKey: string } {
  return { fieldKey: key };
}

/**
 * Result of processing all pending derivations.
 *
 * @public
 */
export interface DerivationProcessingResult {
  /** Number of derivations successfully applied */
  appliedCount: number;

  /** Number of derivations skipped (condition not met or value unchanged) */
  skippedCount: number;

  /** Number of derivations that failed with errors */
  errorCount: number;

  /**
   * Number of derivations that encountered warnings (e.g., missing target field).
   *
   * These are not counted as errors because they may be intentional (conditional fields)
   * but indicate potential configuration issues if unexpected.
   */
  warnCount: number;

  /** Total iterations performed */
  iterations: number;

  /** Whether max iterations was reached (potential loop) */
  maxIterationsReached: boolean;
}
