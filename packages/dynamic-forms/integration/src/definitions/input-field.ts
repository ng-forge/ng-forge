import { BaseValueField, DynamicText } from '@ng-forge/dynamic-forms';
import { InputMeta } from './input-meta';

/**
 * All valid HTML input types per MDN specification.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
 */
export type HtmlInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time'
  | 'color'
  | 'range'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'hidden'
  | 'button'
  | 'submit'
  | 'reset'
  | 'image';

/**
 * Input types supported by InputField.
 * Other HTML input types have dedicated field implementations:
 * - checkbox → CheckboxField
 * - radio → RadioField
 * - range → SliderField
 * - date/time → DatepickerField
 * - file, hidden, button, etc. → dedicated fields
 */
export type InputType = Extract<HtmlInputType, 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'>;

/**
 * Infers the TypeScript value type for a given input type.
 *
 * @example
 * type NumberValue = InferInputValue<'number'>; // number
 * type TextValue = InferInputValue<'text'>; // string
 * type DateValue = InferInputValue<'date'>; // string (extended types)
 */
export type InferInputValue<T extends HtmlInputType> = T extends 'number' ? number : string;

/**
 * @deprecated Use `InferInputValue` instead. Will be removed in v1.0.0.
 */
export type InputTypeToValueType<T extends InputType> = InferInputValue<T>;

/**
 * Props for input fields with optional type specification.
 * Generic parameter allows extending InputType with additional HtmlInputType values.
 *
 * @example
 * // Default usage
 * interface MyProps extends InputProps { ... }
 *
 * // Extended input types (e.g., supporting date inputs)
 * type ExtendedType = InputType | 'date' | 'time';
 * interface ExtendedProps extends InputProps<ExtendedType> { ... }
 */
export interface InputProps<T extends HtmlInputType = InputType> {
  /**
   * The HTML input type. Determines the value type:
   * - 'number': value will be number
   * - All other types: value will be string
   */
  type?: T;
  placeholder?: DynamicText;
}

// ============================================================================
// Input type categories
// ============================================================================

/**
 * Input types that produce numeric values.
 * Currently only 'number' produces a numeric value in HTML inputs.
 *
 * @example
 * type Numeric = NumericInputType; // 'number'
 */
export type NumericInputType<T extends HtmlInputType = InputType> = Extract<T, 'number'>;

/**
 * Input types that produce string values.
 *
 * @example
 * type Strings = StringInputType; // Exclude<InputType, 'number'>
 */
export type StringInputType<T extends HtmlInputType = InputType> = Exclude<T, 'number'>;

// ============================================================================
// Discriminated union variants
// ============================================================================

/**
 * Number input field with strict number value type.
 * When props.type is 'number', value must be number.
 * Props is REQUIRED and must include type: 'number'.
 */
interface NumberInputField<TProps extends { type?: string } = InputProps> extends BaseValueField<
  TProps & { type: 'number' },
  number,
  InputMeta
> {
  type: 'input';
  props: TProps & { type: 'number' }; // Required with type: 'number'
}

/**
 * String input field with strict string value type.
 * When props.type is text/email/etc (or undefined), value must be string.
 * Props type cannot be 'number'.
 */
interface StringInputField<TProps extends { type?: string } = InputProps> extends BaseValueField<
  TProps & { type?: Exclude<TProps['type'], 'number'> },
  string,
  InputMeta
> {
  type: 'input';
  props?: TProps & { type?: Exclude<TProps['type'], 'number'> }; // Optional, but type cannot be 'number'
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
