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
 * Props for input fields with optional inputType specification
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
 * Input field definition with type-safe value inference based on inputType.
 *
 * @example
 * // String input (default)
 * const textField: InputField = {
 *   type: 'input',
 *   key: 'name',
 *   props: { type: 'text' },
 *   value: 'hello' // string
 * };
 *
 * @example
 * // Number input
 * const numberField: InputField<InputProps<'number'>> = {
 *   type: 'input',
 *   key: 'age',
 *   props: { type: 'number' },
 *   value: 25 // number
 * };
 */
export interface InputField<TProps extends InputProps<any> = InputProps>
  extends BaseValueField<TProps, TProps extends InputProps<infer T> ? InputTypeToValueType<T> : string> {
  type: 'input';
}
