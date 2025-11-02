import { inject } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { FieldContextRegistryService } from '../registry';

/**
 * Create a dynamic value function from an expression string
 */
export function createDynamicValueFunction<TValue, TReturn>(expression: string): LogicFn<TValue, TReturn> {
  return (ctx: FieldContext<TValue>) => {
    // Create evaluation context using the registry-based approach
    const fieldContextRegistry = inject(FieldContextRegistryService);
    const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx);

    try {
      const func = new Function('context', `with(context) { return ${expression}; }`);
      return func(evaluationContext);
    } catch (error) {
      console.error('Error evaluating dynamic expression:', expression, error);
      return undefined as TReturn;
    }
  };
}
