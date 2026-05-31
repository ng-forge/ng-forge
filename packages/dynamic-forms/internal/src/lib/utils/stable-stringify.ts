/**
 * Serializes a value to a deterministic string for cache key generation.
 * Unlike JSON.stringify, this sorts object keys to ensure consistent output
 * regardless of property insertion order.
 */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }

  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => JSON.stringify(key) + ':' + stableStringify(obj[key]));
  return '{' + pairs.join(',') + '}';
}
