/**
 * Exhaustive type tests for BsInput field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { BsInputProps, BsInputField } from './bs-input.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsInputProps - Whitelist Test
// ============================================================================

describe('BsInputProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'size' | 'floatingLabel' | 'hint' | 'validFeedback' | 'invalidFeedback' | 'plaintext' | 'type' | 'placeholder';
  type ActualKeys = keyof BsInputProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsInputProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('size', () => {
      expectTypeOf<BsInputProps['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('floatingLabel', () => {
      expectTypeOf<BsInputProps['floatingLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsInputProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('validFeedback', () => {
      expectTypeOf<BsInputProps['validFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('invalidFeedback', () => {
      expectTypeOf<BsInputProps['invalidFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('plaintext', () => {
      expectTypeOf<BsInputProps['plaintext']>().toEqualTypeOf<boolean | undefined>();
    });

    it('type', () => {
      expectTypeOf<BsInputProps['type']>().toEqualTypeOf<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsInputProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsInputField (String) - Whitelist Test
// ============================================================================

describe('BsInputField (String) - Exhaustive Whitelist', () => {
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
    | 'meta'
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
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
    | 'derivation'
    | 'schemas'
    // From BaseValueField
    | 'value'
    | 'placeholder';

  // String input field (without props.type: 'number')
  type StringInputField = Extract<BsInputField, { props?: { type?: 'text' | 'email' | 'password' | 'tel' | 'url' } }>;
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
// BsInputField (Number) - Whitelist Test
// ============================================================================

describe('BsInputField (Number) - Exhaustive Whitelist', () => {
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
    | 'meta'
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
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
    | 'derivation'
    | 'schemas'
    | 'value'
    | 'placeholder';

  // Number input field (with props.type: 'number')
  type NumberInputField = Extract<BsInputField, { props: { type: 'number' } }>;
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
// BsInputField - Discriminated Union
// ============================================================================

describe('BsInputField - Discriminated Union', () => {
  it('should accept string value when props.type is text', () => {
    const field = {
      type: 'input',
      key: 'username',
      props: { type: 'text' },
      value: 'hello',
    } as const satisfies BsInputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should accept number value when props.type is number', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 25,
    } as const satisfies BsInputField;

    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should accept string value when props is omitted', () => {
    const field = {
      type: 'input',
      key: 'name',
      value: 'test',
    } as const satisfies BsInputField;

    expectTypeOf(field.value).toEqualTypeOf<'test'>();
  });

  it('should accept Bootstrap-specific props', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: {
        type: 'email',
        size: 'lg',
        floatingLabel: true,
        hint: 'Enter your email',
        validFeedback: 'Looks good!',
        invalidFeedback: 'Please enter a valid email',
      },
    } as const satisfies BsInputField;

    expectTypeOf(field.type).toEqualTypeOf<'input'>();
  });
});
