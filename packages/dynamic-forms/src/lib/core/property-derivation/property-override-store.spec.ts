import { beforeEach, describe, expect, it } from 'vitest';
import { createPropertyOverrideStore, PropertyOverrideStore } from './property-override-store';

describe('PropertyOverrideStore', () => {
  let store: PropertyOverrideStore;

  beforeEach(() => {
    store = createPropertyOverrideStore();
  });

  describe('getOverrides', () => {
    it('should return empty object for unregistered field', () => {
      const overrides = store.getOverrides('unknownField');

      expect(overrides()).toEqual({});
    });

    it('should return the same signal instance on repeated calls', () => {
      const first = store.getOverrides('fieldA');
      const second = store.getOverrides('fieldA');

      expect(first).toBe(second);
    });
  });

  describe('setOverride', () => {
    it('should set a property on a field', () => {
      store.setOverride('startDate', 'minDate', '2024-01-01');

      expect(store.getOverrides('startDate')()).toEqual({ minDate: '2024-01-01' });
    });

    it('should skip no-op when value is unchanged (deep equality)', () => {
      store.setOverride('selectField', 'options', [1, 2, 3]);
      const signalRef = store.getOverrides('selectField');
      const snapshotBefore = signalRef();

      store.setOverride('selectField', 'options', [1, 2, 3]);
      const snapshotAfter = signalRef();

      expect(snapshotAfter).toBe(snapshotBefore);
    });

    it('should remove the property key when value is undefined', () => {
      store.setOverride('field', 'prop', 'value');
      expect(store.getOverrides('field')()).toEqual({ prop: 'value' });

      store.setOverride('field', 'prop', undefined);
      expect(store.getOverrides('field')()).toEqual({});
    });

    it('should be no-op when removing a key that does not exist', () => {
      const signalRef = store.getOverrides('field');
      const snapshotBefore = signalRef();

      store.setOverride('field', 'nonexistent', undefined);
      const snapshotAfter = signalRef();

      expect(snapshotAfter).toBe(snapshotBefore);
    });
  });

  describe('registerField / hasField', () => {
    it('should return false for unregistered field', () => {
      expect(store.hasField('unknown')).toBe(false);
    });

    it('should return true after registering a field', () => {
      store.registerField('email');

      expect(store.hasField('email')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all overrides and registered fields', () => {
      store.registerField('a');
      store.registerField('b');
      store.setOverride('a', 'prop', 42);

      store.clear();

      expect(store.hasField('a')).toBe(false);
      expect(store.hasField('b')).toBe(false);
      expect(store.getOverrides('a')()).toEqual({});
    });
  });

  describe('field independence', () => {
    it('should give independent signals to different fields', () => {
      store.setOverride('fieldX', 'color', 'red');
      store.setOverride('fieldY', 'size', 10);

      expect(store.getOverrides('fieldX')()).toEqual({ color: 'red' });
      expect(store.getOverrides('fieldY')()).toEqual({ size: 10 });
    });
  });
});
