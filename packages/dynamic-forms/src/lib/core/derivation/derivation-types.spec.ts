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
    it('should create an empty collection with empty entries array', () => {
      const collection = createEmptyDerivationCollection();

      expect(collection.entries).toEqual([]);
    });

    it('should create independent instances each time', () => {
      const collection1 = createEmptyDerivationCollection();
      const collection2 = createEmptyDerivationCollection();

      const entry: DerivationEntry = {
        fieldKey: 'target',
        dependsOn: ['source'],
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
    it('should create a key from field key', () => {
      const key = createDerivationKey('phonePrefix');

      expect(key).toBe('phonePrefix');
    });

    it('should handle nested field paths', () => {
      const key = createDerivationKey('address.phonePrefix');

      expect(key).toBe('address.phonePrefix');
    });

    it('should handle array field paths', () => {
      const key = createDerivationKey('items.$.total');

      expect(key).toBe('items.$.total');
    });

    it('should handle field names that contain colons', () => {
      const key = createDerivationKey('field:with:colons');
      const parsed = parseDerivationKey(key);

      expect(parsed.fieldKey).toBe('field:with:colons');
    });
  });

  describe('parseDerivationKey', () => {
    it('should parse a key back to field key', () => {
      const key = createDerivationKey('phonePrefix');
      const { fieldKey } = parseDerivationKey(key);

      expect(fieldKey).toBe('phonePrefix');
    });

    it('should handle nested field paths', () => {
      const key = createDerivationKey('address.phonePrefix');
      const { fieldKey } = parseDerivationKey(key);

      expect(fieldKey).toBe('address.phonePrefix');
    });

    it('should handle array field paths', () => {
      const key = createDerivationKey('items.$.total');
      const { fieldKey } = parseDerivationKey(key);

      expect(fieldKey).toBe('items.$.total');
    });

    it('should round-trip with createDerivationKey', () => {
      const original = 'myField';
      const key = createDerivationKey(original);
      const parsed = parseDerivationKey(key);

      expect(parsed.fieldKey).toBe(original);
    });
  });
});
