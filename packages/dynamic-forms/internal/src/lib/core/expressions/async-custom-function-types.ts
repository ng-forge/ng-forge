import { Observable } from 'rxjs';
import { EvaluationContext } from '../../models/expressions/evaluation-context';

/** Async function for derivations — returns any value. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default `any` allows AsyncDerivationFunction to accept any TFormValue without explicit generic
export type AsyncDerivationFunction<TFormValue extends Record<string, unknown> = any> = (
  context: EvaluationContext<unknown, TFormValue>,
) => Promise<unknown> | Observable<unknown>;

/** Async function for conditions — returns boolean. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default `any` allows AsyncConditionFunction to accept any TFormValue without explicit generic
export type AsyncConditionFunction<TFormValue extends Record<string, unknown> = any> = (
  context: EvaluationContext<unknown, TFormValue>,
) => Promise<boolean> | Observable<boolean>;
