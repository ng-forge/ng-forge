import { DestroyRef, Injector, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  auditTime,
  catchError,
  combineLatestWith,
  debounceTime,
  EMPTY,
  exhaustMap,
  filter,
  map,
  merge,
  of,
  Observable,
  pairwise,
  queueScheduler,
  scheduled,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { getChangedKeys } from '@ng-forge/dynamic-forms/internal';
import { getDebouncePeriods } from './debounce-period-utils';
import { BaseDerivationEntry } from './derivation-entry-base';
import { buildEntryStreamPipeline } from './entry-set-utils';

/**
 * Minimum shape a derivation collection must expose for the reactive setup
 * helpers to work with both value-derivation and property-derivation pipelines.
 * Both pipelines' collections satisfy this — they each carry an `entries`
 * array of {@link BaseDerivationEntry}-conforming records.
 *
 * @internal
 */
export interface ReactiveDerivationCollection {
  entries: ReadonlyArray<Pick<BaseDerivationEntry, 'trigger' | 'debounceMs'>>;
}

/**
 * Options shared by both `setupOnChangeStream` and `setupDebouncedStream`.
 * Centralizes the boilerplate of subscribing through `toObservable` + the
 * orchestrator's destroyRef + the canonical error-logging label so neither
 * orchestrator has to duplicate it.
 *
 * @internal
 */
interface BaseReactiveStreamOptions<TCollection extends ReactiveDerivationCollection> {
  /** Injector for `toObservable` calls. Must be the orchestrator's `inject(Injector)`. */
  injector: Injector;
  /** DestroyRef tied to the orchestrator instance — auto-cleans the subscription on form teardown. */
  destroyRef: DestroyRef;
  /** Logger used for stream-level errors (synchronous throws inside operators). */
  logger: Logger;
  /** Human-readable label inserted into the error log, e.g. 'Derivation onChange stream error'. */
  errorLabel: string;
  /** Signal exposing the orchestrator's collected derivations (or null when there are none). */
  collectionSignal: Signal<TCollection | null>;
  /** Signal exposing the live form value. */
  formValueSignal: Signal<Record<string, unknown>>;
}

/**
 * Options for the **onChange** reactive stream.
 *
 * @internal
 */
export interface OnChangeStreamOptions<TCollection extends ReactiveDerivationCollection> extends BaseReactiveStreamOptions<TCollection> {
  applyOnChange: (collection: TCollection, changedFields: Set<string>) => void;
  additionalAwakeners?: Signal<unknown>[];
}

/**
 * Subscribe to the onChange reactive stream and route emissions through
 * `applyOnChange`. The pipeline:
 *
 * @internal
 */
export function setupOnChangeStream<TCollection extends ReactiveDerivationCollection>(opts: OnChangeStreamOptions<TCollection>): void {
  const collection$ = toObservable(opts.collectionSignal, { injector: opts.injector });
  const formValue$ = toObservable(opts.formValueSignal, { injector: opts.injector });
  const extra$ = opts.additionalAwakeners?.length ? opts.additionalAwakeners.map((s) => toObservable(s, { injector: opts.injector })) : [];

  collection$
    .pipe(
      filter((collection): collection is TCollection => collection !== null),
      combineLatestWith(formValue$, ...extra$),
      auditTime(0),
      startWith(null as readonly unknown[] | null),
      pairwise(),
      filter((pair): pair is [readonly unknown[] | null, readonly unknown[]] => pair[1] !== null),
      map(([previous, current]) => ({
        collection: current[0] as TCollection,
        changedFields: getChangedKeys(
          (previous?.[1] as Record<string, unknown> | undefined) ?? null,
          current[1] as Record<string, unknown>,
        ),
      })),
      exhaustMap(({ collection, changedFields }) => {
        opts.applyOnChange(collection, changedFields);
        return scheduled([null], queueScheduler);
      }),
      takeUntilDestroyed(opts.destroyRef),
    )
    .subscribe({
      error: (err) => opts.logger.error(opts.errorLabel, err),
    });
}

/**
 * Options for the **debounced** reactive stream.
 *
 * @internal
 */
export interface DebouncedStreamOptions<TCollection extends ReactiveDerivationCollection> extends BaseReactiveStreamOptions<TCollection> {
  applyDebouncedForPeriod: (debounceMs: number, collection: TCollection, changedFields: Set<string>) => void;
}

/**
 * Subscribe to the debounced reactive stream and route emissions through
 * `applyDebouncedForPeriod`. See {@link DebouncedStreamOptions} for stream
 * shape; uses `switchMap` (not `exhaustMap`) so newer changes cancel
 * older still-debouncing work — we want only the latest debounced value
 * applied per period.
 *
 * @internal
 */
export function setupDebouncedStream<TCollection extends ReactiveDerivationCollection>(opts: DebouncedStreamOptions<TCollection>): void {
  toObservable(opts.formValueSignal, { injector: opts.injector })
    .pipe(
      debounceTime(DEFAULT_DEBOUNCE_MS),
      startWith(null as Record<string, unknown> | null),
      pairwise(),
      filter((pair): pair is [Record<string, unknown> | null, Record<string, unknown>] => pair[1] !== null),
      map(([previous, current]) => ({ current, changedFields: getChangedKeys(previous, current) })),
      filter(({ changedFields }) => changedFields.size > 0),
      switchMap(({ changedFields }) => {
        const collection = untracked(() => opts.collectionSignal());
        if (!collection) return of(null);

        const debouncePeriods = getDebouncePeriods(collection.entries);
        if (debouncePeriods.length === 0) return of(null);

        const periodStreams: Observable<unknown>[] = debouncePeriods.map((debounceMs) => {
          const additionalWait = Math.max(0, debounceMs - DEFAULT_DEBOUNCE_MS);
          if (additionalWait === 0) {
            return of(null).pipe(
              map(() => {
                opts.applyDebouncedForPeriod(debounceMs, collection, changedFields);
              }),
            );
          }
          return timer(additionalWait).pipe(
            map(() => {
              // Re-read collection because additional wait may have elapsed
              const fresh = untracked(() => opts.collectionSignal()) ?? collection;
              opts.applyDebouncedForPeriod(debounceMs, fresh, changedFields);
            }),
          );
        });

        return merge(...periodStreams);
      }),
      takeUntilDestroyed(opts.destroyRef),
    )
    .subscribe({
      error: (err) => opts.logger.error(opts.errorLabel, err),
    });
}

/**
 * Options for setting up an entry-keyed async stream (HTTP derivations or
 * registered async-function derivations). Both orchestrators previously
 * hand-rolled this pattern: subscribe to the collection signal via
 * {@link buildEntryStreamPipeline}, filter to entries of the relevant kind,
 * key each emission by a stable signature so unrelated topological reorderings
 * don't churn subscriptions, and per-entry call the caller's `createStream`.
 *
 * @internal
 */
export interface EntryAsyncStreamOptions<TCollection extends ReactiveDerivationCollection, TEntry> {
  injector: Injector;
  destroyRef: DestroyRef;
  logger: Logger;
  /** Human-readable label included in outer-pipeline error logs. */
  errorLabel: string;
  collectionSignal: Signal<TCollection | null>;
  /** Return only the entries this stream cares about (HTTP-bearing, async-bearing, …). */
  selectEntries: (collection: TCollection | null) => TEntry[];
  /** Stable identity for an entry. Used by `entrySetsEqual` to skip rebuild when the set is unchanged. */
  entrySignature: (entry: TEntry) => string;
  /** Build the inner per-entry stream. Returning `null` suppresses the entry (e.g., HttpClient missing). */
  createStream: (entry: TEntry) => Observable<unknown> | null;
}

/**
 * Subscribe to an entry-keyed async stream. Both HTTP and async-function
 * variants of both pipelines share this exact wrapping; only the
 * caller-supplied callbacks change.
 *
 * @internal
 */
export function setupEntryAsyncStream<TCollection extends ReactiveDerivationCollection, TEntry>(
  opts: EntryAsyncStreamOptions<TCollection, TEntry>,
): void {
  const collection$ = toObservable(opts.collectionSignal, { injector: opts.injector });

  buildEntryStreamPipeline<TCollection, TEntry>({
    collection$,
    selectEntries: opts.selectEntries,
    entrySignature: opts.entrySignature,
    createStream: opts.createStream,
  })
    .pipe(
      catchError((err) => {
        opts.logger.error(opts.errorLabel, err);
        return EMPTY;
      }),
      takeUntilDestroyed(opts.destroyRef),
    )
    .subscribe();
}
