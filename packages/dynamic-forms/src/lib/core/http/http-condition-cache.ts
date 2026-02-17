import { InjectionToken } from '@angular/core';

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

/**
 * TTL cache for HTTP condition responses with max entries eviction.
 *
 * Keyed by serialized resolved request (the `HttpResourceRequest` after expression evaluation).
 * Two different form states producing the same resolved URL+body hit the same cache entry.
 *
 * When `maxEntries` is exceeded, the oldest entry (by insertion order) is evicted.
 *
 * Provided via DI (scoped to DynamicForm component) for SSR safety.
 */
export class HttpConditionCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries = 100) {
    this.maxEntries = Math.max(1, maxEntries);
  }

  get(key: string): boolean | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: boolean, ttlMs: number): void {
    // Evict oldest entries if at capacity (Map preserves insertion order)
    while (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

/** @internal */
export const HTTP_CONDITION_CACHE = new InjectionToken<HttpConditionCache>('HttpConditionCache');
