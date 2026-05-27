import { LogicFn } from '@angular/forms/signals';

/** DI-scoped cache for async condition logic functions. */
export class AsyncConditionFunctionCacheService {
  /** Cache for async condition logic functions, keyed by serialized condition. */
  readonly asyncConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();
}
