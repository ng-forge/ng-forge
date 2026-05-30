import type { AsyncDerivationFunction } from '@ng-forge/dynamic-forms/internal';
import type { CustomFunction } from '@ng-forge/dynamic-forms/internal';

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
