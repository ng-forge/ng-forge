import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DynamicValueFunctionCacheService } from './dynamic-value-function-cache.service';

/**
 * Create a dynamic value function from an expression string.
 * Uses secure AST-based parsing.
 *
 * @param expression The expression string to evaluate
 * @returns A LogicFn that evaluates the expression in the context of a field
 */
export function createDynamicValueFunction<TValue, TReturn>(expression: string): LogicFn<TValue, TReturn> {
  // Inject services during factory creation, not during execution
  // This captures the service instance in the closure
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const logger = inject(DynamicFormLogger);
  const cacheService = inject(DynamicValueFunctionCacheService);

  // Check cache first
  const cached = cacheService.dynamicValueFunctionCache.get(expression);
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
  cacheService.dynamicValueFunctionCache.set(expression, fn as LogicFn<unknown, unknown>);
  return fn;
}
