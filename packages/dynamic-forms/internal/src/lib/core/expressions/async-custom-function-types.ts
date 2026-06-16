import { Observable } from 'rxjs';
import { EvaluationContext } from '../../models/expressions/evaluation-context';

/** Async function for derivations — returns any value. */
export type AsyncDerivationFunction<TFormValue extends Record<string, unknown> = Record<string, unknown>> = (
  context: EvaluationContext<unknown, TFormValue>,
) => Promise<unknown> | Observable<unknown>;

/** Async function for conditions — returns boolean. */
export type AsyncConditionFunction<TFormValue extends Record<string, unknown> = Record<string, unknown>> = (
  context: EvaluationContext<unknown, TFormValue>,
) => Promise<boolean> | Observable<boolean>;
