import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import type { CustomFunction } from '../expressions/custom-function-types';

/**
 * Reads the optional inline `fn` property off a derivation config.
 *
 * @internal
 */
export function extractInlineFn(config: object): CustomFunction | undefined {
  return (config as { fn?: CustomFunction }).fn;
}

/**
 * Reads the optional inline `asyncFn` property off a derivation config.
 *
 * @internal
 */
export function extractInlineAsyncFn(config: object): AsyncDerivationFunction | undefined {
  return (config as { asyncFn?: AsyncDerivationFunction }).asyncFn;
}
