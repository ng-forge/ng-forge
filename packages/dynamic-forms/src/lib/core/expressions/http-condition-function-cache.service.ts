import { LogicFn } from '@angular/forms/signals';

/**
 * DI-scoped cache for HTTP condition logic functions.
 *
 * Replaces module-scoped WeakMaps to ensure SSR safety.
 * Scoped to the DynamicForm component via `provideDynamicFormDI()`.
 *
 * Note: Per-field signal stores are closure-scoped per LogicFn, not shared here,
 * because multiple HTTP conditions on the same field share the same FieldContext
 * reference and would collide in a shared WeakMap.
 */
export class HttpConditionFunctionCacheService {
  /** Cache for HTTP condition logic functions, keyed by serialized condition. */
  readonly httpConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();
}
