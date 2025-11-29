import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser/expression-parser';

/**
 * Create a dynamic value function from an expression string
 * Uses secure AST-based parsing instead of eval() or new Function()
 */
export function createDynamicValueFunction<TValue, TReturn>(expression: string): LogicFn<TValue, TReturn> {
  return (ctx: FieldContext<TValue>) => {
    // Create evaluation context using the registry-based approach
    const fieldContextRegistry = inject(FieldContextRegistryService);
    const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx);

    try {
      // Use secure AST-based expression parser
      return ExpressionParser.evaluate(expression, evaluationContext) as TReturn;
    } catch (error) {
      console.error('[Dynamic Forms] Error evaluating dynamic expression:', expression, error);
      return undefined as TReturn;
    }
  };
}
