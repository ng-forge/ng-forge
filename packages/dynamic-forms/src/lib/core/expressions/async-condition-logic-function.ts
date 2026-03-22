import { inject, Injector, Resource, resource, signal, untracked, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AsyncCondition } from '../../models/expressions/conditional-expression';
import { stableStringify } from '../../utils/stable-stringify';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { AsyncConditionFunctionCacheService } from './async-condition-function-cache.service';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';
import { withPreviousValue } from '../../utils/resource-composition/with-previous-value';

/**
 * Creates a logic function for an async condition.
 *
 * Uses Angular's `resource()` API with snapshot composition for async resolution:
 * the LogicFn updates a `trigger` signal (serialized evaluation context), a debounced
 * version feeds into a `resource()` that manages the async function lifecycle, and
 * `withPreviousValue()` preserves the last resolved boolean during re-evaluation
 * to prevent UI flicker.
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
  const perFunctionSignalStore = new Map<
    string,
    {
      trigger: WritableSignal<string | undefined>;
      resultResource: Resource<boolean>;
      ctxRef: { current: FieldContext<TValue> | null };
    }
  >();

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = perFunctionSignalStore.get(contextKey);

    if (!signalPair) {
      const trigger = signal<string | undefined>(undefined);
      // Mutable ref to hold the current FieldContext for use in the resource loader.
      // Updated each time the LogicFn is called (below the initialization block).
      const ctxRef: { current: FieldContext<TValue> | null } = { current: null };

      // Wrap in untracked() to avoid NG0602: resource() internally creates effects,
      // which cannot be created inside a reactive context (computed). The LogicFn runs
      // inside Angular Signal Forms' BooleanOrLogic.compute (a computed), so we must
      // clear the active reactive consumer before creating the resource pipeline.
      const resultResource = untracked(() => {
        // Debounce the trigger to batch rapid form value changes.
        const debouncedTrigger = toSignal(toObservable(trigger, { injector }).pipe(debounceTime(debounceMs), distinctUntilChanged()), {
          injector,
        });

        const asyncResource = resource({
          params: () => debouncedTrigger() ?? undefined,
          loader: async ({ params: triggerKey }) => {
            if (!triggerKey) return pendingValue;

            // Look up the async function at call time (fresh reference)
            const asyncFn = functionRegistry.getAsyncConditionFunction(condition.asyncFunctionName);
            if (!asyncFn) {
              logger.warn(
                `Async Condition - function '${condition.asyncFunctionName}' not found. ` +
                  `Register it in customFnConfig.asyncConditions.`,
              );
              return pendingValue;
            }

            // Build evaluation context from current registry state using the stored FieldContext ref
            const currentCtx = ctxRef.current;
            if (!currentCtx) return pendingValue;

            const evaluationContext = untracked(() =>
              fieldContextRegistry.createReactiveEvaluationContext(currentCtx, functionRegistry.getCustomFunctions()),
            );

            try {
              const result = await asyncFn(evaluationContext);
              return !!result;
            } catch (error) {
              logger.warn('Async Condition - function failed:', error);
              return pendingValue;
            }
          },
          defaultValue: pendingValue,
          injector,
        });

        // Snapshot composition: preserve the previous boolean result during re-evaluation.
        // Without this, the condition would briefly flash to pendingValue when the async
        // function is re-invoked, causing visible UI flicker.
        return withPreviousValue(asyncResource);
      });

      signalPair = { trigger, resultResource, ctxRef };
      perFunctionSignalStore.set(contextKey, signalPair);
    }

    // Update the context ref so the resource loader uses the latest FieldContext
    signalPair.ctxRef.current = ctx;

    // Build reactive evaluation context (creates signal dependencies on form values)
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Serialize evaluation context to detect changes
    const contextSnapshot = stableStringify({
      formValue: evaluationContext.formValue,
      fieldValue: evaluationContext.fieldValue,
      externalData: evaluationContext.externalData,
    });

    // Update the trigger signal (triggers resource if context changed)
    const { trigger: triggerSignal, resultResource } = signalPair;
    untracked(() => {
      const current = triggerSignal();
      if (current !== contextSnapshot) {
        triggerSignal.set(contextSnapshot);
      }
    });

    return resultResource.value();
  };

  cacheService.asyncConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
