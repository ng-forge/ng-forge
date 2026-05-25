/**
 * Compares two entry lists by computing a content signature for each entry,
 * then comparing the resulting sets. Order-insensitive: entries reordered
 * with the same content compare equal, so topological-sort reorderings
 * triggered by unrelated entries don't churn downstream stream lifecycles.
 *
 * Used by the value-derivation and property-derivation orchestrators to gate
 * `distinctUntilChanged` over HTTP- and async-function-entry sets.
 *
 * @internal
 */
export function entrySetsEqual<T>(prev: T[], next: T[], sig: (item: T) => string): boolean {
  if (prev.length !== next.length) return false;
  const prevSigs = new Set<string>();
  for (const item of prev) prevSigs.add(sig(item));
  for (const item of next) {
    if (!prevSigs.has(sig(item))) return false;
  }
  return true;
}
