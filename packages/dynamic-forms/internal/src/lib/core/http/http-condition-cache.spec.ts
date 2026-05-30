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

  describe('maxEntries eviction', () => {
    it('should evict oldest entry when cache exceeds maxEntries', () => {
      const smallCache = new HttpConditionCache(3);

      smallCache.set('key1', true, 30000);
      smallCache.set('key2', false, 30000);
      smallCache.set('key3', true, 30000);

      // Cache is full, adding key4 should evict key1 (oldest)
      smallCache.set('key4', false, 30000);

      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe(false);
      expect(smallCache.get('key3')).toBe(true);
      expect(smallCache.get('key4')).toBe(false);
    });

    it('should not evict when updating an existing key', () => {
      const smallCache = new HttpConditionCache(3);

      smallCache.set('key1', true, 30000);
      smallCache.set('key2', false, 30000);
      smallCache.set('key3', true, 30000);

      // Updating key2 should not evict anything
      smallCache.set('key2', true, 30000);

      expect(smallCache.get('key1')).toBe(true);
      expect(smallCache.get('key2')).toBe(true);
      expect(smallCache.get('key3')).toBe(true);
    });

    it('should evict multiple entries if needed', () => {
      const smallCache = new HttpConditionCache(2);

      smallCache.set('key1', true, 30000);
      smallCache.set('key2', false, 30000);

      // Adding key3 evicts key1
      smallCache.set('key3', true, 30000);
      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe(false);
      expect(smallCache.get('key3')).toBe(true);

      // Adding key4 evicts key2
      smallCache.set('key4', false, 30000);
      expect(smallCache.get('key2')).toBeUndefined();
      expect(smallCache.get('key3')).toBe(true);
      expect(smallCache.get('key4')).toBe(false);
    });

    it('should use default maxEntries of 100', () => {
      const defaultCache = new HttpConditionCache();

      // Fill up to 100 entries
      for (let i = 0; i < 100; i++) {
        defaultCache.set(`key${i}`, true, 30000);
      }

      // All 100 should still exist
      expect(defaultCache.get('key0')).toBe(true);
      expect(defaultCache.get('key99')).toBe(true);

      // Adding 101st should evict key0
      defaultCache.set('key100', false, 30000);
      expect(defaultCache.get('key0')).toBeUndefined();
      expect(defaultCache.get('key100')).toBe(false);
    });

    it('should handle maxEntries of 1', () => {
      const tinyCache = new HttpConditionCache(1);

      tinyCache.set('key1', true, 30000);
      expect(tinyCache.get('key1')).toBe(true);

      tinyCache.set('key2', false, 30000);
      expect(tinyCache.get('key1')).toBeUndefined();
      expect(tinyCache.get('key2')).toBe(false);
    });
  });
});
