import { describe, expect, it } from 'vitest';
import { parseArrayPath } from '../../utils/path-utils/path-utils';
import { getParentPathInScope, resolveArrayItemScope } from './evaluation-scope';

describe('getParentPathInScope', () => {
  it('returns undefined for a single-segment root key', () => {
    expect(getParentPathInScope('state')).toBeUndefined();
  });

  it('returns the parent for a two-segment path', () => {
    expect(getParentPathInScope('address.state')).toBe('address');
  });

  it('returns the innermost parent for nested groups', () => {
    expect(getParentPathInScope('org.address.state')).toBe('org.address');
  });

  it('returns undefined for an empty string', () => {
    expect(getParentPathInScope('')).toBeUndefined();
  });
});

describe('resolveArrayItemScope', () => {
  it('returns the array item itself as both groupValue and fieldValue when the leaf has no relative path', () => {
    const pathInfo = parseArrayPath('items');
    const arrayItem = { name: 'Widget' };

    const scope = resolveArrayItemScope(pathInfo, arrayItem);

    expect(scope.relativePath).toBe('');
    expect(scope.groupValue).toBe(arrayItem);
    expect(scope.fieldValue).toBe(arrayItem);
  });

  it('resolves the leaf value for a direct child of the array item', () => {
    const pathInfo = parseArrayPath('items.$.name');
    const arrayItem = { name: 'Widget', quantity: 3 };

    const scope = resolveArrayItemScope(pathInfo, arrayItem);

    expect(scope.relativePath).toBe('name');
    // Direct child: nearest parent is the array item itself.
    expect(scope.groupValue).toBe(arrayItem);
    expect(scope.fieldValue).toBe('Widget');
  });

  it('resolves groupValue to the inner group when the leaf is nested under a group inside the array item', () => {
    const pathInfo = parseArrayPath('items.$.address.state');
    const arrayItem = { address: { country: 'usa', state: 'NY' } };

    const scope = resolveArrayItemScope(pathInfo, arrayItem);

    expect(scope.relativePath).toBe('address.state');
    expect(scope.groupValue).toEqual({ country: 'usa', state: 'NY' });
    expect(scope.fieldValue).toBe('NY');
  });

  it('resolves multi-segment inner paths', () => {
    const pathInfo = parseArrayPath('items.$.contact.address.zip');
    const arrayItem = { contact: { address: { zip: '12345' } } };

    const scope = resolveArrayItemScope(pathInfo, arrayItem);

    expect(scope.relativePath).toBe('contact.address.zip');
    expect(scope.groupValue).toEqual({ zip: '12345' });
    expect(scope.fieldValue).toBe('12345');
  });

  it('returns undefined fieldValue when the leaf is missing on a fresh array item', () => {
    const pathInfo = parseArrayPath('items.$.name');
    const arrayItem = {} as Record<string, unknown>;

    const scope = resolveArrayItemScope(pathInfo, arrayItem);

    expect(scope.relativePath).toBe('name');
    expect(scope.groupValue).toBe(arrayItem);
    expect(scope.fieldValue).toBeUndefined();
  });
});
