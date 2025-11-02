import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { ConditionalExpression, EvaluationContext } from '../../models';
import { FunctionRegistryService } from '../registry';
import { evaluateCondition } from './condition-evaluator';

/**
 * Create a logic function from a conditional expression
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  return (ctx: FieldContext<TValue>) => {
    const functionRegistry = inject(FunctionRegistryService);
    const evaluationContext: EvaluationContext = {
      fieldValue: ctx.value(),
      formValue: {}, // TODO: access root form value properly
      fieldPath: '', // TODO: derive actual path from context if needed
      customFunctions: functionRegistry.getCustomFunctions(),
    };
    return evaluateCondition(expression, evaluationContext);
  };
}
