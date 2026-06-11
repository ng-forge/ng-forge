import { DerivationEntry } from './derivation-types';

/**
 * Sorts derivation entries in topological order based on their dependencies.
 *
 * @param entries - The derivation entries to sort
 * @returns A new array of entries in topological order
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
    // Group-nested entries (e.g. 'person.fullName') have relative dependencies;
    // resolving them against the entry's own parent path keeps groups with
    // identically named leaves from coupling to each other.
    const groupPath =
      entryB.fieldKey.includes('.') && !entryB.fieldKey.includes('.$.')
        ? entryB.fieldKey.slice(0, entryB.fieldKey.lastIndexOf('.'))
        : undefined;

    for (const dep of entryB.dependsOn) {
      // Skip wildcards here - handled separately below
      if (dep === '*') continue;

      // O(1) lookup: find all derivations that produce this dependency,
      // by exact key plus the group-scoped key for relative dependencies
      const producers = [
        ...(derivationsByField.get(dep) ?? []),
        ...(groupPath && !dep.includes('.') ? (derivationsByField.get(`${groupPath}.${dep}`) ?? []) : []),
      ];
      for (const entryA of producers) {
        const entryAEdges = graph.get(entryA);
        if (entryA !== entryB && entryAEdges && !entryAEdges.has(entryB)) {
          entryAEdges.add(entryB);
          inDegree.set(entryB, (inDegree.get(entryB) ?? 0) + 1);
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
