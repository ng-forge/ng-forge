import { LogicFn } from '@angular/forms/signals';

/**
 * DI-scoped cache for dynamic value functions.
 *
 * Replaces module-scoped WeakMap to ensure SSR safety.
 * Scoped to the DynamicForm component via `provideDynamicFormDI()`.
 */
export class DynamicValueFunctionCacheService {
  /** Cache for memoized dynamic value functions, keyed by expression string. */
  readonly dynamicValueFunctionCache = new Map<string, LogicFn<unknown, unknown>>();
}
