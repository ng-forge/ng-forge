/**
 * Type utilities for exhaustive whitelist type testing.
 *
 * These utilities help ensure that type definitions remain stable by detecting
 * when properties are added, removed, or changed.
 */

/**
 * Extracts only the required keys from a type.
 *
 * @example
 * ```typescript
 * interface Example { a: string; b?: number; }
 * type Required = RequiredKeys<Example>; // 'a'
 * ```
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Extracts only the optional keys from a type.
 *
 * @example
 * ```typescript
 * interface Example { a: string; b?: number; }
 * type Optional = OptionalKeys<Example>; // 'b'
 * ```
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];
