import { Signal, signal } from '@angular/core';
import { LogicFn } from '@angular/forms/signals';

/**
 * Per-field debounced signal pair.
 */
interface DebouncedSignalPair {
  immediateValue: ReturnType<typeof signal<boolean>>;
  debouncedValue: Signal<boolean | undefined>;
}

/**
 * DI-scoped cache for logic functions and debounced signals.
 *
 * Replaces module-scoped WeakMaps to ensure SSR safety.
 * Scoped to the DynamicForm component via `provideDynamicFormDI()`.
 */
export class LogicFunctionCacheService {
  /** Cache for memoized logic functions, keyed by serialized expression. */
  readonly logicFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  /** Cache for debounced logic functions, keyed by serialized expression + debounceMs. */
  readonly debouncedLogicFunctionCache = new Map<string, LogicFn<unknown, boolean>>();

  /** Per-field signal store for debounced logic, keyed by FieldContext reference. */
  readonly debouncedSignalStore = new WeakMap<object, DebouncedSignalPair>();
}
