import type { Logger } from '../../providers/features/logger/logger.interface';
import { ExpressionParser } from '../expressions/parser/expression-parser';

/**
 * Create a type predicate function from a predicate string.
 *
 * Uses the secure ExpressionParser with whitelist-based evaluation instead of
 * new Function() / eval. This provides security through:
 * - AST-based parsing (no code execution)
 * - Whitelisted operators only
 * - Whitelisted methods only (Array.isArray, typeof, instanceof, etc.)
 * - No access to global scope beyond whitelisted constructors
 *
 * @param predicate - A JavaScript expression that evaluates to boolean. The value to check is available as `value`.
 * @param logger - Logger for error reporting
 * @returns A type predicate function
 *
 * @example
 * createTypePredicateFunction('typeof value === "string"')
 * createTypePredicateFunction('Array.isArray(value)')
 * createTypePredicateFunction('value instanceof Date')
 */
export function createTypePredicateFunction<T = unknown>(predicate: string, logger: Logger): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    try {
      // Evaluate using secure AST-based parser with value in scope
      const result = ExpressionParser.evaluate(predicate, { value });
      return Boolean(result);
    } catch (error) {
      logger.error('Error evaluating type predicate:', predicate, error);
      return false;
    }
  };
}
