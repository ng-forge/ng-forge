import { EvaluationContext } from '../../models/expressions/evaluation-context';

/** Scope of a custom function. */
export type CustomFunctionScope = 'field' | 'form';

/** Options for registering a custom function. */
export interface CustomFunctionOptions {
  /**
   * The scope of the function.
   *
   * @default 'form'
   */
  scope?: CustomFunctionScope;
}

/** Custom function signature for conditional expressions */
export type CustomFunction<TFormValue extends Record<string, unknown> = Record<string, unknown>> = (
  context: EvaluationContext<unknown, TFormValue>,
) => unknown;
