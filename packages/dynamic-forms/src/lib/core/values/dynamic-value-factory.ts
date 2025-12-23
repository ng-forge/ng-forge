import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';

/**
 * Cache for memoized dynamic value functions, keyed by service instance.
 * Uses WeakMap to automatically clean up when service is garbage collected.
 * Inner Map is keyed by expression string.
 */
const dynamicValueFunctionCache = new WeakMap<FieldContextRegistryService, Map<string, LogicFn<unknown, unknown>>>();

/**
 * Create a dynamic value function from an expression string.
 * Uses secure AST-based parsing instead of eval() or new Function().
 *
 * @param expression The expression string to evaluate
 * @returns A LogicFn that evaluates the expression in the context of a field
 */
export function createDynamicValueFunction<TValue, TReturn>(expression: string): LogicFn<TValue, TReturn> {
  // Inject services during factory creation, not during execution
  // This captures the service instance in the closure
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const logger = inject(DynamicFormLogger);

  // Get or create cache for this injection context
  let contextCache = dynamicValueFunctionCache.get(fieldContextRegistry);
  if (!contextCache) {
    contextCache = new Map<string, LogicFn<unknown, unknown>>();
    dynamicValueFunctionCache.set(fieldContextRegistry, contextCache);
  }

  // Check cache first
  const cached = contextCache.get(expression);
  if (cached) {
    return cached as LogicFn<TValue, TReturn>;
  }

  const fn: LogicFn<TValue, TReturn> = (ctx: FieldContext<TValue>) => {
    // Create evaluation context using the registry-based approach
    const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx);

    try {
      // Use secure AST-based expression parser (already has LRU cache)
      return ExpressionParser.evaluate(expression, evaluationContext) as TReturn;
    } catch (error) {
      logger.error('Error evaluating dynamic expression:', expression, error);
      return undefined as TReturn;
    }
  };

  // Cache the function
  contextCache.set(expression, fn as LogicFn<unknown, unknown>);
  return fn;
}
