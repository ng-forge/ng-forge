/**
 * Exhaustive type tests for MatInput field.
 *
 * These tests act as a WHITELIST - they verify that types have EXACTLY
 * the expected properties. If a property is added, removed, or its type
 * changes, these tests will fail.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatInputProps, MatInputField } from './mat-input.type';

// ============================================================================
// Type Utilities
// ============================================================================

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

// ============================================================================
// MatInputProps - Whitelist Test
// ============================================================================

describe('MatInputProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'appearance' | 'disableRipple' | 'subscriptSizing' | 'type' | 'hint' | 'placeholder';
  type ActualKeys = keyof MatInputProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatInputProps>>().toEqualTypeOf<never>();
  });

  // Individual property type checks
  describe('property types', () => {
    it('appearance', () => {
      expectTypeOf<MatInputProps['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('disableRipple', () => {
      expectTypeOf<MatInputProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('subscriptSizing', () => {
      expectTypeOf<MatInputProps['subscriptSizing']>().toEqualTypeOf<SubscriptSizing | undefined>();
    });

    it('type', () => {
      expectTypeOf<MatInputProps['type']>().toEqualTypeOf<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<MatInputProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatInputProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatInputField (String variant) - Whitelist Test
// ============================================================================

describe('MatInputField (String) - Exhaustive Whitelist', () => {
  // Extract the string variant from the union
  type StringInputField = Extract<MatInputField, { props?: { type?: 'text' | 'email' | 'password' | 'tel' | 'url' } }>;

  // Expected keys from FieldDef + FieldWithValidation + BaseValueField + InputField
  type ExpectedKeys =
    // From FieldDef
    | 'key'
    | 'type'
    | 'label'
    | 'props'
    | 'className'
    | 'disabled'
    | 'readonly'
    | 'hidden'
    | 'tabIndex'
    | 'col'
    // From FieldWithValidation
    | 'required'
    | 'email'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'validators'
    | 'validationMessages'
    | 'logic'
    | 'schemas'
    // From BaseValueField
    | 'value'
    | 'placeholder';

  type ActualKeys = keyof StringInputField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<StringInputField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<StringInputField['type']>().toEqualTypeOf<'input'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<StringInputField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      // Props is optional for string input
      type PropsType = StringInputField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<StringInputField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<StringInputField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<StringInputField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<StringInputField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<StringInputField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<StringInputField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<StringInputField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<StringInputField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<StringInputField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<StringInputField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<StringInputField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<StringInputField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<StringInputField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<StringInputField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<StringInputField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<StringInputField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<StringInputField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value is string for string input', () => {
      expectTypeOf<StringInputField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<StringInputField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatInputField (Number variant) - Whitelist Test
// ============================================================================

describe('MatInputField (Number) - Exhaustive Whitelist', () => {
  // Extract the number variant from the union
  type NumberInputField = Extract<MatInputField, { props: { type: 'number' } }>;

  type ExpectedKeys =
    | 'key'
    | 'type'
    | 'label'
    | 'props'
    | 'className'
    | 'disabled'
    | 'readonly'
    | 'hidden'
    | 'tabIndex'
    | 'col'
    | 'required'
    | 'email'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'validators'
    | 'validationMessages'
    | 'logic'
    | 'schemas'
    | 'value'
    | 'placeholder';

  type ActualKeys = keyof NumberInputField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<NumberInputField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<NumberInputField['type']>().toEqualTypeOf<'input'>();
    });

    it('props is required for number input', () => {
      // Props is required for number input and must have type: 'number'
      expectTypeOf<NumberInputField['props']>().toMatchTypeOf<{ type: 'number' }>();
    });
  });

  describe('value type', () => {
    it('value is number for number input', () => {
      expectTypeOf<NumberInputField['value']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// Discriminated Union Behavior Tests
// ============================================================================

describe('MatInputField - Discriminated Union', () => {
  it('should accept string value when props.type is text', () => {
    const field = {
      type: 'input',
      key: 'name',
      props: { type: 'text' },
      value: 'hello',
    } as const satisfies MatInputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should accept number value when props.type is number', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 25,
    } as const satisfies MatInputField;

    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should accept string value when props is omitted', () => {
    const field = {
      type: 'input',
      key: 'name',
      value: 'hello',
    } as const satisfies MatInputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should accept Material-specific props', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: {
        type: 'email',
        appearance: 'outline',
        subscriptSizing: 'dynamic',
        hint: 'Enter your email',
        disableRipple: true,
      },
    } as const satisfies MatInputField;

    expectTypeOf(field.props.appearance).toEqualTypeOf<'outline'>();
  });
});
