import { BaseValueField } from '../base';
import { DynamicText } from '../../models';

/**
 * HTML input types supported by input fields
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

/**
 * Maps HTML input types to their corresponding TypeScript value types
 */
export type InputTypeToValueType<T extends InputType> = T extends 'number' ? number : string;

/**
 * Props for input fields with optional inputType specification.
 * This is a generic interface that can be extended by framework-specific implementations.
 */
export interface InputProps<T extends InputType = InputType> {
  /**
   * The HTML input type. Determines the value type:
   * - 'number': value will be number
   * - 'text', 'email', 'password', 'tel', 'url': value will be string
   */
  type?: T;
  placeholder?: DynamicText;
}

// ============================================================================
// Discriminated union variants
// ============================================================================

/**
 * Number input field with strict number value type.
 * When props.type is 'number', value must be number.
 */
interface NumberInputField<TProps extends { type?: string } = { type: 'number'; placeholder?: DynamicText }>
  extends BaseValueField<TProps, number> {
  type: 'input';
  props?: TProps; // Optional to match component expectations
}

/**
 * String input field with strict string value type.
 * When props.type is text/email/etc, value must be string.
 */
interface StringInputField<
  TProps extends { type?: string } = { type: 'text' | 'email' | 'password' | 'tel' | 'url'; placeholder?: DynamicText },
> extends BaseValueField<TProps, string> {
  type: 'input';
  props?: TProps; // Optional to match component expectations
}

/**
 * Helper type to extract the input type from props
 */
type ExtractInputType<TProps> = TProps extends { type?: infer T } ? T : InputType;

/**
 * Fallback variant when props is undefined - allows both string and number values
 */
interface UndefinedPropsInputField extends BaseValueField<undefined, string | number> {
  type: 'input';
  props?: never;
}

/**
 * Builds discriminated union based on what input types are possible in TProps
 */
type BuildInputFieldUnion<TProps extends { type?: string }> =
  | (ExtractInputType<TProps> extends infer T
      ? T extends string
        ? ('number' extends T ? NumberInputField<TProps> : never) | (Exclude<T, 'number'> extends never ? never : StringInputField<TProps>)
        : StringInputField<TProps>
      : never)
  | UndefinedPropsInputField; // Allow undefined props as fallback

/**
 * Input field with automatic type-safe value inference.
 * TypeScript automatically infers the correct value type based on props.type.
 *
 * @example
 * // Direct usage - automatic strict type safety
 * const numberField: InputField = {
 *   type: 'input',
 *   key: 'age',
 *   props: { type: 'number' },
 *   value: 25 // ✓ number only (string is type error!)
 * };
 *
 * const textField: InputField = {
 *   type: 'input',
 *   key: 'name',
 *   props: { type: 'text' },
 *   value: 'hello' // ✓ string only (number is type error!)
 * };
 *
 * @example
 * // Framework usage - extend with custom props
 * interface MatInputProps extends InputProps {
 *   appearance?: 'fill' | 'outline';
 *   hint?: string;
 * }
 * type MatInputField = InputField<MatInputProps>; // Automatically gets discriminated union
 */
export type InputField<TProps extends { type?: string } = InputProps> = BuildInputFieldUnion<TProps>;
