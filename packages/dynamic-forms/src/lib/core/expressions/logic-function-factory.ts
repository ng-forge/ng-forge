import { inject, Injector, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { stableStringify } from '../../utils/stable-stringify';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { evaluateCondition } from './condition-evaluator';
import { createHttpConditionLogicFunction } from './http-condition-logic-function';
import { createAsyncConditionLogicFunction } from './async-condition-logic-function';
import { ExpressionCacheContext } from '../../providers/expression-cache-context';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';

/**
 * Recursively validates that HTTP/async conditions are not nested inside and/or composites.
 * These conditions require async resolution and cannot be evaluated synchronously
 * inside composite conditions.
 */
function validateNoNestedHttpConditions(expression: ConditionalExpression): void {
  if (expression.type === 'and' || expression.type === 'or') {
    for (const sub of expression.conditions) {
      if (sub.type === 'http' || sub.type === 'async') {
        const label = sub.type === 'http' ? 'HTTP' : 'Async';
        throw new DynamicFormError(
          `${label} conditions cannot be nested inside '${expression.type}' composites. ` +
            `Move the ${label} condition to a separate logic entry on the field.`,
        );
      }
      validateNoNestedHttpConditions(sub);
    }
  }
}

/**
 * Create a logic function from a conditional expression.
 *
 * This function is used for creating logic functions for hidden, readonly, disabled, and required.
 * It uses the REACTIVE evaluation context, which allows the logic function to create
 * reactive dependencies on form values. When dependent fields change, the logic function
 * will be automatically re-evaluated.
 *
 * NOTE: For validators, use createEvaluationContext directly (with untracked) to prevent
 * infinite reactive loops. Validators with cross-field dependencies should be hoisted
 * to form-level using validateTree.
 *
 * @param expression The conditional expression to evaluate
 * @returns A LogicFn that evaluates the condition in the context of a field
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  // Async conditions handle their own debouncing and async resolution
  if (expression?.type === 'async') {
    return createAsyncConditionLogicFunction(expression);
  }

  // HTTP conditions handle their own debouncing and async resolution
  if (expression?.type === 'http') {
    return createHttpConditionLogicFunction(expression);
  }

  // Validate that HTTP conditions aren't nested inside and/or composites
  if (expression) {
    validateNoNestedHttpConditions(expression);
  }

  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const cacheCtx = inject(ExpressionCacheContext);

  // Generate cache key from serialized expression
  const cacheKey = stableStringify(expression);

  // Check cache first
  const cached = cacheCtx.logicFunctionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    // Create REACTIVE evaluation context for logic functions
    // This allows logic to re-evaluate when dependent fields change
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    return evaluateCondition(expression, evaluationContext);
  };

  // Cache the function
  cacheCtx.logicFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}

/**
 * Create a debounced logic function from a conditional expression.
 *
 * This function wraps the condition evaluation in a debounce mechanism,
 * so state changes only take effect after the specified delay.
 * Useful for avoiding UI flicker during rapid typing.
 *
 * @param expression The conditional expression to evaluate
 * @param debounceMs The debounce duration in milliseconds
 * @returns A LogicFn that evaluates the condition with debouncing
 */
export function createDebouncedLogicFunction<TValue>(expression: ConditionalExpression, debounceMs: number): LogicFn<TValue, boolean> {
  // Async conditions handle their own debouncing via condition.debounceMs
  if (expression?.type === 'async') {
    return createAsyncConditionLogicFunction(expression);
  }

  // HTTP conditions handle their own debouncing via condition.http.debounceMs
  if (expression?.type === 'http') {
    return createHttpConditionLogicFunction(expression);
  }

  // Validate that HTTP conditions aren't nested inside and/or composites
  if (expression) {
    validateNoNestedHttpConditions(expression);
  }

  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const injector = inject(Injector);
  const cacheCtx = inject(ExpressionCacheContext);

  // Generate cache key including debounceMs
  const cacheKey = `${stableStringify(expression)}:${debounceMs}`;

  // Check cache first
  const cached = cacheCtx.debouncedLogicFunctionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = cacheCtx.debouncedSignalStore.get(contextKey);

    if (!signalPair) {
      // Create a signal to hold the immediate evaluation result
      const immediateValue = signal(false);

      // Wrap in untracked() to avoid NG0602: toObservable() internally calls effect(),
      // which cannot be created inside a reactive context (computed). The LogicFn runs
      // inside Angular Signal Forms' BooleanOrLogic.compute (a computed).
      const debouncedValue = untracked(() => {
        const immediateValue$ = toObservable(immediateValue, { injector }).pipe(
          debounceTime(debounceMs),
          distinctUntilChanged(),
          startWith(false),
        );

        return toSignal(immediateValue$, { injector, initialValue: false });
      });

      signalPair = { immediateValue, debouncedValue };
      cacheCtx.debouncedSignalStore.set(contextKey, signalPair);
    }

    // Create REACTIVE evaluation context for logic functions
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Evaluate the condition and update the immediate signal
    const result = evaluateCondition(expression, evaluationContext);

    // Update immediate value (this triggers the debounce chain)
    // signalPair is guaranteed to exist here due to the initialization above
    const { immediateValue, debouncedValue } = signalPair;
    untracked(() => {
      if (immediateValue() !== result) {
        immediateValue.set(result);
      }
    });

    // Return the debounced value
    return debouncedValue() ?? false;
  };

  // Cache the function
  cacheCtx.debouncedLogicFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
