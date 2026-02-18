import { Observable } from 'rxjs';
import { EvaluationContext } from '../../models/expressions/evaluation-context';

/**
 * Async function for derivations — returns any value.
 *
 * The function receives the evaluation context and may return a Promise or Observable.
 * Register functions in `customFnConfig.asyncDerivations`.
 *
 * @example
 * ```typescript
 * const fetchPrice: AsyncDerivationFunction = async (context) => {
 *   const response = await fetch(`/api/price?product=${context.formValue.productId}`);
 *   const data = await response.json();
 *   return data.price;
 * };
 * ```
 *
 * @public
 */
export type AsyncDerivationFunction = (context: EvaluationContext) => Promise<unknown> | Observable<unknown>;

/**
 * Async function for conditions — returns boolean.
 *
 * The function receives the evaluation context and may return a Promise or Observable.
 * Register functions in `customFnConfig.asyncConditions`.
 *
 * @example
 * ```typescript
 * const checkPermission: AsyncConditionFunction = async (context) => {
 *   const response = await fetch(`/api/permissions?user=${context.formValue.userId}`);
 *   const data = await response.json();
 *   return data.canEdit;
 * };
 * ```
 *
 * @public
 */
export type AsyncConditionFunction = (context: EvaluationContext) => Promise<boolean> | Observable<boolean>;
