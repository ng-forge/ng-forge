import { describe, expect, it } from 'vitest';
import { topologicalSort } from './derivation-sorter';
import { DerivationEntry } from './derivation-types';

describe('derivation-sorter', () => {
  /**
   * Helper to create a derivation entry for testing.
   * Now uses single fieldKey (self-targeting pattern).
   */
  function createEntry(fieldKey: string, dependsOn: string[] = []): DerivationEntry {
    return {
      fieldKey,
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
      const entry = createEntry('total', ['quantity', 'price']);
      const result = topologicalSort([entry]);
      expect(result).toEqual([entry]);
    });

    it('should sort independent derivations (no change needed)', () => {
      const entry1 = createEntry('fieldA', ['x']);
      const entry2 = createEntry('fieldB', ['y']);
      const result = topologicalSort([entry1, entry2]);

      // Both are independent, order should be preserved
      expect(result).toContain(entry1);
      expect(result).toContain(entry2);
    });

    it('should sort chain derivations in correct order', () => {
      // Chain: a -> subtotal -> total
      // subtotal depends on a
      // total depends on subtotal
      const entrySubtotal = createEntry('subtotal', ['quantity', 'price']);
      const entryTotal = createEntry('total', ['subtotal', 'taxRate']);

      const result = topologicalSort([entryTotal, entrySubtotal]); // Wrong order in input

      // entrySubtotal should come before entryTotal
      expect(result.indexOf(entrySubtotal)).toBeLessThan(result.indexOf(entryTotal));
    });

    it('should sort diamond pattern correctly', () => {
      // Diamond pattern:
      // baseAmount (no deps)
      // discount depends on baseAmount
      // tax depends on baseAmount
      // total depends on discount and tax
      const entryDiscount = createEntry('discount', ['baseAmount']);
      const entryTax = createEntry('tax', ['baseAmount']);
      const entryTotal = createEntry('total', ['discount', 'tax']);

      // Mix up the order
      const result = topologicalSort([entryTotal, entryTax, entryDiscount]);

      // entryDiscount and entryTax should come before entryTotal
      expect(result.indexOf(entryDiscount)).toBeLessThan(result.indexOf(entryTotal));
      expect(result.indexOf(entryTax)).toBeLessThan(result.indexOf(entryTotal));
    });

    it('should handle derivation depending on multiple fields', () => {
      // fullName depends on firstName and lastName
      const entryFullName = createEntry('fullName', ['firstName', 'lastName']);
      // displayName depends on fullName
      const entryDisplayName = createEntry('displayName', ['fullName']);

      const result = topologicalSort([entryDisplayName, entryFullName]);

      // entryFullName should come before entryDisplayName
      expect(result.indexOf(entryFullName)).toBeLessThan(result.indexOf(entryDisplayName));
    });

    it('should handle wildcard dependencies (process last)', () => {
      const entry1 = createEntry('computed1', ['field1']);
      const entry2 = createEntry('summary', ['*']); // Wildcard - depends on everything
      const entry3 = createEntry('computed2', ['field2']);

      const result = topologicalSort([entry2, entry1, entry3]);

      // entry2 (wildcard) should come after entry1 and entry3
      expect(result.indexOf(entry1)).toBeLessThan(result.indexOf(entry2));
      expect(result.indexOf(entry3)).toBeLessThan(result.indexOf(entry2));
    });

    it('should handle bidirectional derivations gracefully', () => {
      // Bidirectional: amountUSD <-> amountEUR (these form a cycle but are allowed)
      // amountUSD depends on amountEUR
      // amountEUR depends on amountUSD
      const entryUSD = createEntry('amountUSD', ['amountEUR']);
      const entryEUR = createEntry('amountEUR', ['amountUSD']);

      const result = topologicalSort([entryUSD, entryEUR]);

      // Both should be in result (order may vary due to cycle)
      expect(result).toContain(entryUSD);
      expect(result).toContain(entryEUR);
      expect(result.length).toBe(2);
    });
  });
});
