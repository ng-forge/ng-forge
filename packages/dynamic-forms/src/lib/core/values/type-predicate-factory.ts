import { DynamicFormLogger } from '../../providers/features/logger/logger.interface';

/**
 * Create a type predicate function from a predicate string.
 *
 * @param predicate - The predicate expression string to evaluate
 * @param logger - Logger for error reporting
 */
export function createTypePredicateFunction<T = unknown>(predicate: string, logger: DynamicFormLogger): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    try {
      const func = new Function('value', `return ${predicate};`);
      return func(value);
    } catch (error) {
      logger.error('Error evaluating type predicate:', predicate, error);
      return false;
    }
  };
}
