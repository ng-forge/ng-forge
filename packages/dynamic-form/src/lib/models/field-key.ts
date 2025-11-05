/**
 * Utility types for field key validation.
 *
 * These types ensure field keys follow consistent naming conventions:
 * - camelCase: keysLikeThis
 * - kebab-case: keys-like-this
 * - snake_case: keys_like_this
 * - PascalCase: KeysLikeThis
 */

/**
 * Checks if a string contains uppercase letters.
 */
type HasUpperCase<S extends string> = S extends `${string}${infer Char}${infer Rest}`
  ? Char extends Uppercase<Char>
    ? Char extends Lowercase<Char>
      ? HasUpperCase<Rest> // Not a letter, continue checking
      : true // Found uppercase letter
    : HasUpperCase<Rest>
  : false;

/**
 * Checks if a string contains underscores.
 */
type HasUnderscore<S extends string> = S extends `${string}_${string}` ? true : false;

/**
 * Checks if a string contains spaces.
 */
type HasSpace<S extends string> = S extends `${string} ${string}` ? true : false;

/**
 * Checks if a string contains hyphens.
 */
type HasHyphen<S extends string> = S extends `${string}-${string}` ? true : false;

/**
 * Checks if a string starts with a number.
 */
type StartsWithNumber<S extends string> = S extends `${infer First}${string}`
  ? First extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    ? true
    : false
  : false;

/**
 * Validates a camelCase string.
 * - Must start with lowercase letter
 * - Can contain letters and numbers
 * - No spaces, hyphens, or underscores
 */
type IsCamelCase<S extends string> = S extends Lowercase<S>
  ? HasSpace<S> extends true
    ? false
    : HasHyphen<S> extends true
    ? false
    : HasUnderscore<S> extends true
    ? false
    : StartsWithNumber<S> extends true
    ? false
    : true
  : HasUpperCase<S> extends true
  ? HasSpace<S> extends true
    ? false
    : HasHyphen<S> extends true
    ? false
    : HasUnderscore<S> extends true
    ? false
    : StartsWithNumber<S> extends true
    ? false
    : true
  : false;

/**
 * Validates a kebab-case string.
 * - Must be all lowercase
 * - Can contain hyphens
 * - No spaces or underscores
 */
type IsKebabCase<S extends string> = S extends Lowercase<S>
  ? HasSpace<S> extends true
    ? false
    : HasUnderscore<S> extends true
    ? false
    : StartsWithNumber<S> extends true
    ? false
    : true
  : false;

/**
 * Validates a snake_case string.
 * - Must be all lowercase
 * - Can contain underscores
 * - No spaces or hyphens
 */
type IsSnakeCase<S extends string> = S extends Lowercase<S>
  ? HasSpace<S> extends true
    ? false
    : HasHyphen<S> extends true
    ? false
    : StartsWithNumber<S> extends true
    ? false
    : true
  : false;

/**
 * Checks if a string starts with an uppercase letter.
 */
type StartsWithUpperCase<S extends string> = S extends `${infer First}${string}`
  ? First extends Uppercase<First>
    ? First extends Lowercase<First>
      ? false // Not a letter
      : true // Uppercase letter
    : false
  : false;

/**
 * Validates a PascalCase string.
 * - Must start with uppercase letter
 * - Can contain letters and numbers
 * - No spaces, hyphens, or underscores
 */
type IsPascalCase<S extends string> = StartsWithUpperCase<S> extends true
  ? HasSpace<S> extends true
    ? false
    : HasHyphen<S> extends true
    ? false
    : HasUnderscore<S> extends true
    ? false
    : StartsWithNumber<S> extends true
    ? false
    : true
  : false;

/**
 * Field key type that accepts camelCase, kebab-case, snake_case, or PascalCase strings
 * when used as literals, but also accepts generic string type for flexibility.
 *
 * @example
 * ```typescript
 * // Valid keys (literal strings are validated)
 * const key1: FieldKey<'userName'> = 'userName';        // camelCase
 * const key2: FieldKey<'user-name'> = 'user-name';      // kebab-case
 * const key3: FieldKey<'user_name'> = 'user_name';      // snake_case
 * const key4: FieldKey<'UserName'> = 'UserName';        // PascalCase
 *
 * // Generic string is also accepted for runtime values
 * const key5: FieldKey = someRuntimeString;
 *
 * // Invalid keys (will cause TypeScript errors only for literals)
 * const key6: FieldKey<'user name'> = 'user name';      // with space - not allowed
 * const key7: FieldKey<'1stName'> = '1stName';          // starts with number - not allowed
 * ```
 *
 * @public
 */
export type FieldKey<T extends string = string> = string extends T
  ? string // If T is the generic string type, accept it
  : IsCamelCase<T> extends true
  ? T
  : IsKebabCase<T> extends true
  ? T
  : IsSnakeCase<T> extends true
  ? T
  : IsPascalCase<T> extends true
  ? T
  : never;

/**
 * Helper type to validate field keys at compile time for literal strings.
 * Use this when you want to ensure a specific string literal is a valid field key.
 */
export type ValidateFieldKey<T extends string> = string extends T
  ? T // Accept generic string
  : FieldKey<T> extends never
  ? `Invalid field key: "${T}". Keys must be in camelCase, kebab-case, snake_case, or PascalCase format.`
  : T;
