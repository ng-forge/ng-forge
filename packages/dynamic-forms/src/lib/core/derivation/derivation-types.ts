import type { FormFieldStateMap } from '../../models/expressions/field-state-context';
import { HttpRequestConfig } from '../../models/http/http-request-config';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { BaseDerivationEntry } from './derivation-entry-base';

/** Entry representing a collected derivation from field definitions. */
export interface DerivationEntry extends BaseDerivationEntry {
  /**
   * Target property name when this entry feeds the property-override store
   * (one of `'hidden'`, `'disabled'`, `'readonly'`, ...). When absent, the
   * entry is a value derivation and writes into the FieldTree.
   */
  targetProperty?: string;

  /** HTTP request configuration for server-driven derivations. */
  http?: HttpRequestConfig;

  /** Name of a registered async derivation function. */
  asyncFunctionName?: string;

  /**
   * Inline async derivation function (code-only authoring).
   * Mutually exclusive with `asyncFunctionName`. NOT JSON-serializable.
   * Processed asynchronously in a dedicated RxJS stream, not in the sync loop.
   */
  asyncFn?: AsyncDerivationFunction;

  /** Expression to extract the derived value from an HTTP response. */
  responseExpression?: string;

  /**
   * Whether this derivation was created from the shorthand `derivation` property.
   * Value-pipeline-only — property derivations are always created from full
   * logic configs and leave this unset.
   */
  isShorthand?: boolean;

  /**
   * When true, the derivation stops running after the user manually
   * edits the target field. Value-pipeline-only — property derivations
   * always recompute on dependency change.
   */
  stopOnUserOverride?: boolean;

  /**
   * When true (and `stopOnUserOverride` is also true), clears the
   * user-override flag when any dependency of this derivation changes,
   * allowing the derivation to run again. Value-pipeline-only.
   */
  reEngageOnDependencyChange?: boolean;
}

/** Collection of all derivation entries from a form's field definitions. */
export interface DerivationCollection {
  /**
   * All derivation entries collected from field definitions,
   * sorted in topological order for efficient processing.
   */
  entries: DerivationEntry[];
}

/** Result of cycle detection in the derivation graph. */
export interface CycleDetectionResult {
  /** Whether a cycle was detected. */
  hasCycle: boolean;

  /** Field paths involved in the cycle, if one was detected. */
  cyclePath?: string[];

  /** Bidirectional derivation pairs detected (A↔B patterns). */
  bidirectionalPairs?: string[];

  /** Human-readable error message describing the cycle. */
  errorMessage?: string;
}

/**
 * Context for tracking derivation chain during runtime.
 *
 * @internal
 */
export interface DerivationChainContext {
  /** Set of derivation keys that have already been applied. */
  appliedDerivations: Set<string>;

  /** Current iteration count in the derivation processing loop. */
  iteration: number;

  /** Set of field keys that changed in this cycle. */
  changedFields?: Set<string>;

  /** Cached FormFieldStateMap for this cycle. */
  formFieldState?: FormFieldStateMap;
}

/**
 * Creates an empty derivation collection.
 *
 * @returns Empty collection ready for population
 * @internal
 */
export function createEmptyDerivationCollection(): DerivationCollection {
  return { entries: [] };
}

/**
 * Creates a new derivation chain context for tracking applied derivations.
 *
 * @returns Fresh context for a new derivation cycle
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
 * @param fieldKey - The field key (with array index already resolved)
 * @returns Unique key for the derivation
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
 * @internal
 */
export function parseDerivationKey(key: string): { fieldKey: string } {
  return { fieldKey: key };
}

/** Result of processing all pending derivations. */
export interface DerivationProcessingResult {
  /** Number of derivations successfully applied */
  appliedCount: number;

  /** Number of derivations skipped (condition not met or value unchanged) */
  skippedCount: number;

  /** Number of derivations that failed with errors */
  errorCount: number;

  /** Number of derivations that encountered warnings (e.g., missing target field). */
  warnCount: number;

  /** Total iterations performed */
  iterations: number;

  /** Whether max iterations was reached (potential loop) */
  maxIterationsReached: boolean;
}
