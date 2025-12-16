import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { evaluateCondition } from './condition-evaluator';

/**
 * Cache key combining both services to represent the injection context.
 */
interface InjectionContextKey {
  functionRegistry: FunctionRegistryService;
  fieldContextRegistry: FieldContextRegistryService;
}

/**
 * Cache for memoized logic functions, keyed by injection context.
 * Uses WeakMap with FunctionRegistryService as outer key to automatically clean up.
 * Inner structure: Map<FieldContextRegistryService, Map<expressionKey, LogicFn>>
 */
const logicFunctionCache = new WeakMap<
  FunctionRegistryService,
  WeakMap<FieldContextRegistryService, Map<string, LogicFn<unknown, boolean>>>
>();

/**
 * Serializes a conditional expression to a unique string key for caching.
 * Uses JSON.stringify which handles nested objects well.
 */
function serializeExpression(expression: ConditionalExpression): string {
  return JSON.stringify(expression);
}

/**
 * Gets or creates the cache map for a specific injection context.
 */
function getContextCache(ctx: InjectionContextKey): Map<string, LogicFn<unknown, boolean>> {
  let outerCache = logicFunctionCache.get(ctx.functionRegistry);
  if (!outerCache) {
    outerCache = new WeakMap();
    logicFunctionCache.set(ctx.functionRegistry, outerCache);
  }

  let innerCache = outerCache.get(ctx.fieldContextRegistry);
  if (!innerCache) {
    innerCache = new Map();
    outerCache.set(ctx.fieldContextRegistry, innerCache);
  }

  return innerCache;
}

/**
 * Create a logic function from a conditional expression.
 *
 * This function is used for creating logic functions for hidden, readonly, disabled, and required.
 * It uses the REACTIVE evaluation context, which allows the logic function to create
 * reactive dependencies on form values. When dependent fields change, the logic function
 * will be automatically re-evaluated.
 *
 * Optimizations:
 * - Caches created functions by serialized expression per injection context
 * - Services are injected at creation time, not execution time
 * - Uses WeakMap for automatic cleanup when services are garbage collected
 *
 * NOTE: For validators, use createEvaluationContext directly (with untracked) to prevent
 * infinite reactive loops. Validators with cross-field dependencies should be hoisted
 * to form-level using validateTree.
 *
 * @param expression The conditional expression to evaluate
 * @returns A LogicFn that evaluates the condition in the context of a field
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);

  // Get cache for this injection context
  const contextCache = getContextCache({ functionRegistry, fieldContextRegistry });

  // Generate cache key from serialized expression
  const cacheKey = serializeExpression(expression);

  // Check cache first
  const cached = contextCache.get(cacheKey);
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
  contextCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
