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
import type { RequiredKeys } from '@ng-forge/utils';

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

// ============================================================================
// Union Type Narrowing Tests
// ============================================================================

describe('MatInputField - Union Type Narrowing', () => {
  // Type guard for number input
  function isNumberInput(field: MatInputField): field is Extract<MatInputField, { props: { type: 'number' } }> {
    return field.props?.type === 'number';
  }

  // Type guard for string input
  function isStringInput(
    field: MatInputField,
  ): field is Extract<MatInputField, { props?: { type?: Exclude<MatInputProps['type'], 'number'> } }> {
    return field.props?.type !== 'number';
  }

  describe('control flow narrowing with type guards', () => {
    it('should narrow to number value type when isNumberInput returns true', () => {
      const field: MatInputField = {
        type: 'input',
        key: 'test',
        props: { type: 'number' },
        value: 42,
      };

      if (isNumberInput(field)) {
        // After narrowing, value should be number | undefined
        expectTypeOf(field.value).toEqualTypeOf<number | undefined>();
        expectTypeOf(field.props.type).toEqualTypeOf<'number'>();
      }
    });

    it('should narrow to string value type when isStringInput returns true', () => {
      const field: MatInputField = {
        type: 'input',
        key: 'test',
        props: { type: 'text' },
        value: 'hello',
      };

      if (isStringInput(field)) {
        // After narrowing, value should be string | undefined
        expectTypeOf(field.value).toEqualTypeOf<string | undefined>();
      }
    });
  });

  describe('Extract/Exclude type narrowing', () => {
    it('should extract number variant correctly', () => {
      type NumberVariant = Extract<MatInputField, { props: { type: 'number' } }>;

      // Value must be number
      expectTypeOf<NumberVariant['value']>().toEqualTypeOf<number | undefined>();

      // Props must have type: 'number'
      expectTypeOf<NumberVariant['props']['type']>().toEqualTypeOf<'number'>();
    });

    it('should exclude number variant to get string variant', () => {
      // Use Exclude instead of Extract for the string variant
      type StringVariant = Exclude<MatInputField, { props: { type: 'number' } }>;

      // Value must be string
      expectTypeOf<StringVariant['value']>().toEqualTypeOf<string | undefined>();
    });

    it('should verify string input types all produce string values', () => {
      // For string input types, we verify through the union's value type
      type StringInputValue = Exclude<MatInputField, { props: { type: 'number' } }>['value'];
      expectTypeOf<StringInputValue>().toEqualTypeOf<string | undefined>();
    });
  });

  describe('discriminant-based narrowing', () => {
    it('should narrow with explicit type guard', () => {
      // TypeScript's control flow with nested optional properties requires explicit guards
      const processField = (field: MatInputField) => {
        if (isNumberInput(field)) {
          // Type guard narrows correctly
          expectTypeOf(field.value).toEqualTypeOf<number | undefined>();
          expectTypeOf(field.props.type).toEqualTypeOf<'number'>();
        }
      };

      expectTypeOf(processField).toBeFunction();
    });

    it('should allow discriminant value checking', () => {
      const getValueType = (field: MatInputField): 'number' | 'string' => {
        // Check the discriminant value
        const inputType = field.props?.type;
        if (inputType === 'number') {
          return 'number';
        }
        return 'string';
      };

      expectTypeOf(getValueType).returns.toEqualTypeOf<'number' | 'string'>();
    });
  });

  describe('union exhaustiveness', () => {
    it('should cover all input types in union', () => {
      // The union should be exactly these two variants
      type NumberVariant = Extract<MatInputField, { props: { type: 'number' } }>;
      type StringVariant = Extract<MatInputField, { props?: { type?: Exclude<MatInputProps['type'], 'number'> } }>;

      // Verify the union is complete
      type ReconstructedUnion = NumberVariant | StringVariant;
      expectTypeOf<MatInputField>().toMatchTypeOf<ReconstructedUnion>();
    });

    it('should have mutually exclusive value types', () => {
      type NumberVariant = Extract<MatInputField, { props: { type: 'number' } }>;
      type StringVariant = Extract<MatInputField, { props?: { type?: 'text' } }>;

      // Number variant value should not be assignable to string
      expectTypeOf<NumberVariant['value']>().not.toMatchTypeOf<string>();

      // String variant value should not be assignable to number
      expectTypeOf<StringVariant['value']>().not.toMatchTypeOf<number>();
    });
  });

  describe('real-world narrowing scenarios', () => {
    it('should allow type-safe value assignment after narrowing', () => {
      // Extract the number variant - props with type: 'number' is required
      type NumberInput = Extract<MatInputField, { props: { type: 'number' } }>;

      // The string variant is the other member of the union (props is optional)
      type StringInput = Exclude<MatInputField, { props: { type: 'number' } }>;

      const numberField: NumberInput = {
        type: 'input',
        key: 'age',
        props: { type: 'number' },
        value: 25,
      };

      const textField: StringInput = {
        type: 'input',
        key: 'name',
        props: { type: 'text' },
        value: 'John',
      };

      // Verify the extracted types have correct value types
      expectTypeOf(numberField.value).toEqualTypeOf<number | undefined>();
      expectTypeOf(textField.value).toEqualTypeOf<string | undefined>();
    });

    it('should work with array of mixed input fields', () => {
      const fields: MatInputField[] = [
        { type: 'input', key: 'name', props: { type: 'text' }, value: 'John' },
        { type: 'input', key: 'age', props: { type: 'number' }, value: 30 },
        { type: 'input', key: 'email', props: { type: 'email' }, value: 'john@example.com' },
      ];

      // When iterating, each field is the full union
      fields.forEach((field) => {
        expectTypeOf(field.value).toEqualTypeOf<string | number | undefined>();

        // But we can narrow with type guards
        if (isNumberInput(field)) {
          expectTypeOf(field.value).toEqualTypeOf<number | undefined>();
        } else {
          expectTypeOf(field.value).toEqualTypeOf<string | undefined>();
        }
      });
    });
  });
});
