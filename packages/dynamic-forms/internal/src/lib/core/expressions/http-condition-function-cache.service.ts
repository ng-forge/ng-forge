import { LogicFn } from '@angular/forms/signals';

/** DI-scoped cache for HTTP condition logic functions. */
export class HttpConditionFunctionCacheService {
  /** Cache for HTTP condition logic functions, keyed by serialized condition. */
  readonly httpConditionFunctionCache = new Map<string, LogicFn<unknown, boolean>>();
}
