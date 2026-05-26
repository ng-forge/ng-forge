import { DestroyRef, Injector, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  auditTime,
  combineLatestWith,
  debounceTime,
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
import { Logger } from '../../providers/features/logger/logger.interface';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { getChangedKeys } from '../../utils/object-utils';
import { getDebouncePeriods } from './debounce-period-utils';
import { BaseDerivationEntry } from './derivation-entry-base';

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
 * The stream re-fires whenever either the derivation collection OR the form
 * value emits, debounced to a microtask boundary via `auditTime(0)`. Each
 * emission invokes `applyOnChange` with the current collection and the set of
 * field keys that changed since the previous emission — value-derivation uses
 * the changed set for `reEngageOnDependencyChange`; property-derivation
 * ignores it.
 *
 * `additionalAwakeners` is an optional array of signals whose changes should
 * also wake the stream (used by the value pipeline to also react to form
 * accessor changes during config swaps).
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
 * 1. `combineLatestWith` collection + formValue (+ any additional awakeners).
 * 2. `auditTime(0)` to batch synchronous signal updates that fire in the same
 *    microtask (e.g., when an exhaustMap consumer calls `value.set()`).
 * 3. `startWith(null) + pairwise()` to expose the previous value-tuple so we
 *    can compute the changed-fields set per emission.
 * 4. `exhaustMap` so re-entrant emissions (caused by the apply step setting
 *    values that propagate back through the form-value signal) are dropped
 *    rather than queued or cancelled. `scheduled([null], queueScheduler)`
 *    ensures the inner observable completes in the next microtask.
 *
 * @internal
 */
export function setupOnChangeStream<TCollection extends ReactiveDerivationCollection>(opts: OnChangeStreamOptions<TCollection>): void {
  const collection$ = toObservable(opts.collectionSignal, { injector: opts.injector });
  const formValue$ = toObservable(opts.formValueSignal, { injector: opts.injector });
  const extra$ = (opts.additionalAwakeners ?? []).map((s) => toObservable(s, { injector: opts.injector }));

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
 * The debounced stream waits until form value stops changing for
 * `DEFAULT_DEBOUNCE_MS`, computes the changed-fields set vs. the prior
 * emission, then for each unique `debounceMs` period present in the
 * collection's `'debounced'`-triggered entries, runs `applyDebouncedForPeriod`
 * after the additional wait. Per-period streams are `merge`d so different
 * debounce groups process concurrently.
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
