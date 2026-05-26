import { DerivationEntry } from '../derivation/derivation-types';

/**
 * Entry representing a collected property derivation from field definitions.
 *
 * A narrow of {@link DerivationEntry} where `targetProperty` is required —
 * the discriminator that distinguishes property derivations (writes into the
 * PropertyOverrideStore) from value derivations (writes into the FieldTree).
 *
 * Created during form initialization when traversing field definitions
 * to collect all `type: 'derivation'` logic entries with `targetProperty`.
 *
 * @public
 */
export type PropertyDerivationEntry = DerivationEntry & { targetProperty: string };

/**
 * Collection of all property derivation entries from a form's field definitions.
 *
 * No topological sort needed — property derivations don't chain among
 * themselves (they read formValue and write to the store, never reading
 * from the store).
 *
 * @public
 */
export interface PropertyDerivationCollection {
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
