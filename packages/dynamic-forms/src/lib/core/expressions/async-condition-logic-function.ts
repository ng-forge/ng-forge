import { inject, Injector, Signal, WritableSignal, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { catchError, concat, debounceTime, distinctUntilChanged, filter, from, map, of, switchMap } from 'rxjs';
import { AsyncCondition } from '../../models/expressions/conditional-expression';
import { stableStringify } from '../../utils/stable-stringify';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { AsyncConditionFunctionCacheService } from './async-condition-function-cache.service';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';

/**
 * Creates a logic function for an async condition.
 *
 * Uses a signal-based async resolution pattern: the LogicFn updates a `trigger` signal,
 * a reactive pipeline calls the async function and updates a `resultValue` signal.
 * The LogicFn returns the current `resultValue()`, which starts as `pendingValue` and
 * transitions to the actual async result.
 *
 * Must be called in injection context (same as `createLogicFunction`).
 */
export function createAsyncConditionLogicFunction<TValue>(condition: AsyncCondition): LogicFn<TValue, boolean> {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);
  const injector = inject(Injector);
  const logger = inject(DynamicFormLogger) as Logger;
  const cacheService = inject(AsyncConditionFunctionCacheService);

  const pendingValue = condition.pendingValue ?? false;
  const debounceMs = condition.debounceMs ?? 300;

  // Check function cache
  const cacheKey = stableStringify(condition);

  const cached = cacheService.asyncConditionFunctionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  // Each condition needs its own per-field signal store.
  const perFunctionSignalStore = new Map<string, { trigger: WritableSignal<string | undefined>; resultValue: Signal<boolean> }>();

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = perFunctionSignalStore.get(contextKey);

    if (!signalPair) {
      const trigger = signal<string | undefined>(undefined);

      // Wrap in untracked() to avoid NG0602: toObservable() internally calls effect(),
      // which cannot be created inside a reactive context (computed). The LogicFn runs
      // inside Angular Signal Forms' BooleanOrLogic.compute (a computed), so we must
      // clear the active reactive consumer before creating the observable pipeline.
      const resultValue = untracked(() => {
        const pipeline = toObservable(trigger, { injector }).pipe(
          debounceTime(debounceMs),
          distinctUntilChanged(),
          filter((value): value is string => value !== undefined),
          switchMap(() => {
            // Look up the async function at call time (fresh reference)
            const asyncFn = functionRegistry.getAsyncConditionFunction(condition.asyncFunctionName);
            if (!asyncFn) {
              logger.warn(
                `Async Condition - function '${condition.asyncFunctionName}' not found. ` +
                  `Register it in customFnConfig.asyncConditions.`,
              );
              return of(pendingValue);
            }

            // Build evaluation context from current registry state
            const evaluationContext = untracked(() =>
              fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions()),
            );

            // concat ensures pendingValue is emitted immediately when a new trigger
            // arrives, before the async call resolves. This prevents the signal from
            // showing a stale resolved value during re-evaluation.
            return concat(
              of(pendingValue),
              from(asyncFn(evaluationContext)).pipe(
                map((result) => !!result),
                catchError((error) => {
                  logger.warn('Async Condition - function failed:', error);
                  return of(pendingValue);
                }),
              ),
            );
          }),
        );

        return toSignal(pipeline, { injector, initialValue: pendingValue });
      });

      signalPair = { trigger, resultValue };
      perFunctionSignalStore.set(contextKey, signalPair);
    }

    // Build reactive evaluation context (creates signal dependencies on form values)
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Serialize evaluation context to detect changes
    const contextSnapshot = stableStringify({
      formValue: evaluationContext.formValue,
      fieldValue: evaluationContext.fieldValue,
      externalData: evaluationContext.externalData,
    });

    // Update the trigger signal (triggers pipeline if context changed)
    const { trigger: triggerSignal, resultValue } = signalPair;
    untracked(() => {
      const current = triggerSignal();
      if (current !== contextSnapshot) {
        triggerSignal.set(contextSnapshot);
      }
    });

    return resultValue();
  };

  cacheService.asyncConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
