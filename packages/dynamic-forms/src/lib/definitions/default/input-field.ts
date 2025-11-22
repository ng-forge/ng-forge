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

/**
 * Generic input field definition for framework-specific implementations.
 * Use this when you need to extend InputProps with custom properties.
 *
 * @example
 * // Framework extension
 * interface MaterialInputProps extends InputProps<'text'> {
 *   color?: 'primary' | 'accent';
 * }
 * type MaterialInputField = InputFieldDef<MaterialInputProps>;
 */
export interface InputFieldDef<TProps extends InputProps<any> = InputProps>
  extends BaseValueField<TProps, TProps extends InputProps<infer T> ? InputTypeToValueType<T> : string> {
  type: 'input';
}

// ============================================================================
// Strict Type-Safe Variants (for direct usage with automatic type inference)
// ============================================================================

/**
 * Number input field with strict number value type
 */
interface NumberInputField extends BaseValueField<InputProps<'number'>, number> {
  type: 'input';
  props: { type: 'number'; placeholder?: DynamicText };
}

/**
 * Text-based input field with strict string value type
 */
interface TextInputField extends BaseValueField<InputProps<'text' | 'email' | 'password' | 'tel' | 'url'>, string> {
  type: 'input';
  props?: { type?: 'text' | 'email' | 'password' | 'tel' | 'url'; placeholder?: DynamicText };
}

/**
 * Input field with automatic type-safe value inference.
 * TypeScript automatically infers the correct value type based on props.type:
 * - props.type: 'number' → value must be number
 * - props.type: 'text' | 'email' | 'password' | 'tel' | 'url' → value must be string
 *
 * @example
 * // String input (text is default)
 * const textField: InputField = {
 *   type: 'input',
 *   key: 'name',
 *   props: { type: 'text' },
 *   value: 'hello' // ✓ string
 * };
 *
 * @example
 * // Number input with automatic type checking
 * const numberField: InputField = {
 *   type: 'input',
 *   key: 'age',
 *   props: { type: 'number' },
 *   value: 25 // ✓ number (string would be a type error!)
 * };
 *
 * @example
 * // Type error example
 * const invalid: InputField = {
 *   type: 'input',
 *   key: 'age',
 *   props: { type: 'number' },
 *   value: 'hello' // ✗ Type error: string not assignable to number
 * };
 */
export type InputField = NumberInputField | TextInputField;
