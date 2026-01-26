import { describe, expect, it } from 'vitest';
import { topologicalSort } from './derivation-sorter';
import { DerivationEntry } from './derivation-types';

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

  describe('topologicalSort', () => {
    it('should return empty array for empty entries', () => {
      const result = topologicalSort([]);
      expect(result).toEqual([]);
    });

    it('should return single entry unchanged', () => {
      const entry = createEntry('a', 'b');
      const result = topologicalSort([entry]);
      expect(result).toEqual([entry]);
    });

    it('should sort independent derivations (no change needed)', () => {
      const entry1 = createEntry('a', 'b');
      const entry2 = createEntry('c', 'd');
      const result = topologicalSort([entry1, entry2]);

      // Both are independent, order should be preserved
      expect(result).toContain(entry1);
      expect(result).toContain(entry2);
    });

    it('should sort chain derivations in correct order', () => {
      // Chain: a -> b -> c
      const entry1 = createEntry('a', 'b', ['a']); // a produces b
      const entry2 = createEntry('b', 'c', ['b']); // b produces c (depends on b)

      const result = topologicalSort([entry2, entry1]); // Wrong order in input

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
      const result = topologicalSort([entry4, entry3, entry2, entry1]);

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

      const result = topologicalSort([entry3, entry1, entry2]);

      // entry3 should come after entry1 and entry2
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry3));
      expect(result.indexOf(entry2)).toBeLessThan(result.indexOf(entry3));
    });

    it('should handle wildcard dependencies (process last)', () => {
      const entry1 = createEntry('a', 'b', ['a']);
      const entry2 = createEntry('*', 'c', ['*']); // Wildcard - depends on everything
      const entry3 = createEntry('d', 'e', ['d']);

      const result = topologicalSort([entry2, entry1, entry3]);

      // entry2 (wildcard) should come after entry1 and entry3
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry2));
      expect(result.indexOf(entry3)).toBeLessThan(result.indexOf(entry2));
    });

    it('should handle bidirectional derivations gracefully', () => {
      // Bidirectional: a <-> b (these form a cycle but are allowed)
      const entry1 = createEntry('a', 'b', ['a']);
      const entry2 = createEntry('b', 'a', ['b']);

      const result = topologicalSort([entry1, entry2]);

      // Both should be in result (order may vary due to cycle)
      expect(result).toContain(entry1);
      expect(result).toContain(entry2);
      expect(result.length).toBe(2);
    });
  });
});
