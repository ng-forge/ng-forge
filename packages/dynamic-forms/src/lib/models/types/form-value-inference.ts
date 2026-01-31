import { RegisteredFieldTypes } from '../registry/field-registry';

/**
 * Helper type to convert union to intersection.
 * Uses `U extends U` to trigger distributive conditional type behavior.
 */
type UnionToIntersection<U> = (U extends U ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Depth counter for recursion limiting (prevents infinite type instantiation)
 */
type Depth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Widens literal types to their primitive equivalents.
 * This prevents `as const` from over-narrowing types like `''` to literal `''` instead of `string`.
 *
 * @example
 * ```typescript
 * type A = Widen<''>; // string
 * type B = Widen<false>; // boolean
 * type C = Widen<42>; // number
 * type D = Widen<string[]>; // string[]
 * ```
 */
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

/**
 * Infer value type based on field type and props.
 * - Slider fields: always number
 * - Input fields with props.type: 'number': number
 * - Other fields: widen the literal value type
 */
type InferValueType<T, V> = T extends { type: 'slider' }
  ? number
  : T extends { type: 'input'; props: { type: 'number' } }
    ? number
    : Widen<V>;

/**
 * Make type optional if field is not required.
 * Hidden fields are never optional since they require a value property.
 */
type MaybeOptional<T, V> = T extends { type: 'hidden' } ? V : T extends { required: true } ? V : V | undefined;

/**
 * Process a single field and determine its contribution to the form value type
 */
type ProcessField<T, D extends number = 5> = [D] extends [never]
  ? Record<string, unknown>
  : // Container: page/row - flatten children
    T extends { type: 'page' | 'row'; fields: infer F }
    ? F extends RegisteredFieldTypes[]
      ? InferFormValueWithDepth<F, Depth[D]>
      : never
    : // Container: group - nest under key
      T extends { type: 'group'; key: infer K; fields: infer F }
      ? K extends string
        ? F extends RegisteredFieldTypes[]
          ? { [P in K]: InferFormValueWithDepth<F, Depth[D]> }
          : { [P in K]: Record<string, unknown> }
        : never
      : // Container: array - wrap children type in array under key
        T extends { type: 'array'; key: infer K; fields: infer F }
        ? K extends string
          ? F extends RegisteredFieldTypes[]
            ? { [P in K]: InferFormValueWithDepth<F, Depth[D]>[] }
            : { [P in K]: unknown[] }
          : never
        : // Display-only: text - exclude
          T extends { type: 'text' }
          ? never
          : // Button fields - exclude (they don't hold values)
            T extends { type: 'submit' | 'button' | 'next' | 'previous' | 'addArrayItem' | 'removeArrayItem' }
            ? never
            : // Value fields with explicit value: infer type and optionality
              T extends { key: infer K; value: infer V }
              ? K extends string
                ? { [P in K]: MaybeOptional<T, InferValueType<T, V>> }
                : never
              : // Value fields without explicit value: include as string (default input type)
                T extends { key: infer K }
                ? K extends string
                  ? { [P in K]: MaybeOptional<T, string> }
                  : never
                : never;

/**
 * Internal helper with depth tracking
 */
type InferFormValueWithDepth<T extends RegisteredFieldTypes[], D extends number = 5> = UnionToIntersection<ProcessField<T[number], D>>;

/**
 * Helper to extract fields from either fields array or FormConfig
 */
type ExtractFields<T> = T extends { fields: infer TFields }
  ? TFields extends readonly RegisteredFieldTypes[]
    ? TFields
    : never
  : T extends readonly RegisteredFieldTypes[]
    ? T
    : never;

/**
 * Infer form value type from fields array or FormConfig.
 * Recursively processes nested structures and merges the results.
 * Limited to 5 levels of nesting to prevent infinite type instantiation.
 *
 * @example
 * ```typescript
 * // From fields array
 * const fields = [
 *   { type: 'input', key: 'email', value: '', required: true },
 *   { type: 'input', key: 'name', value: '' }
 * ] as const;
 * type FieldsValue = InferFormValue<typeof fields>;
 *
 * // From FormConfig
 * const config = {
 *   fields: [
 *     { type: 'input', key: 'email', value: '', required: true },
 *     { type: 'input', key: 'name', value: '' }
 *   ]
 * } as const satisfies FormConfig;
 * type ConfigValue = InferFormValue<typeof config>;
 *
 * // Result: { email: string; name?: string }
 * ```
 */
export type InferFormValue<T> =
  ExtractFields<T> extends readonly RegisteredFieldTypes[]
    ? InferFormValueWithDepth<ExtractFields<T> extends RegisteredFieldTypes[] ? ExtractFields<T> : [...ExtractFields<T>], 5>
    : never;
