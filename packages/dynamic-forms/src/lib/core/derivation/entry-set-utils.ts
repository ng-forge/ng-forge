import { EMPTY, Observable, distinctUntilChanged, map, switchMap, merge } from 'rxjs';

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

/**
 * Configuration for {@link buildEntryStreamPipeline}.
 *
 * @internal
 */
export interface EntryStreamPipelineConfig<TCollection, TEntry> {
  /** Source of collection updates (typically a `toObservable(...computed)`). */
  collection$: Observable<TCollection | null>;

  /** Extracts the subset of entries this pipeline cares about. */
  selectEntries: (collection: TCollection | null) => TEntry[];

  /** Content-addressed identity for each entry; consumed by {@link entrySetsEqual}. */
  entrySignature: (entry: TEntry) => string;

  /**
   * Builds an Observable for an entry. The returned stream's lifecycle is
   * owned by the outer pipeline — when the entry set changes, the previous
   * merged inner stream is unsubscribed (cancelling in-flight work) and a
   * fresh batch is created from the new entries.
   *
   * Return `null` to skip an entry (e.g., when a prerequisite like
   * `HttpClient` is unavailable and an error was already logged upstream).
   */
  createStream: (entry: TEntry) => Observable<unknown> | null;
}

/**
 * Declarative pipeline shared by both derivation orchestrators:
 *
 * 1. Project the collection down to a typed entry list.
 * 2. Skip rebuilds when the entry set hasn't changed (multiset comparison).
 * 3. `switchMap` cancels the previous merged inner streams and creates fresh
 *    ones from the new entries; in-flight HTTP / async work is cancelled via
 *    ordinary RxJS unsubscribe semantics.
 *
 * No mutable subscription bookkeeping; the caller pipes through
 * `takeUntilDestroyed` for unmount cleanup.
 *
 * @internal
 */
export function buildEntryStreamPipeline<TCollection, TEntry>(config: EntryStreamPipelineConfig<TCollection, TEntry>): Observable<unknown> {
  return config.collection$.pipe(
    map((collection) => config.selectEntries(collection)),
    distinctUntilChanged((prev, next) => entrySetsEqual(prev, next, config.entrySignature)),
    switchMap((entries) => {
      if (entries.length === 0) return EMPTY;
      const streams = entries.map((entry) => config.createStream(entry)).filter((stream): stream is Observable<unknown> => stream !== null);
      if (streams.length === 0) return EMPTY;
      return merge(...streams);
    }),
  );
}
