import { HttpConditionCache } from './http-condition-cache';

describe('HttpConditionCache', () => {
  let cache: HttpConditionCache;

  beforeEach(() => {
    cache = new HttpConditionCache();
  });

  it('should return undefined for cache miss', () => {
    expect(cache.get('nonexistent-key')).toBeUndefined();
  });

  it('should store and retrieve a value', () => {
    cache.set('key1', true, 30000);
    expect(cache.get('key1')).toBe(true);
  });

  it('should store false values', () => {
    cache.set('key1', false, 30000);
    expect(cache.get('key1')).toBe(false);
  });

  it('should return undefined for expired entries', () => {
    vi.useFakeTimers();
    try {
      cache.set('key1', true, 1000);
      expect(cache.get('key1')).toBe(true);

      vi.advanceTimersByTime(1001);
      expect(cache.get('key1')).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not expire entries before TTL', () => {
    vi.useFakeTimers();
    try {
      cache.set('key1', true, 5000);

      vi.advanceTimersByTime(4999);
      expect(cache.get('key1')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should overwrite existing entries', () => {
    cache.set('key1', true, 30000);
    cache.set('key1', false, 30000);
    expect(cache.get('key1')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', true, 30000);
    cache.set('key2', false, 30000);
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should handle multiple keys independently', () => {
    cache.set('key1', true, 30000);
    cache.set('key2', false, 30000);
    expect(cache.get('key1')).toBe(true);
    expect(cache.get('key2')).toBe(false);
  });

  it('should evict expired entry on get', () => {
    vi.useFakeTimers();
    try {
      cache.set('key1', true, 1000);
      vi.advanceTimersByTime(1001);

      // First get should evict
      expect(cache.get('key1')).toBeUndefined();

      // Setting a new value should work after eviction
      cache.set('key1', false, 30000);
      expect(cache.get('key1')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
