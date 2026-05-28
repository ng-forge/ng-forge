import { LogicFn } from '@angular/forms/signals';

/** DI-scoped cache for dynamic value functions. */
export class DynamicValueFunctionCacheService {
  /** Cache for memoized dynamic value functions, keyed by expression string. */
  readonly dynamicValueFunctionCache = new Map<string, LogicFn<unknown, unknown>>();
}
