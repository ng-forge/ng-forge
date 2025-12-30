import { describe, expect, it } from 'vitest';
import {
  createEmptyDerivationCollection,
  createDerivationChainContext,
  createDerivationKey,
  parseDerivationKey,
  DerivationEntry,
} from './derivation-types';

describe('derivation-types', () => {
  describe('createEmptyDerivationCollection', () => {
    it('should create an empty collection with empty arrays and maps', () => {
      const collection = createEmptyDerivationCollection();

      expect(collection.entries).toEqual([]);
      expect(collection.byTarget).toBeInstanceOf(Map);
      expect(collection.byTarget.size).toBe(0);
      expect(collection.bySource).toBeInstanceOf(Map);
      expect(collection.bySource.size).toBe(0);
    });

    it('should create independent instances each time', () => {
      const collection1 = createEmptyDerivationCollection();
      const collection2 = createEmptyDerivationCollection();

      const entry: DerivationEntry = {
        sourceFieldKey: 'source',
        targetFieldKey: 'target',
        dependsOn: [],
        condition: true,
        expression: 'formValue.source',
        trigger: 'onChange',
        isShorthand: false,
      };

      collection1.entries.push(entry);

      expect(collection1.entries.length).toBe(1);
      expect(collection2.entries.length).toBe(0);
    });
  });

  describe('createDerivationChainContext', () => {
    it('should create a context with initial values', () => {
      const context = createDerivationChainContext();

      expect(context.iteration).toBe(0);
      expect(context.appliedDerivations).toBeInstanceOf(Set);
      expect(context.appliedDerivations.size).toBe(0);
    });

    it('should create independent instances each time', () => {
      const context1 = createDerivationChainContext();
      const context2 = createDerivationChainContext();

      context1.iteration = 5;
      context1.appliedDerivations.add('test');

      expect(context1.iteration).toBe(5);
      expect(context1.appliedDerivations.size).toBe(1);
      expect(context2.iteration).toBe(0);
      expect(context2.appliedDerivations.size).toBe(0);
    });
  });

  describe('createDerivationKey', () => {
    it('should create a key from source and target field keys', () => {
      const key = createDerivationKey('country', 'phonePrefix');

      expect(key).toBe('country:phonePrefix');
    });

    it('should handle nested field paths', () => {
      const key = createDerivationKey('address.country', 'address.phonePrefix');

      expect(key).toBe('address.country:address.phonePrefix');
    });

    it('should handle array field paths', () => {
      const key = createDerivationKey('items.$.quantity', 'items.$.total');

      expect(key).toBe('items.$.quantity:items.$.total');
    });
  });

  describe('parseDerivationKey', () => {
    it('should parse a key back to source and target', () => {
      const { sourceKey, targetKey } = parseDerivationKey('country:phonePrefix');

      expect(sourceKey).toBe('country');
      expect(targetKey).toBe('phonePrefix');
    });

    it('should handle nested field paths', () => {
      const { sourceKey, targetKey } = parseDerivationKey('address.country:address.phonePrefix');

      expect(sourceKey).toBe('address.country');
      expect(targetKey).toBe('address.phonePrefix');
    });

    it('should handle array field paths', () => {
      const { sourceKey, targetKey } = parseDerivationKey('items.$.quantity:items.$.total');

      expect(sourceKey).toBe('items.$.quantity');
      expect(targetKey).toBe('items.$.total');
    });

    it('should round-trip with createDerivationKey', () => {
      const original = { source: 'field1', target: 'field2' };
      const key = createDerivationKey(original.source, original.target);
      const parsed = parseDerivationKey(key);

      expect(parsed.sourceKey).toBe(original.source);
      expect(parsed.targetKey).toBe(original.target);
    });
  });
});
