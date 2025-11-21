/**
 * Create a type predicate function from a predicate string
 */
export function createTypePredicateFunction<T = unknown>(predicate: string): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    try {
      const func = new Function('value', `return ${predicate};`);
      return func(value);
    } catch (error) {
      console.error('Error evaluating type predicate:', predicate, error);
      return false;
    }
  };
}
