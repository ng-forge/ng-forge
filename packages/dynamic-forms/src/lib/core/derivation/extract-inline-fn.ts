import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import type { CustomFunction } from '../expressions/custom-function-types';

/**
 * Reads the optional inline `fn` property off a derivation config.
 *
 * `fn` only appears on the function-mode branch of the discriminated union, so
 * call sites that need to copy it through unconditionally must widen via cast.
 * This helper centralises the cast and keeps it read-only — no widening, no
 * mutation. Returns `undefined` for any non-function-mode variant.
 *
 * @internal
 */
export function extractInlineFn(config: object): CustomFunction | undefined {
  return (config as { fn?: CustomFunction }).fn;
}

/**
 * Reads the optional inline `asyncFn` property off a derivation config.
 *
 * Same rationale as {@link extractInlineFn}: `asyncFn` only appears on the
 * `source: 'asyncFunction'` branch, so collectors that copy it through need a
 * cast. Read-only access, no widening.
 *
 * @internal
 */
export function extractInlineAsyncFn(config: object): AsyncDerivationFunction | undefined {
  return (config as { asyncFn?: AsyncDerivationFunction }).asyncFn;
}
