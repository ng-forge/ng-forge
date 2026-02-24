/**
 * Exhaustive type tests for InputField, InputType, InferInputValue, and related types.
 */
import { expectTypeOf } from 'vitest';
import type { InputField, InputType, InferInputValue, NumericInputType, StringInputType, HtmlInputType } from './input-field';

// ============================================================================
// HtmlInputType - Exhaustive Whitelist
// ============================================================================

describe('HtmlInputType - Exhaustive Whitelist', () => {
  type ExpectedValues =
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

  it('should have exactly the expected values', () => {
    expectTypeOf<HtmlInputType>().toEqualTypeOf<ExpectedValues>();
  });
});

// ============================================================================
// InputType - Supported subset
// ============================================================================

describe('InputType - Supported Subset', () => {
  type ExpectedValues = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  it('should have exactly the expected values', () => {
    expectTypeOf<InputType>().toEqualTypeOf<ExpectedValues>();
  });

  it('should exclude unsupported HTML input types', () => {
    expectTypeOf<'button'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'submit'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'reset'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'file'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'image'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'checkbox'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'radio'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'range'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'date'>().not.toMatchTypeOf<InputType>();
    expectTypeOf<'hidden'>().not.toMatchTypeOf<InputType>();
  });
});

// ============================================================================
// NumericInputType
// ============================================================================

describe('NumericInputType', () => {
  it('should extract only number from default InputType', () => {
    expectTypeOf<NumericInputType>().toEqualTypeOf<'number'>();
  });

  it('should extract number from extended types', () => {
    expectTypeOf<NumericInputType<'number' | 'date' | 'text'>>().toEqualTypeOf<'number'>();
  });

  it('should be never when number is not in the union', () => {
    expectTypeOf<NumericInputType<'text' | 'email'>>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// StringInputType
// ============================================================================

describe('StringInputType', () => {
  it('should exclude number from default InputType', () => {
    type Expected = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
    expectTypeOf<StringInputType>().toEqualTypeOf<Expected>();
  });

  it('should exclude number from extended types', () => {
    expectTypeOf<StringInputType<'number' | 'date' | 'text'>>().toEqualTypeOf<'date' | 'text'>();
  });

  it('should keep all when number is not in the union', () => {
    expectTypeOf<StringInputType<'text' | 'email'>>().toEqualTypeOf<'text' | 'email'>();
  });
});

// ============================================================================
// InferInputValue
// ============================================================================

describe('InferInputValue', () => {
  it('should map number to number', () => {
    expectTypeOf<InferInputValue<'number'>>().toEqualTypeOf<number>();
  });

  it('should map text to string', () => {
    expectTypeOf<InferInputValue<'text'>>().toEqualTypeOf<string>();
  });

  it('should map email to string', () => {
    expectTypeOf<InferInputValue<'email'>>().toEqualTypeOf<string>();
  });

  it('should map password to string', () => {
    expectTypeOf<InferInputValue<'password'>>().toEqualTypeOf<string>();
  });

  it('should map tel to string', () => {
    expectTypeOf<InferInputValue<'tel'>>().toEqualTypeOf<string>();
  });

  it('should map url to string', () => {
    expectTypeOf<InferInputValue<'url'>>().toEqualTypeOf<string>();
  });

  it('should map date to string', () => {
    expectTypeOf<InferInputValue<'date'>>().toEqualTypeOf<string>();
  });
});

// ============================================================================
// InputField - Keys Whitelist
// ============================================================================

describe('InputField - Keys Whitelist', () => {
  // InputField is union of NumberInputField | StringInputField
  // Both extend BaseValueField which extends FieldDef + FieldWithValidation
  type ExpectedKeys =
    | 'key'
    | 'type'
    | 'label'
    | 'props'
    | 'meta'
    | 'className'
    | 'disabled'
    | 'readonly'
    | 'hidden'
    | 'tabIndex'
    | 'col'
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    // BaseValueField
    | 'value'
    | 'placeholder'
    | 'required'
    // FieldWithValidation
    | 'email'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'validators'
    | 'validationMessages'
    | 'logic'
    | 'derivation'
    | 'schemas';

  // For a union, keyof gives intersection of keys (common keys)
  type ActualKeys = keyof InputField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });
});

// ============================================================================
// InputField is union of NumberInputField | StringInputField
// ============================================================================

describe('InputField - Discriminated Union', () => {
  it('should be a union type (not a single interface)', () => {
    // A number field should satisfy InputField
    const numField: InputField = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 42,
    };
    expectTypeOf(numField).toMatchTypeOf<InputField>();

    // A string field should satisfy InputField
    const strField: InputField = {
      type: 'input',
      key: 'name',
      value: 'hello',
    };
    expectTypeOf(strField).toMatchTypeOf<InputField>();
  });
});

// ============================================================================
// NumberInputField variant
// ============================================================================

describe('NumberInputField variant', () => {
  it('should require props with type number', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 25,
    } as const satisfies InputField;

    expectTypeOf(field.props.type).toEqualTypeOf<'number'>();
    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should have number value type', () => {
    const field: InputField = {
      type: 'input',
      key: 'quantity',
      props: { type: 'number' },
      value: 100,
    };

    // value on the union is number | string | undefined
    // but when narrowed via props.type = 'number', it is number
    expectTypeOf(field.value).toMatchTypeOf<number | string | undefined>();
  });
});

// ============================================================================
// StringInputField variant
// ============================================================================

describe('StringInputField variant', () => {
  it('should allow optional props', () => {
    const field = {
      type: 'input',
      key: 'name',
      value: 'hello',
    } as const satisfies InputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should allow props with string type', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: { type: 'email' },
      value: 'test@example.com',
    } as const satisfies InputField;

    expectTypeOf(field.props.type).toEqualTypeOf<'email'>();
  });

  it('should have string value type', () => {
    const field: InputField = {
      type: 'input',
      key: 'name',
      props: { type: 'text' },
      value: 'test',
    };

    expectTypeOf(field.value).toMatchTypeOf<number | string | undefined>();
  });
});

// ============================================================================
// Generic parameter: custom props
// ============================================================================

describe('InputField - Generic Parameter', () => {
  interface CustomProps {
    type?: InputType;
    appearance?: 'fill' | 'outline';
    hint?: string;
  }

  it('should accept custom props extending InputField', () => {
    type CustomInputField = InputField<CustomProps>;

    const field: CustomInputField = {
      type: 'input',
      key: 'custom',
      props: { type: 'text', appearance: 'outline', hint: 'Enter value' },
      value: 'test',
    };

    expectTypeOf(field).toMatchTypeOf<CustomInputField>();
  });

  it('should preserve discriminated union with custom props', () => {
    type CustomInputField = InputField<CustomProps>;

    const numField: CustomInputField = {
      type: 'input',
      key: 'num',
      props: { type: 'number', appearance: 'fill' },
      value: 42,
    };

    expectTypeOf(numField).toMatchTypeOf<CustomInputField>();
  });
});

// ============================================================================
// InputField - Usage Tests (as const satisfies)
// ============================================================================

describe('InputField - Usage Tests', () => {
  it('should accept minimal number input field', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
    } as const satisfies InputField;

    expectTypeOf(field.type).toEqualTypeOf<'input'>();
    expectTypeOf(field.props.type).toEqualTypeOf<'number'>();
  });

  it('should accept minimal string input field', () => {
    const field = {
      type: 'input',
      key: 'name',
    } as const satisfies InputField;

    expectTypeOf(field.type).toEqualTypeOf<'input'>();
  });

  it('should accept string input with placeholder', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: { type: 'email', placeholder: 'Enter email' },
    } as const satisfies InputField;

    expectTypeOf(field.props.type).toEqualTypeOf<'email'>();
  });

  it('should accept number input with value', () => {
    const field = {
      type: 'input',
      key: 'price',
      props: { type: 'number' },
      value: 9.99,
    } as const satisfies InputField;

    expectTypeOf(field.value).toEqualTypeOf<9.99>();
  });

  it('should accept string input with value', () => {
    const field = {
      type: 'input',
      key: 'username',
      props: { type: 'text' },
      value: 'admin',
    } as const satisfies InputField;

    expectTypeOf(field.value).toEqualTypeOf<'admin'>();
  });

  it('should accept input with validation', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: { type: 'email' },
      required: true,
      email: true,
    } as const satisfies InputField;

    expectTypeOf(field.required).toEqualTypeOf<true>();
    expectTypeOf(field.email).toEqualTypeOf<true>();
  });

  it('should accept input with col sizing', () => {
    const field = {
      type: 'input',
      key: 'phone',
      props: { type: 'tel' },
      col: 6,
    } as const satisfies InputField;

    expectTypeOf(field.col).toEqualTypeOf<6>();
  });
});
