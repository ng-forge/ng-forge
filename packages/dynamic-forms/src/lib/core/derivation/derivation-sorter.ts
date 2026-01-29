import { DerivationEntry } from './derivation-types';

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
 * @param entries - The derivation entries to sort
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
 * const sorted = topologicalSort(entries);
 * // Result: [1, 2, 3] - derivations that produce lineTotal come before
 * // those that consume it
 * ```
 *
 * @public
 */
export function topologicalSort(entries: DerivationEntry[]): DerivationEntry[] {
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

  // Pre-build index: field key -> entries that produce/target it
  // This enables O(1) lookup instead of O(n) scanning
  const derivationsByField = new Map<string, DerivationEntry[]>();
  for (const entry of entries) {
    // Index by exact field key
    const fieldEntries = derivationsByField.get(entry.fieldKey) ?? [];
    fieldEntries.push(entry);
    derivationsByField.set(entry.fieldKey, fieldEntries);

    // Also index array field relative paths for array derivations
    // If entry targets 'items.$.lineTotal', index under 'lineTotal' too
    if (entry.fieldKey.includes('.$.')) {
      const relativePath = entry.fieldKey.split('.$.')[1];
      if (relativePath) {
        const relativeEntries = derivationsByField.get(relativePath) ?? [];
        relativeEntries.push(entry);
        derivationsByField.set(relativePath, relativeEntries);
      }
    }
  }

  // Collect entries with wildcard dependencies (need special handling)
  const wildcardDependents: DerivationEntry[] = [];
  for (const entry of entries) {
    if (entry.dependsOn.includes('*')) {
      wildcardDependents.push(entry);
    }
  }

  // Build edges using pre-computed index
  // For each entry B, find all entries A whose field is in B's dependencies
  // If B depends on field X, and A produces X, then A must run before B
  for (const entryB of entries) {
    for (const dep of entryB.dependsOn) {
      // Skip wildcards here - handled separately below
      if (dep === '*') continue;

      // O(1) lookup: find all derivations that produce this dependency
      const producers = derivationsByField.get(dep);
      if (producers) {
        for (const entryA of producers) {
          const entryAEdges = graph.get(entryA);
          if (entryA !== entryB && entryAEdges && !entryAEdges.has(entryB)) {
            entryAEdges.add(entryB);
            inDegree.set(entryB, (inDegree.get(entryB) ?? 0) + 1);
          }
        }
      }
    }
  }

  // Handle wildcard dependencies: they depend on ALL producers
  for (const entryB of wildcardDependents) {
    for (const entryA of entries) {
      const entryAEdges = graph.get(entryA);
      if (entryA !== entryB && entryAEdges && !entryAEdges.has(entryB)) {
        entryAEdges.add(entryB);
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
    const current = queue.shift();
    if (!current) break; // TypeScript guard (shouldn't happen due to while condition)
    sorted.push(current);

    // Reduce in-degree for all neighbors
    const neighbors = graph.get(current) ?? new Set<DerivationEntry>();
    for (const neighbor of neighbors) {
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
