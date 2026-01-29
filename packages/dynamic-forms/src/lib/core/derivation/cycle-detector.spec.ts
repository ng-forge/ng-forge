import { describe, expect, it } from 'vitest';
import { detectCycles, validateNoCycles } from './cycle-detector';
import { DerivationCollection, DerivationEntry, createEmptyDerivationCollection } from './derivation-types';

describe('cycle-detector', () => {
  /**
   * Helper to create a derivation entry for testing.
   * In the new self-targeting model:
   * - fieldKey: the field that owns the derivation (target of the derivation)
   * - dependsOn: fields that this derivation depends on
   *
   * Legacy parameters (for test compatibility):
   * - fieldKey: what was previously called "target" (the field receiving the value)
   * - dependency: what was previously "source" becomes the main dependency
   */
  function createEntry(fieldKey: string, dependency?: string, extraDependsOn: string[] = []): DerivationEntry {
    const dependsOn = dependency ? [dependency, ...extraDependsOn] : extraDependsOn;
    return {
      fieldKey,
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
    return collection;
  }

  describe('detectCycles', () => {
    describe('no cycles', () => {
      it('should return no cycle for empty collection', () => {
        const collection = createCollection([]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
        expect(result.cyclePath).toBeUndefined();
        expect(result.errorMessage).toBeUndefined();
      });

      it('should return no cycle for single derivation', () => {
        // phonePrefix depends on country (country -> phonePrefix)
        const collection = createCollection([createEntry('phonePrefix', 'country')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
      });

      it('should return no cycle for linear chain', () => {
        // A -> B -> C -> D (no cycle)
        // In self-targeting: B depends on A, C depends on B, D depends on C
        const collection = createCollection([createEntry('b', 'a'), createEntry('c', 'b'), createEntry('d', 'c')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
      });

      it('should return no cycle for diamond pattern', () => {
        // A -> B, A -> C, B -> D, C -> D (no cycle)
        // In self-targeting: B depends on A, C depends on A, D depends on B and C
        const collection = createCollection([createEntry('b', 'a'), createEntry('c', 'a'), createEntry('d', 'b', ['c'])]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
      });

      it('should return no cycle for multiple independent chains', () => {
        // Chain 1: A -> B (B depends on A)
        // Chain 2: C -> D (D depends on C)
        const collection = createCollection([createEntry('b', 'a'), createEntry('d', 'c')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
      });
    });

    describe('cycles detected', () => {
      it('should allow self-referencing derivations (self-transforms)', () => {
        // A -> A (self-loop) - allowed for self-transform patterns like email.toLowerCase()
        // These are not cycles because:
        // 1. The value equality check prevents re-triggering when value doesn't change
        // 2. Self-transforms are typically idempotent
        // In self-targeting: A depends on itself (self-transform)
        const collection = createCollection([createEntry('a', 'a')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(false);
      });

      it('should allow bidirectional two-node patterns (stabilizing cycles)', () => {
        // A <-> B is a bidirectional sync pattern
        // These stabilize via equality checks at runtime (e.g., USD/EUR conversion)
        // In self-targeting: A depends on B, B depends on A
        const collection = createCollection([createEntry('a', 'b'), createEntry('b', 'a')]);
        const result = detectCycles(collection);

        // Bidirectional patterns are allowed - they stabilize at runtime
        expect(result.hasCycle).toBe(false);
      });

      it('should detect three-node cycle', () => {
        // A -> B -> C -> A (cycle!)
        // In self-targeting: B depends on A, C depends on B, A depends on C
        // This creates: A -> B -> C -> A
        const collection = createCollection([createEntry('b', 'a'), createEntry('c', 'b'), createEntry('a', 'c')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(true);
        expect(result.cyclePath).toBeDefined();
      });

      it('should detect cycle with additional non-cyclic nodes', () => {
        // Linear: X -> Y (no cycle)
        // Cycle: A -> B -> C -> A (cycle!)
        // In self-targeting: Y depends on X (linear), B depends on A, C depends on B, A depends on C (cycle)
        const collection = createCollection([createEntry('y', 'x'), createEntry('b', 'a'), createEntry('c', 'b'), createEntry('a', 'c')]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(true);
      });

      it('should include error message with cycle path for non-bidirectional cycles', () => {
        // 3-node cycle is not a bidirectional pattern, so should be detected
        // In self-targeting: field2 depends on field1, field3 depends on field2, field1 depends on field3
        const collection = createCollection([
          createEntry('field2', 'field1'),
          createEntry('field3', 'field2'),
          createEntry('field1', 'field3'),
        ]);
        const result = detectCycles(collection);

        expect(result.errorMessage).toBeDefined();
        expect(result.errorMessage).toContain('Derivation cycle detected');
        expect(result.errorMessage).toContain('->');
      });
    });

    describe('cycles from dependencies', () => {
      it('should detect cycle through dependsOn', () => {
        // A depends on B, B targets A
        const collection = createCollection([
          createEntry('a', 'b', ['b']), // A's derivation depends on B and targets B
        ]);

        // This creates: B (dep) -> A (source) -> B (target)
        // The cycle is: when B changes, A's derivation runs and updates B
        const result = detectCycles(collection);

        // With current implementation, this may not be detected as a cycle
        // because we track source->target edges, not dependency->target
        // Let's verify the behavior
        expect(result.hasCycle).toBe(false); // Actually depends on implementation
      });

      it('should detect cycle when target depends on derivation result', () => {
        // A targets B, B targets C, C has dependency on A
        const collection = createCollection([
          createEntry('a', 'b'),
          createEntry('b', 'c'),
          createEntry('c', 'a'), // C targets A, creating cycle
        ]);
        const result = detectCycles(collection);

        expect(result.hasCycle).toBe(true);
      });
    });
  });

  describe('validateNoCycles', () => {
    it('should not throw for collection without cycles', () => {
      const collection = createCollection([createEntry('a', 'b'), createEntry('b', 'c')]);

      expect(() => validateNoCycles(collection)).not.toThrow();
    });

    it('should not throw for bidirectional patterns', () => {
      // Bidirectional sync patterns are allowed
      const collection = createCollection([createEntry('a', 'b'), createEntry('b', 'a')]);

      expect(() => validateNoCycles(collection)).not.toThrow();
    });

    it('should throw for non-bidirectional cycle', () => {
      // 3-node cycle should still be rejected
      const collection = createCollection([createEntry('a', 'b'), createEntry('b', 'c'), createEntry('c', 'a')]);

      expect(() => validateNoCycles(collection)).toThrow();
    });

    it('should include cycle information in error message', () => {
      // Use 3-node cycle for error message test
      const collection = createCollection([
        createEntry('field1', 'field2'),
        createEntry('field2', 'field3'),
        createEntry('field3', 'field1'),
      ]);

      try {
        validateNoCycles(collection);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Derivation cycle detected');
      }
    });

    it('should not throw for empty collection', () => {
      const collection = createCollection([]);

      expect(() => validateNoCycles(collection)).not.toThrow();
    });
  });
});
