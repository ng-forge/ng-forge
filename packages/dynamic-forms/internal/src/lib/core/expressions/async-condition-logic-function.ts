import { inject, Injector } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { catchError, from, map, of } from 'rxjs';
import { AsyncCondition } from '../../models/expressions/conditional-expression';
import { stableStringify } from '../../utils/stable-stringify';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { AsyncConditionFunctionCacheService } from './async-condition-function-cache.service';
import { createDebouncedResourceLogicFn } from './debounced-resource-logic-fn';

/** Creates a logic function for an async condition. */
export function createAsyncConditionLogicFunction<TValue>(condition: AsyncCondition): LogicFn<TValue, boolean> {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);
  const injector = inject(Injector);
  const logger = inject(DynamicFormLogger) as Logger;
  const cacheService = inject(AsyncConditionFunctionCacheService);

  const pendingValue = condition.pendingValue ?? false;
  const debounceMs = condition.debounceMs ?? 300;

  if (condition.asyncFn && condition.asyncFunctionName) {
    logger.warn(
      'Both "asyncFn" and "asyncFunctionName" are set on async condition. Inline "asyncFn" takes precedence; "asyncFunctionName" is ignored.',
    );
  }

  // Skip cross-condition caching when an inline function is used: stableStringify
  // cannot distinguish two different inline functions, which would cause cache hits
  // to wrongly reuse a LogicFn closing over a different function reference.
  const cacheKey = condition.asyncFn ? undefined : stableStringify(condition);

  if (cacheKey !== undefined) {
    const cached = cacheService.asyncConditionFunctionCache.get(cacheKey);
    if (cached) {
      return cached as LogicFn<TValue, boolean>;
    }
  }

  const fn = createDebouncedResourceLogicFn<TValue, FieldContext<TValue>, boolean>({
    pendingValue,
    debounceMs,
    injector,
    resolve: (ctx) => {
      // Build reactive evaluation context here so the LogicFn establishes
      // signal dependencies on form values — the resource's reactive graph
      // alone wouldn't notice changes that didn't flow through the trigger.
      const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());
      const key = stableStringify({
        formValue: evaluationContext.formValue,
        fieldValue: evaluationContext.fieldValue,
        externalData: evaluationContext.externalData,
      });
      return { kind: 'trigger', key, payload: ctx };
    },
    buildStream: (capturedCtx) => {
      // Inline `asyncFn` wins; otherwise look up the registered function at call time
      // (fresh reference, in case the registry was updated after LogicFn creation).
      const asyncFn =
        condition.asyncFn ??
        (condition.asyncFunctionName ? functionRegistry.getAsyncConditionFunction(condition.asyncFunctionName) : undefined);
      if (!asyncFn) {
        logger.warn(
          `Async Condition - function '${condition.asyncFunctionName}' not found. ` + `Register it in customFnConfig.asyncConditions.`,
        );
        return of(pendingValue);
      }

      const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(capturedCtx, functionRegistry.getCustomFunctions());

      // asyncFn may return Promise<boolean> or Observable<boolean>.
      // from() normalizes both to Observable.
      return from(asyncFn(evaluationContext)).pipe(
        map((result) => !!result),
        catchError((error) => {
          logger.warn('Async Condition - function failed:', error);
          return of(pendingValue);
        }),
      );
    },
  });

  if (cacheKey !== undefined) {
    cacheService.asyncConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  }
  return fn;
}
