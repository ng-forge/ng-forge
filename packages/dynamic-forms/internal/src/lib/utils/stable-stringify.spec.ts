import { stableStringify } from './stable-stringify';

describe('stableStringify', () => {
  it('should serialize null', () => {
    expect(stableStringify(null)).toBe('null');
  });

  it('should serialize undefined', () => {
    expect(stableStringify(undefined)).toBe('undefined');
  });

  it('should serialize strings', () => {
    expect(stableStringify('hello')).toBe('"hello"');
  });

  it('should serialize numbers', () => {
    expect(stableStringify(42)).toBe('42');
  });

  it('should serialize booleans', () => {
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(false)).toBe('false');
  });

  it('should serialize arrays', () => {
    expect(stableStringify([1, 'two', null])).toBe('[1,"two",null]');
  });

  it('should serialize empty arrays', () => {
    expect(stableStringify([])).toBe('[]');
  });

  it('should serialize objects with sorted keys', () => {
    const result = stableStringify({ b: 2, a: 1 });
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('should produce identical output regardless of property insertion order', () => {
    const obj1 = { method: 'GET', url: '/api/check', body: null };
    const obj2 = { url: '/api/check', body: null, method: 'GET' };
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
  });

  it('should handle nested objects', () => {
    const result = stableStringify({ outer: { b: 2, a: 1 } });
    expect(result).toBe('{"outer":{"a":1,"b":2}}');
  });

  it('should handle objects with undefined values', () => {
    const result = stableStringify({ method: undefined, url: '/api/check' });
    expect(result).toBe('{"method":undefined,"url":"/api/check"}');
  });

  it('should handle deeply nested structures', () => {
    const result = stableStringify({ a: [{ c: 3, b: 2 }], d: { f: 6, e: 5 } });
    expect(result).toBe('{"a":[{"b":2,"c":3}],"d":{"e":5,"f":6}}');
  });

  it('should handle empty objects', () => {
    expect(stableStringify({})).toBe('{}');
  });
});
