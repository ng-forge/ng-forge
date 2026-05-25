/**
 * Compares two entry lists as multisets of content signatures. Order-insensitive
 * — entries reordered with the same content compare equal, so topological-sort
 * reorderings triggered by unrelated entries don't churn downstream stream
 * lifecycles.
 *
 * Multiset (not set) semantics: two distinct entries with identical signatures
 * are counted separately, so `[A, B]` does NOT equal `[A, A]` even though both
 * have length 2 and both contain `A` as a signature.
 *
 * Used by the value-derivation and property-derivation orchestrators to gate
 * `distinctUntilChanged` over HTTP- and async-function-entry sets.
 *
 * @internal
 */
export function entrySetsEqual<T>(prev: T[], next: T[], sig: (item: T) => string): boolean {
  if (prev.length !== next.length) return false;

  const counts = new Map<string, number>();
  for (const item of prev) {
    const key = sig(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const item of next) {
    const key = sig(item);
    const remaining = counts.get(key);
    if (!remaining) return false;
    if (remaining === 1) counts.delete(key);
    else counts.set(key, remaining - 1);
  }

  return counts.size === 0;
}
