import type { FormFieldStateMap } from '../../models/expressions/field-state-context';
import { HttpRequestConfig } from '../../models/http/http-request-config';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { BaseDerivationEntry } from './derivation-entry-base';

/**
 * Entry representing a collected derivation from field definitions.
 *
 * Unified across both write targets: when `targetProperty` is absent the entry
 * writes the derived value into the form's FieldTree (value derivation); when
 * `targetProperty` is set it writes into the PropertyOverrideStore under
 * `[fieldKey, targetProperty]` (property derivation — hidden/disabled/readonly).
 * The collectors emit entries of the appropriate shape; the orchestrator's
 * apply step routes by inspecting `targetProperty`.
 *
 * All derivations are self-targeting: the `fieldKey` is both where the
 * derivation is defined AND where the computed value will be set.
 *
 * Extends {@link BaseDerivationEntry} with the async source variants (HTTP,
 * async function) and value-pipeline-only authoring controls (shorthand flag,
 * user-override behavior). Property-pipeline entries simply leave the
 * value-only fields unset; see {@link PropertyDerivationEntry} for the
 * property-only variant.
 *
 * @public
 */
export interface DerivationEntry extends BaseDerivationEntry {
  /**
   * Target property name when this entry feeds the property-override store
   * (one of `'hidden'`, `'disabled'`, `'readonly'`, ...). When absent, the
   * entry is a value derivation and writes into the FieldTree.
   *
   * Property derivations are distinguished from value derivations purely by
   * the presence of this field.
   */
  targetProperty?: string;

  /**
   * HTTP request configuration for server-driven derivations.
   *
   * Mutually exclusive with `value`, `expression`, `functionName`, and `asyncFunctionName`.
   * Processed asynchronously in a dedicated RxJS stream, not in the sync loop.
   */
  http?: HttpRequestConfig;

  /**
   * Name of a registered async derivation function.
   *
   * Mutually exclusive with `value`, `expression`, `functionName`, `asyncFn`, and `http`.
   * Processed asynchronously in a dedicated RxJS stream, not in the sync loop.
   */
  asyncFunctionName?: string;

  /**
   * Inline async derivation function (code-only authoring).
   * Mutually exclusive with `asyncFunctionName`. NOT JSON-serializable.
   * Processed asynchronously in a dedicated RxJS stream, not in the sync loop.
   */
  asyncFn?: AsyncDerivationFunction;

  /**
   * Expression to extract the derived value from an HTTP response.
   *
   * Required when `http` is set.
   */
  responseExpression?: string;

  /**
   * Whether this derivation was created from the shorthand `derivation` property.
   * Value-pipeline-only — property derivations are always created from full
   * logic configs and leave this unset.
   *
   * Shorthand derivations use a string expression directly on the field.
   */
  isShorthand?: boolean;

  /**
   * When true, the derivation stops running after the user manually
   * edits the target field. Value-pipeline-only — property derivations
   * always recompute on dependency change.
   *
   * Uses the field's `dirty()` signal — derivations write directly to
   * `value.set()` which does not trigger `markAsDirty()`, so
   * `dirty === true` reliably indicates user modification.
   */
  stopOnUserOverride?: boolean;

  /**
   * When true (and `stopOnUserOverride` is also true), clears the
   * user-override flag when any dependency of this derivation changes,
   * allowing the derivation to run again. Value-pipeline-only.
   */
  reEngageOnDependencyChange?: boolean;
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

  /**
   * Set of field keys that changed in this cycle.
   *
   * Used by `reEngageOnDependencyChange` to determine whether to
   * clear a user-override flag. `undefined` on initial onChange evaluation
   * (when no prior value exists to compare against).
   */
  changedFields?: Set<string>;

  /**
   * Cached FormFieldStateMap for this cycle.
   *
   * Created once per `applyDerivations` call and reused across all entry
   * evaluations to avoid allocating a new Proxy + Map per entry.
   */
  formFieldState?: FormFieldStateMap;
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
