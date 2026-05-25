import { HttpRequestConfig } from '../../models/http/http-request-config';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { BaseDerivationEntry } from '../derivation/derivation-entry-base';

/**
 * Entry representing a collected property derivation from field definitions.
 *
 * Created during form initialization when traversing field definitions
 * to collect all `type: 'derivation'` logic entries with `targetProperty`.
 *
 * All property derivations are self-targeting: the `fieldKey` is both where the
 * derivation is defined AND where the derived property will be set. Extends
 * {@link BaseDerivationEntry} with the property-pipeline specific `targetProperty`
 * plus the async sources (HTTP / async functions) that produce property values
 * over time rather than synchronously.
 *
 * @public
 */
export interface PropertyDerivationEntry extends BaseDerivationEntry {
  /**
   * The target property to set on the field component.
   *
   * Supports dot-notation for nested properties (max 2 levels).
   */
  targetProperty: string;

  /**
   * HTTP request configuration for server-driven property derivations.
   *
   * Mutually exclusive with `value`, `expression`, `functionName`, and `asyncFunctionName`.
   * Processed asynchronously in a dedicated RxJS stream, not in the sync loop.
   */
  http?: HttpRequestConfig;

  /**
   * Expression to extract the derived value from an HTTP response.
   *
   * Required when `http` is set.
   */
  responseExpression?: string;

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

/**
 * Returns true when the entry's value source is async (HTTP or async function)
 * and therefore must be processed by a dedicated stream subscription rather
 * than the synchronous applicator pipeline.
 *
 * @internal
 */
export function isAsyncPropertyDerivationEntry(entry: PropertyDerivationEntry): boolean {
  return Boolean(entry.http) || Boolean(entry.asyncFunctionName) || Boolean(entry.asyncFn);
}
