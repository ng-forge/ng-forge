import { DerivationCollection, DerivationEntry } from './derivation-types';

/**
 * Sorts derivation entries in topological order based on their dependencies.
 *
 * This ensures that derivations are processed in the correct order:
 * if derivation B depends on field A, and derivation A->A' modifies A,
 * then A->A' is processed before B.
 *
 * Uses Kahn's algorithm for topological sorting, which also provides
 * natural handling of entries with no dependencies (they come first).
 *
 * @param collection - The derivation collection to sort
 * @returns A new array of entries in topological order
 *
 * @example
 * ```typescript
 * // Given derivations:
 * // 1. quantity -> lineTotal (depends on quantity, unitPrice)
 * // 2. unitPrice -> lineTotal (depends on quantity, unitPrice)
 * // 3. lineTotal -> grandTotal (depends on lineTotal)
 * //
 * // Topological sort ensures lineTotal is computed before grandTotal
 * const sorted = topologicalSort(collection);
 * // Result: [1, 2, 3] - derivations that produce lineTotal come before
 * // those that consume it
 * ```
 *
 * @public
 */
export function topologicalSort(collection: DerivationCollection): DerivationEntry[] {
  const entries = collection.entries;

  if (entries.length <= 1) {
    return [...entries];
  }

  // Build adjacency list and in-degree count
  // An edge A -> B exists if B depends on the target of A
  const graph = new Map<DerivationEntry, Set<DerivationEntry>>();
  const inDegree = new Map<DerivationEntry, number>();

  // Initialize
  for (const entry of entries) {
    graph.set(entry, new Set());
    inDegree.set(entry, 0);
  }

  // Build edges: if entry A writes to field X, and entry B depends on X,
  // then A must come before B (edge A -> B)
  for (const entryA of entries) {
    const targetField = entryA.targetFieldKey;

    for (const entryB of entries) {
      if (entryA === entryB) continue;

      // Check if B depends on the field that A produces
      const bDependsOnATarget = entryB.dependsOn.some((dep) => {
        // Exact match
        if (dep === targetField) return true;

        // Wildcard dependency - depends on everything
        if (dep === '*') return true;

        // Handle array field patterns
        // If A targets 'items.$.lineTotal' and B depends on 'lineTotal'
        if (targetField.includes('.$.')) {
          const relativePath = targetField.split('.$.')[1];
          if (dep === relativePath) return true;
        }

        return false;
      });

      if (bDependsOnATarget) {
        graph.get(entryA)!.add(entryB);
        inDegree.set(entryB, (inDegree.get(entryB) ?? 0) + 1);
      }
    }
  }

  // Kahn's algorithm: process nodes with in-degree 0
  const queue: DerivationEntry[] = [];
  const sorted: DerivationEntry[] = [];

  // Start with entries that have no dependencies on other derivation outputs
  for (const entry of entries) {
    if (inDegree.get(entry) === 0) {
      queue.push(entry);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    // Reduce in-degree for all neighbors
    for (const neighbor of graph.get(current)!) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If we couldn't sort all entries, there's a cycle
  // (but cycles should be caught by cycle-detector, so this is defensive)
  if (sorted.length !== entries.length) {
    // Return original order for entries in cycles
    const sortedSet = new Set(sorted);
    for (const entry of entries) {
      if (!sortedSet.has(entry)) {
        sorted.push(entry);
      }
    }
  }

  return sorted;
}

/**
 * Creates a sorted derivation collection.
 *
 * Returns a new collection with entries in topological order.
 * All lookup maps are preserved from the original collection.
 *
 * @param collection - The original derivation collection
 * @returns A new collection with sorted entries
 *
 * @public
 */
export function createSortedCollection(collection: DerivationCollection): DerivationCollection {
  const sortedEntries = topologicalSort(collection);

  return {
    entries: sortedEntries,
    byTarget: collection.byTarget,
    bySource: collection.bySource,
    byDependency: collection.byDependency,
    byArrayPath: collection.byArrayPath,
    wildcardEntries: collection.wildcardEntries,
  };
}
