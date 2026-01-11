import { describe, expect, it } from 'vitest';
import { topologicalSort, createSortedCollection } from './derivation-sorter';
import { DerivationCollection, DerivationEntry, createEmptyDerivationCollection } from './derivation-types';

describe('derivation-sorter', () => {
  /**
   * Helper to create a derivation entry for testing.
   */
  function createEntry(source: string, target: string, dependsOn: string[] = [source]): DerivationEntry {
    return {
      sourceFieldKey: source,
      targetFieldKey: target,
      dependsOn,
      condition: true,
      trigger: 'onChange',
      isShorthand: false,
    };
  }

  /**
   * Helper to create a collection from entries.
   */
  function createCollection(entries: DerivationEntry[]): DerivationCollection {
    const collection = createEmptyDerivationCollection();
    collection.entries = entries;

    // Build lookup maps
    for (const entry of entries) {
      const targetEntries = collection.byTarget.get(entry.targetFieldKey) ?? [];
      targetEntries.push(entry);
      collection.byTarget.set(entry.targetFieldKey, targetEntries);

      const sourceEntries = collection.bySource.get(entry.sourceFieldKey) ?? [];
      sourceEntries.push(entry);
      collection.bySource.set(entry.sourceFieldKey, sourceEntries);

      for (const dep of entry.dependsOn) {
        if (dep !== '*') {
          const depEntries = collection.byDependency.get(dep) ?? [];
          depEntries.push(entry);
          collection.byDependency.set(dep, depEntries);
        }
      }
    }

    return collection;
  }

  describe('topologicalSort', () => {
    it('should return empty array for empty collection', () => {
      const collection = createCollection([]);
      const result = topologicalSort(collection);
      expect(result).toEqual([]);
    });

    it('should return single entry unchanged', () => {
      const entry = createEntry('a', 'b');
      const collection = createCollection([entry]);
      const result = topologicalSort(collection);
      expect(result).toEqual([entry]);
    });

    it('should sort independent derivations (no change needed)', () => {
      const entry1 = createEntry('a', 'b');
      const entry2 = createEntry('c', 'd');
      const collection = createCollection([entry1, entry2]);
      const result = topologicalSort(collection);

      // Both are independent, order should be preserved
      expect(result).toContain(entry1);
      expect(result).toContain(entry2);
    });

    it('should sort chain derivations in correct order', () => {
      // Chain: a -> b -> c
      const entry1 = createEntry('a', 'b', ['a']); // a produces b
      const entry2 = createEntry('b', 'c', ['b']); // b produces c (depends on b)
      const collection = createCollection([entry2, entry1]); // Wrong order in input

      const result = topologicalSort(collection);

      // entry1 (a->b) should come before entry2 (b->c)
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry2));
    });

    it('should sort diamond pattern correctly', () => {
      // Diamond: a -> b, a -> c, b -> d, c -> d
      const entry1 = createEntry('a', 'b', ['a']); // a produces b
      const entry2 = createEntry('a', 'c', ['a']); // a produces c
      const entry3 = createEntry('b', 'd', ['b']); // b produces d
      const entry4 = createEntry('c', 'd', ['c']); // c produces d (also)

      // Mix up the order
      const collection = createCollection([entry4, entry3, entry2, entry1]);
      const result = topologicalSort(collection);

      // entry1 and entry2 should come before entry3 and entry4
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry3));
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry4));
      expect(result.indexOf(entry2)).toBeLessThan(result.indexOf(entry3));
      expect(result.indexOf(entry2)).toBeLessThan(result.indexOf(entry4));
    });

    it('should handle derivation depending on multiple fields', () => {
      // total depends on quantity and price
      const entry1 = createEntry('qty', 'subtotal', ['qty']);
      const entry2 = createEntry('price', 'subtotal', ['price']); // Also targets subtotal
      const entry3 = createEntry('subtotal', 'total', ['subtotal']); // Depends on subtotal

      const collection = createCollection([entry3, entry1, entry2]);
      const result = topologicalSort(collection);

      // entry3 should come after entry1 and entry2
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry3));
      expect(result.indexOf(entry2)).toBeLessThan(result.indexOf(entry3));
    });

    it('should handle wildcard dependencies (process last)', () => {
      const entry1 = createEntry('a', 'b', ['a']);
      const entry2 = createEntry('*', 'c', ['*']); // Wildcard - depends on everything
      const entry3 = createEntry('d', 'e', ['d']);

      const collection = createCollection([entry2, entry1, entry3]);
      const result = topologicalSort(collection);

      // entry2 (wildcard) should come after entry1 and entry3
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry2));
      expect(result.indexOf(entry3)).toBeLessThan(result.indexOf(entry2));
    });

    it('should handle bidirectional derivations gracefully', () => {
      // Bidirectional: a <-> b (these form a cycle but are allowed)
      const entry1 = createEntry('a', 'b', ['a']);
      const entry2 = createEntry('b', 'a', ['b']);

      const collection = createCollection([entry1, entry2]);
      const result = topologicalSort(collection);

      // Both should be in result (order may vary due to cycle)
      expect(result).toContain(entry1);
      expect(result).toContain(entry2);
      expect(result.length).toBe(2);
    });
  });

  describe('createSortedCollection', () => {
    it('should return new collection with sorted entries', () => {
      const entry1 = createEntry('a', 'b', ['a']);
      const entry2 = createEntry('b', 'c', ['b']);
      const collection = createCollection([entry2, entry1]);

      const sorted = createSortedCollection(collection);

      // Should be a new collection object
      expect(sorted).not.toBe(collection);

      // Entries should be sorted
      expect(sorted.entries.indexOf(entry1)).toBeLessThan(sorted.entries.indexOf(entry2));

      // Lookup maps should be preserved
      expect(sorted.byTarget).toBe(collection.byTarget);
      expect(sorted.bySource).toBe(collection.bySource);
      expect(sorted.byDependency).toBe(collection.byDependency);
    });
  });
});
