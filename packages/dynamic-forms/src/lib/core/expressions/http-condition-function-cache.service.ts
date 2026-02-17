import { signal, Signal } from '@angular/core';
import { LogicFn } from '@angular/forms/signals';
import { HttpResourceRequest } from '../validation/validator-types';

/**
 * Per-field signal pair for HTTP condition resolution.
 */
export interface HttpConditionFieldSignalPair {
  resolvedRequest: ReturnType<typeof signal<HttpResourceRequest | undefined>>;
  resultValue: Signal<boolean>;
}

/**
 * DI-scoped cache for HTTP condition logic functions and per-field signals.
 *
 * Replaces module-scoped WeakMaps to ensure SSR safety.
 * Scoped to the DynamicForm component via `provideDynamicFormDI()`.
 */
export class HttpConditionFunctionCacheService {
  /** Cache for HTTP condition logic functions, keyed by serialized condition. */
  readonly httpConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  /** Per-field signal store for HTTP condition resolution, keyed by FieldContext reference. */
  readonly httpConditionSignalStore = new WeakMap<object, HttpConditionFieldSignalPair>();
}
