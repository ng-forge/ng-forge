import { RegisteredFieldTypes } from '../registry/field-registry';

/**
 * Helper type to convert union to intersection
 * Used to merge multiple field value objects into a single object type
 *
 * Note: The `any` in `U extends any` is intentional and necessary for distributive conditional types.
 * This is a TypeScript pattern where `any` is required to distribute the conditional type over union members.
 * @see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Depth counter for recursion limiting (prevents infinite type instantiation)
 */
type Depth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Extract the value type from a single field, handling required/optional
 */
type ExtractFieldValue<T> = T extends { value: infer V; required: true }
  ? V
  : T extends { value: infer V; required?: false | undefined }
  ? V | undefined
  : T extends { value: infer V }
  ? V | undefined
  : unknown;

/**
 * Process a single field and determine its contribution to the form value type
 * Handles:
 * - Page fields: flatten children (valueHandling: 'flatten')
 * - Row fields: flatten children (valueHandling: 'flatten')
 * - Group fields: nest children under group key (valueHandling: 'include')
 * - Text fields: exclude from values (valueHandling: 'exclude')
 * - Value fields: include with their key and value type
 */
type ProcessField<T, D extends number = 5> = [D] extends [never]
  ? Record<string, unknown> // Max depth reached, return generic
  : // Page fields: flatten children (don't create a key for the page itself)
  T extends { type: 'page'; fields: infer TFields }
  ? TFields extends readonly RegisteredFieldTypes[]
    ? InferFormValueWithDepth<TFields, Depth[D]>
    : never
  : // Row fields: flatten children (don't create a key for the row itself)
  T extends { type: 'row'; fields: infer TFields }
  ? TFields extends readonly RegisteredFieldTypes[]
    ? InferFormValueWithDepth<TFields, Depth[D]>
    : never
  : // Group fields: nest children under the group's key
  T extends { type: 'group'; key: infer K; fields: infer TFields }
  ? K extends string
    ? TFields extends readonly RegisteredFieldTypes[]
      ? { [P in K]: InferFormValueWithDepth<TFields, Depth[D]> }
      : { [P in K]: Record<string, unknown> }
    : never
  : // Text fields: exclude from form values (display-only)
  T extends { type: 'text' }
  ? never
  : // Value fields with required flag set to true
  T extends { key: infer K; value: infer V; required: true }
  ? K extends string
    ? { [P in K]: V }
    : never
  : // Value fields with required flag set to false or undefined, or no required flag
  T extends { key: infer K; value: infer V }
  ? K extends string
    ? { [P in K]: V | undefined }
    : never
  : // Fallback: fields without a key are excluded
    never;

/**
 * Internal helper with depth tracking
 */
type InferFormValueWithDepth<T extends readonly RegisteredFieldTypes[], D extends number = 5> = UnionToIntersection<
  ProcessField<T[number], D>
>;

/**
 * Infer form value type from an array of field definitions
 * Recursively processes nested structures and merges the results
 * Limited to 5 levels of nesting to prevent infinite type instantiation
 *
 * @example
 * ```typescript
 * const fields = [
 *   { type: 'input', key: 'email', value: '', required: true },
 *   { type: 'group', key: 'address', fields: [
 *     { type: 'input', key: 'street', value: '' },
 *     { type: 'input', key: 'city', value: '' }
 *   ]}
 * ] as const;
 *
 * type FormValue = InferFormValue<typeof fields>;
 * // Result: { email: string; address: { street?: string; city?: string } }
 * ```
 */
export type InferFormValue<T extends readonly RegisteredFieldTypes[]> = InferFormValueWithDepth<T, 5>;

/**
 * Infer form value type from the global field registry
 * Useful for generic form handling when specific field configuration is not known
 */
export type InferGlobalFormValue = Record<string, unknown>;
