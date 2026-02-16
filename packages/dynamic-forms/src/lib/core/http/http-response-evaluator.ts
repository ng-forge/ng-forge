import { ValidationError } from '@angular/forms/signals';
import { HttpValidationResponseMapping } from '../../models/http/http-response-mapping';
import { Logger } from '../../providers/features/logger/logger.interface';
import { ExpressionParser } from '../expressions/parser/expression-parser';

/**
 * Evaluates an HTTP response against a `HttpValidationResponseMapping` to produce a validation result.
 *
 * - `validWhen` truthy → `null` (valid, no error)
 * - `validWhen` falsy → `{ kind: errorKind, ...evaluatedErrorParams }`
 * - Expression error → logs warning, returns `{ kind: errorKind }` (fail-closed)
 *
 * Expressions are evaluated with scope `{ response }` only.
 */
export function evaluateHttpValidationResponse(
  response: unknown,
  mapping: HttpValidationResponseMapping,
  logger: Logger,
): ValidationError | null {
  const scope = { response };

  try {
    const isValid = ExpressionParser.evaluate(mapping.validWhen, scope);

    if (isValid) {
      return null;
    }

    const error: ValidationError & Record<string, unknown> = { kind: mapping.errorKind };

    if (mapping.errorParams) {
      for (const [key, expression] of Object.entries(mapping.errorParams)) {
        try {
          error[key] = ExpressionParser.evaluate(expression, scope);
        } catch (err) {
          logger.warn(`Error evaluating errorParam "${key}":`, expression, err);
        }
      }
    }

    return error;
  } catch (err) {
    logger.warn('Error evaluating validWhen expression:', mapping.validWhen, err);
    return { kind: mapping.errorKind };
  }
}
