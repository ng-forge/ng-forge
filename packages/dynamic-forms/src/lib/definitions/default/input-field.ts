import { BaseValueField } from '../base/base-value-field';
import { DynamicText } from '../../models/types/dynamic-text';

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
// String input types (excludes 'number')
// ============================================================================

/**
 * Input types that produce string values
 */
export type StringInputType = Exclude<InputType, 'number'>;

// ============================================================================
// Discriminated union variants
// ============================================================================

/**
 * Number input field with strict number value type.
 * When props.type is 'number', value must be number.
 * Props is REQUIRED and must include type: 'number'.
 */
interface NumberInputField<TProps extends { type?: string } = InputProps> extends BaseValueField<TProps & { type: 'number' }, number> {
  type: 'input';
  props: TProps & { type: 'number' }; // Required with type: 'number'
}

/**
 * String input field with strict string value type.
 * When props.type is text/email/etc (or undefined), value must be string.
 * Props type cannot be 'number'.
 */
interface StringInputField<TProps extends { type?: string } = InputProps>
  extends BaseValueField<TProps & { type?: StringInputType }, string> {
  type: 'input';
  props?: TProps & { type?: StringInputType }; // Optional, but type cannot be 'number'
}

/**
 * Builds discriminated union where props.type determines value type.
 * - If props.type is 'number', only NumberInputField matches (value: number)
 * - If props.type is undefined/text/email/etc, only StringInputField matches (value: string)
 */
type BuildInputFieldUnion<TProps extends { type?: string }> = NumberInputField<TProps> | StringInputField<TProps>;

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
