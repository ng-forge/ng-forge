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
      // Captures the FieldContext at the moment each trigger snapshot is produced.
      // The loader reads from this map using the trigger key, ensuring it always
      // uses the context that was active when the trigger was set — not a stale ref
      // that could be overwritten by a later LogicFn call before the loader executes.
      ctxByTrigger: Map<string, FieldContext<TValue>>;
    }
  >();

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = perFunctionSignalStore.get(contextKey);

    if (!signalPair) {
      const trigger = signal<string | undefined>(undefined);
      const ctxByTrigger = new Map<string, FieldContext<TValue>>();

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
            // Look up the async function at call time (fresh reference)
            const asyncFn = functionRegistry.getAsyncConditionFunction(condition.asyncFunctionName);
            if (!asyncFn) {
              logger.warn(
                `Async Condition - function '${condition.asyncFunctionName}' not found. ` +
                  `Register it in customFnConfig.asyncConditions.`,
              );
              return pendingValue;
            }

            // Retrieve the FieldContext that was captured when this trigger key was set.
            // This avoids a race condition where a mutable ref could be overwritten by
            // a later LogicFn call before the loader finishes executing.
            const capturedCtx = ctxByTrigger.get(triggerKey);
            if (!capturedCtx) return pendingValue;

            const evaluationContext = untracked(() =>
              fieldContextRegistry.createReactiveEvaluationContext(capturedCtx, functionRegistry.getCustomFunctions()),
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

      signalPair = { trigger, resultResource, ctxByTrigger };
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

    // Capture the FieldContext for this trigger key so the loader can retrieve it.
    // Only keep the latest — previous entries are stale once the trigger changes.
    const { trigger: triggerSignal, resultResource, ctxByTrigger } = signalPair;
    ctxByTrigger.clear();
    ctxByTrigger.set(contextSnapshot, ctx);

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
