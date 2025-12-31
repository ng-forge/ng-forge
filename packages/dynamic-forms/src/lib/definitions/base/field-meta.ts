/**
 * Base interface for native HTML attributes that can be passed to form field elements.
 *
 * This interface serves as the base type for all meta attributes. Specific field types
 * (like input, textarea) extend this with their own specialized meta types.
 *
 * @example
 * ```typescript
 * // Using FieldMeta for custom attributes
 * meta: {
 *   'data-testid': 'email-input',
 *   'aria-describedby': 'email-help',
 *   'x-custom': 'value'
 * }
 * ```
 *
 * @public
 */
export interface FieldMeta {
  /**
   * Allows any data-* attribute
   */
  [key: `data-${string}`]: string | undefined;

  /**
   * Allows any aria-* attribute
   */
  [key: `aria-${string}`]: string | boolean | undefined;

  /**
   * Allows additional custom attributes as escape hatch
   */
  [key: string]: string | number | boolean | undefined;
}
