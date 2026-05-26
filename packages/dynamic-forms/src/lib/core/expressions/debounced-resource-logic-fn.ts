import { Injector, Resource, signal, untracked, WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, Observable, pipe } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { withPreviousValue } from '../../utils/resource-composition/with-previous-value';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';

/**
 * Trigger value carried through the debounced reactive pipeline.
 *
 * `key` is the stable identity used for `distinctUntilChanged` — the helper
 * skips a re-evaluation when the new key matches the prior one. `payload` is
 * the actual data the stream-builder consumes (an HTTP request, an
 * evaluation context, etc.) — it doesn't participate in the dedup so each
 * stream invocation receives the most-recently-set payload for its key.
 *
 * @internal
 */
export interface Trigger<TPayload> {
  key: string;
  payload: TPayload;
}

/**
 * Configuration passed to {@link createDebouncedResourceLogicFn}.
 *
 * @internal
 */
export interface DebouncedResourceLogicFnConfig<TValue, TPayload, TResult> {
  /** Default value returned by the resource while loading / pending. */
  pendingValue: TResult;
  /** Debounce window (ms) applied to the trigger signal before the resource sees it. */
  debounceMs: number;
  injector: Injector;
  /**
   * Builds the per-emission inner observable. Called every time the debounced
   * trigger key changes; the resource swaps to the new stream automatically.
   */
  buildStream: (payload: TPayload) => Observable<TResult>;
  /**
   * Called per LogicFn invocation. Returns one of:
   *   - `{ kind: 'trigger', key, payload }` — set the trigger to this and
   *     return the (potentially still-loading) resource value.
   *   - `{ kind: 'returnEarly', value }` — bypass the resource and return
   *     this value directly (used by HTTP for response-cache hits — the
   *     cached value is authoritative and overrides any sticky resource value).
   *   - `{ kind: 'holdPrevious' }` — bypass the resource update but return
   *     the resource's current sticky value (its last resolved value via
   *     `withPreviousValue`, or `pendingValue` if it never resolved). Used
   *     by HTTP when the request template is temporarily unresolvable so
   *     the UI doesn't flicker back to `pendingValue`.
   */
  resolve: (
    ctx: FieldContext<TValue>,
  ) => { kind: 'trigger'; key: string; payload: TPayload } | { kind: 'returnEarly'; value: TResult } | { kind: 'holdPrevious' };
}

/**
 * Per-field resource handle held in the LogicFn's signal store. Each call to
 * the LogicFn with a unique field path reuses the same handle so the
 * underlying `rxResource` lifecycle persists.
 *
 * @internal
 */
interface ResourceHandle<TPayload, TResult> {
  trigger: WritableSignal<Trigger<TPayload> | undefined>;
  resultResource: Resource<TResult>;
}

/**
 * Shared scaffolding for both async-function and HTTP condition LogicFns.
 *
 * Encapsulates the pattern that was duplicated across the two files:
 *
 *   1. A per-field map keyed by `safeReadPathKeys(ctx).join('.')`. Each entry
 *      owns one trigger signal + one `rxResource` instance, kept alive for the
 *      lifetime of the LogicFn so the resource's loading/error state persists
 *      across LogicFn invocations.
 *   2. Resource construction wrapped in `untracked()` to avoid NG0602
 *      (resources can't be created inside a reactive consumer; LogicFn runs
 *      inside Angular Signal Forms' `BooleanOrLogic.compute`).
 *   3. The trigger signal feeds `derivedFromDeferred` with `debounceTime` +
 *      `distinctUntilChanged` (keyed by `Trigger.key`) so rapid form changes
 *      collapse into one stream invocation.
 *   4. `withPreviousValue` wraps the `rxResource` so consumers see the
 *      previous resolved value during re-fetch — prevents UI flicker.
 *
 * Caller supplies only the per-condition specifics via `config.resolve`
 * (early-return logic + how to derive the trigger from the FieldContext) and
 * `config.buildStream` (how to fetch fresh values for a trigger payload).
 *
 * @internal
 */
export function createDebouncedResourceLogicFn<TValue, TPayload, TResult>(
  config: DebouncedResourceLogicFnConfig<TValue, TPayload, TResult>,
): LogicFn<TValue, TResult> {
  const perFunctionSignalStore = new Map<string, ResourceHandle<TPayload, TResult>>();

  return (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let handle = perFunctionSignalStore.get(contextKey);

    if (!handle) {
      const trigger = signal<Trigger<TPayload> | undefined>(undefined);

      // untracked: rxResource creates an internal effect, which Angular forbids
      // inside a reactive consumer (LogicFn runs inside a computed). Clearing
      // the consumer keeps the resource's lifecycle independent of the LogicFn's
      // reactive context.
      const resultResource = untracked(() => {
        const debouncedTrigger = derivedFromDeferred(
          trigger,
          pipe(
            debounceTime(config.debounceMs),
            // distinctUntilChanged on key alone — payload identity doesn't matter
            // (the latest payload for a given key always wins).
            distinctUntilChanged((a, b) => a?.key === b?.key),
          ),
          { initialValue: undefined as Trigger<TPayload> | undefined, injector: config.injector },
        );

        const resource = rxResource<TResult, Trigger<TPayload> | undefined>({
          params: () => debouncedTrigger(),
          // When params() returns undefined, rxResource enters idle state.
          stream: ({ params }) => config.buildStream(params!.payload),
          defaultValue: config.pendingValue,
          injector: config.injector,
        });

        return withPreviousValue(resource);
      });

      handle = { trigger, resultResource };
      perFunctionSignalStore.set(contextKey, handle);
    }

    const resolved = config.resolve(ctx);
    if (resolved.kind === 'returnEarly') {
      return resolved.value;
    }
    if (resolved.kind === 'holdPrevious') {
      return handle.resultResource.value();
    }

    const newTrigger: Trigger<TPayload> = { key: resolved.key, payload: resolved.payload };
    untracked(() => {
      const current = handle!.trigger();
      // Key-only dedup assumes same key implies equivalent payload — true for both current callers.
      if (current?.key !== newTrigger.key) {
        handle!.trigger.set(newTrigger);
      }
    });

    return handle.resultResource.value();
  };
}
