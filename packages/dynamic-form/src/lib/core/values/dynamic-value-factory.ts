import { FieldContext, LogicFn } from '@angular/forms/signals';
import { EvaluationContext } from '../../models';

/**
 * Create a dynamic value function from an expression string
 */
export function createDynamicValueFunction<TValue, TReturn>(expression: string): LogicFn<TValue, TReturn> {
  return (ctx: FieldContext<TValue>) => {
    const evaluationContext: EvaluationContext = {
      fieldValue: ctx.value(),
      formValue: {}, // TODO: access root form value properly
      fieldPath: '', // TODO: derive actual path from context if needed
    };

    try {
      const func = new Function('context', `with(context) { return ${expression}; }`);
      return func(evaluationContext);
    } catch (error) {
      console.error('Error evaluating dynamic expression:', expression, error);
      return undefined as TReturn;
    }
  };
}
