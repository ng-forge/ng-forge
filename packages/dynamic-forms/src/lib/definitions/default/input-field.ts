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
// Generic discriminated union builder
// ============================================================================

/**
 * Number input variant - used when props.type can be 'number'
 */
interface NumberInputFieldVariant<TProps extends { type?: any }> extends BaseValueField<TProps, number> {
  type: 'input';
  props: TProps & { type: 'number' };
}

/**
 * String input variant - used when props.type can be text/email/etc
 */
interface StringInputFieldVariant<TProps extends { type?: any }> extends BaseValueField<TProps, string> {
  type: 'input';
  props?: TProps;
}

/**
 * Helper type to extract the input type from props
 */
type ExtractInputType<TProps> = TProps extends { type?: infer T } ? T : InputType;

/**
 * Builds discriminated union based on what input types are possible in TProps
 */
type BuildInputFieldUnion<TProps extends { type?: any }> =
  ExtractInputType<TProps> extends infer T
    ? T extends string
      ?
          | ('number' extends T ? NumberInputFieldVariant<TProps> : never)
          | (Exclude<T, 'number'> extends never ? never : StringInputFieldVariant<TProps>)
      : StringInputFieldVariant<TProps>
    : never;

/**
 * Input field with automatic type-safe value inference.
 * TypeScript automatically infers the correct value type based on props.type.
 *
 * @example
 * // Direct usage - strict type safety without generics
 * const textField: InputField = {
 *   type: 'input',
 *   key: 'name',
 *   props: { type: 'text' },
 *   value: 'hello' // ✓ string
 * };
 *
 * const numberField: InputField = {
 *   type: 'input',
 *   key: 'age',
 *   props: { type: 'number' },
 *   value: 25 // ✓ number (string would be a type error!)
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
export type InputField<TProps extends { type?: any } = InputProps> = BuildInputFieldUnion<TProps>;
