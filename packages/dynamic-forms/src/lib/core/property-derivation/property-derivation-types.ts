import { DerivationEntry } from '../derivation/derivation-types';

/** Entry representing a collected property derivation from field definitions. */
export type PropertyDerivationEntry = DerivationEntry & { targetProperty: string };

/** Collection of all property derivation entries from a form's field definitions. */
export interface PropertyDerivationCollection {
  entries: PropertyDerivationEntry[];
}

/**
 * Creates an empty property derivation collection.
 *
 * @returns Empty collection
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
