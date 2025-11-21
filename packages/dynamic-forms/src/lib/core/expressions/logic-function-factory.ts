import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models';
import { FieldContextRegistryService, FunctionRegistryService } from '../registry';
import { evaluateCondition } from './condition-evaluator';

/**
 * Create a logic function from a conditional expression
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);

  return (ctx: FieldContext<TValue>) => {
    // Create evaluation context using the registry-based approach
    const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    return evaluateCondition(expression, evaluationContext);
  };
}
