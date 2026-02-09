import { describe, expect, it } from 'vitest';
import { buildPropertyOverrideKey, PLACEHOLDER_INDEX } from './property-override-key';

describe('buildPropertyOverrideKey', () => {
  it('should return just the fieldKey for non-array fields', () => {
    expect(buildPropertyOverrideKey(undefined, undefined, 'endDate')).toBe('endDate');
  });

  it('should return composite key for array item fields', () => {
    expect(buildPropertyOverrideKey('contacts', 0, 'email')).toBe('contacts.0.email');
  });

  it('should handle different array indices', () => {
    expect(buildPropertyOverrideKey('contacts', 2, 'email')).toBe('contacts.2.email');
  });

  it('should handle index 0 as valid', () => {
    expect(buildPropertyOverrideKey('items', 0, 'quantity')).toBe('items.0.quantity');
  });

  it('should return just fieldKey when arrayKey is null', () => {
    expect(buildPropertyOverrideKey(undefined, 0, 'name')).toBe('name');
  });

  it('should return just fieldKey when index is null', () => {
    expect(buildPropertyOverrideKey('items', undefined, 'name')).toBe('name');
  });

  it('should return placeholder key with PLACEHOLDER_INDEX', () => {
    expect(buildPropertyOverrideKey('items', PLACEHOLDER_INDEX, 'endDate')).toBe('items.$.endDate');
  });

  it('should return just fieldKey when using PLACEHOLDER_INDEX without arrayKey', () => {
    expect(buildPropertyOverrideKey(undefined, PLACEHOLDER_INDEX, 'name')).toBe('name');
  });
});
