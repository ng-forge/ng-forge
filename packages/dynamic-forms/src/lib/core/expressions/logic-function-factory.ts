import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { evaluateCondition } from './condition-evaluator';

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
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);

  return (ctx: FieldContext<TValue>) => {
    // Create REACTIVE evaluation context for logic functions
    // This allows logic to re-evaluate when dependent fields change
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    return evaluateCondition(expression, evaluationContext);
  };
}
