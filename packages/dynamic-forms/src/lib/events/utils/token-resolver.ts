/**
 * Context for token resolution in event args
 */
export interface TokenContext {
  /** Current field key */
  key?: string;
  /** Array index if field is inside an array */
  index?: number;
  /** Parent array field key if field is inside an array */
  arrayKey?: string;
  /** Current form value for complex indexing */
  formValue?: unknown;
  /** Template for array item creation */
  template?: unknown;
}

/**
 * Resolves special tokens in event arguments to their actual values
 *
 * Supported tokens:
 * - $key: The current field key
 * - $index: The array index (if inside an array field)
 * - $arrayKey: The parent array field key (if inside an array field)
 * - $template: The template for array item creation
 * - formValue: Reference to the current form value for indexing
 *
 * @param args - Array of arguments that may contain tokens
 * @param context - Context object containing token values
 * @returns Array with resolved values
 *
 * @example
 * resolveTokens(['$arrayKey', '$index'], { arrayKey: 'contacts', index: 2 })
 * // Returns: ['contacts', 2]
 *
 * @example
 * resolveTokens(['$key', 'static'], { key: 'myField' })
 * // Returns: ['myField', 'static']
 *
 * @example
 * resolveTokens(['$arrayKey', '$template'], { arrayKey: 'contacts', template: [{ key: 'name', type: 'input' }] })
 * // Returns: ['contacts', [{ key: 'name', type: 'input' }]]
 */
export function resolveTokens(
  args: readonly (string | number | boolean | null | undefined)[],
  context: TokenContext,
): (string | number | boolean | null | undefined | unknown)[] {
  return args.map((arg) => {
    // Only process string tokens
    if (typeof arg !== 'string') {
      return arg;
    }

    // Check for token patterns
    switch (arg) {
      case '$key':
        return context.key;
      case '$index':
        return context.index;
      case '$arrayKey':
        return context.arrayKey;
      case '$template':
        return context.template;
      case 'formValue':
        return context.formValue;
      default:
        // Return as-is if not a recognized token
        return arg;
    }
  });
}
