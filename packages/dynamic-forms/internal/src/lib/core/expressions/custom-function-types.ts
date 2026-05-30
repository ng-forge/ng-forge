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
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default `any` allows CustomFunction to accept any TFormValue without explicit generic
export type CustomFunction<TFormValue extends Record<string, unknown> = any> = (context: EvaluationContext<unknown, TFormValue>) => unknown;
