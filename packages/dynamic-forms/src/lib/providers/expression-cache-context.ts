import { Signal, WritableSignal } from '@angular/core';
import { LogicFn } from '@angular/forms/signals';
import { HttpConditionCache } from '../core/http/http-condition-cache';

/**
 * Per-field debounced signal pair for logic function caching.
 */
interface DebouncedSignalPair {
  immediateValue: WritableSignal<boolean>;
  debouncedValue: Signal<boolean | undefined>;
}

/**
 * DI-scoped aggregate of all expression/logic caches for a single form instance.
 *
 * Replaces five individual cache services + `HTTP_CONDITION_CACHE` with a single
 * class that is provided once per `DynamicForm`. All caches are mutable scratch
 * space scoped via DI — SSR-safe because each form gets its own instance.
 *
 * @internal
 */
export class ExpressionCacheContext {
  // ─── Logic function caches (was LogicFunctionCacheService) ─────────────

  /** Cache for memoized logic functions, keyed by serialized expression. */
  readonly logicFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  /** Cache for debounced logic functions, keyed by serialized expression + debounceMs. */
  readonly debouncedLogicFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  /** Per-field signal store for debounced logic, keyed by field path. */
  readonly debouncedSignalStore = new Map<string, DebouncedSignalPair>();

  // ─── HTTP condition function cache (was HttpConditionFunctionCacheService) ─

  /** Cache for HTTP condition logic functions, keyed by serialized condition. */
  readonly httpConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  // ─── Async condition function cache (was AsyncConditionFunctionCacheService) ─

  /** Cache for async condition logic functions, keyed by serialized condition. */
  readonly asyncConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  // ─── Dynamic value function cache (was DynamicValueFunctionCacheService) ─

  /** Cache for memoized dynamic value functions, keyed by expression string. */
  readonly dynamicValueFunctionCache = new Map<string, LogicFn<unknown, unknown>>();

  // ─── HTTP condition response cache (was HTTP_CONDITION_CACHE) ──────────

  /** TTL-based cache for HTTP condition responses. */
  readonly httpConditionCache = new HttpConditionCache(100);
}
