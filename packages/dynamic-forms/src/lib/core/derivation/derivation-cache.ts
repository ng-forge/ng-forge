import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { DerivationCollection, DerivationEntry } from './derivation-types';

/**
 * Pre-computes cached sub-collections for efficient runtime access.
 *
 * Creates:
 * - `onChangeCollection`: Contains only entries with trigger 'onChange'
 * - `debouncedCollectionsByMs`: Map of debounce duration to collection
 *
 * This avoids expensive filtering operations at runtime when applying
 * debounced derivations.
 *
 * @param collection - The main derivation collection to cache
 *
 * @example
 * ```typescript
 * const collection = collectDerivations(fields);
 * precomputeCachedCollections(collection);
 *
 * // Now access cached collections efficiently
 * const onChange = collection.onChangeCollection;
 * const debounced500 = collection.debouncedCollectionsByMs?.get(500);
 * ```
 *
 * @public
 */
export function precomputeCachedCollections(collection: DerivationCollection): void {
  // Separate entries by trigger type
  const onChangeEntries: DerivationEntry[] = [];
  const debouncedEntriesByMs = new Map<number, DerivationEntry[]>();

  for (const entry of collection.entries) {
    if (entry.trigger === 'debounced') {
      const ms = entry.debounceMs ?? DEFAULT_DEBOUNCE_MS;
      const group = debouncedEntriesByMs.get(ms) ?? [];
      group.push(entry);
      debouncedEntriesByMs.set(ms, group);
    } else {
      onChangeEntries.push(entry);
    }
  }

  // Build onChange collection
  if (onChangeEntries.length > 0) {
    collection.onChangeCollection = buildSubCollection(onChangeEntries, collection);
  }

  // Build debounced collections
  if (debouncedEntriesByMs.size > 0) {
    collection.debouncedCollectionsByMs = new Map();
    for (const [ms, entries] of debouncedEntriesByMs) {
      collection.debouncedCollectionsByMs.set(ms, buildSubCollection(entries, collection));
    }
  }
}

/**
 * Builds a sub-collection from a subset of entries.
 *
 * Creates a new DerivationCollection containing only the specified entries
 * and their corresponding lookup map entries.
 *
 * @param entries - The subset of entries for the sub-collection
 * @param parent - The parent collection for reference
 * @returns A new DerivationCollection with filtered lookup maps
 *
 * @internal
 */
function buildSubCollection(entries: DerivationEntry[], parent: DerivationCollection): DerivationCollection {
  const entrySet = new Set(entries);

  return {
    entries,
    byTarget: filterMap(parent.byTarget, entrySet),
    bySource: filterMap(parent.bySource, entrySet),
    byDependency: filterMap(parent.byDependency, entrySet),
    byArrayPath: filterMap(parent.byArrayPath, entrySet),
    wildcardEntries: parent.wildcardEntries.filter((e) => entrySet.has(e)),
  };
}

/**
 * Filters a Map<string, DerivationEntry[]> to only include specified entries.
 *
 * @param map - The original map to filter
 * @param entrySet - Set of entries to include
 * @returns New map with filtered entries (empty arrays removed)
 *
 * @internal
 */
function filterMap(map: Map<string, DerivationEntry[]>, entrySet: Set<DerivationEntry>): Map<string, DerivationEntry[]> {
  const filtered = new Map<string, DerivationEntry[]>();

  for (const [key, entries] of map) {
    const filteredEntries = entries.filter((e) => entrySet.has(e));
    if (filteredEntries.length > 0) {
      filtered.set(key, filteredEntries);
    }
  }

  return filtered;
}

/**
 * Gets the onChange collection from a parent collection.
 *
 * Returns the cached collection if available, otherwise returns null
 * (indicating no onChange entries exist).
 *
 * @param collection - The parent collection
 * @returns The onChange sub-collection or null
 *
 * @public
 */
export function getOnChangeCollection(collection: DerivationCollection): DerivationCollection | null {
  return collection.onChangeCollection ?? null;
}

/**
 * Gets a debounced collection for a specific duration.
 *
 * Returns the cached collection if available, otherwise returns null.
 *
 * @param collection - The parent collection
 * @param debounceMs - The debounce duration in milliseconds
 * @returns The debounced sub-collection or null
 *
 * @public
 */
export function getDebouncedCollection(collection: DerivationCollection, debounceMs: number): DerivationCollection | null {
  return collection.debouncedCollectionsByMs?.get(debounceMs) ?? null;
}

/**
 * Gets all debounce periods that have entries.
 *
 * @param collection - The parent collection
 * @returns Array of debounce durations in milliseconds
 *
 * @public
 */
export function getDebouncePeriods(collection: DerivationCollection): number[] {
  if (!collection.debouncedCollectionsByMs) {
    return [];
  }
  return Array.from(collection.debouncedCollectionsByMs.keys());
}
