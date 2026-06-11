/**
 * Exhaustive type tests for SelectField and SelectProps types.
 */
import { expectTypeOf } from 'vitest';
import type { SelectField, SelectProps } from './select-field';
import type { FieldOption } from '@ng-forge/dynamic-forms/internal';

// ============================================================================
// SelectField - Keys Whitelist Test
// ============================================================================

describe('SelectField - Exhaustive Whitelist', () => {
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
    | 'validateWhenHidden'
    // From BaseValueField
    | 'value'
    | 'placeholder'
    | 'required'
    // From FieldWithValidation
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
    // Wrappers and addons
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
    // Nullable opt-in
    | 'nullable'
    // SelectField-specific
    | 'options';

  type ActualKeys = keyof SelectField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('type is literal select', () => {
    expectTypeOf<SelectField<string>['type']>().toEqualTypeOf<'select'>();
  });
});

// ============================================================================
// SelectField<string> - String Option Type
// ============================================================================

describe('SelectField<string>', () => {
  it('options have FieldOption<string> items', () => {
    expectTypeOf<SelectField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
  });

  it('value is string (default TNullable = boolean distributes to | null)', () => {
    expectTypeOf<SelectField<string>['value']>().toEqualTypeOf<string | null | undefined>();
    // Pinning nullable: false removes null from the value union.
    expectTypeOf<SelectField<string, SelectProps, false>['value']>().toEqualTypeOf<string | undefined>();
  });
});

// ============================================================================
// SelectField<number> - Number Option Type
// ============================================================================

describe('SelectField<number>', () => {
  it('value is number (default TNullable = boolean distributes to | null)', () => {
    expectTypeOf<SelectField<number>['value']>().toEqualTypeOf<number | null | undefined>();
  });

  it('options are FieldOption<number>', () => {
    expectTypeOf<SelectField<number>['options']>().toEqualTypeOf<readonly FieldOption<number>[]>();
  });
});

// ============================================================================
// SelectField<object> - Preserves Object Option Type
// ============================================================================

describe('SelectField<{ id: string; name: string }>', () => {
  type Obj = { id: string; name: string };

  it('preserves object option type', () => {
    expectTypeOf<SelectField<Obj>['options']>().toEqualTypeOf<readonly FieldOption<Obj>[]>();
  });

  it('value is the object type (default TNullable = boolean distributes to | null)', () => {
    expectTypeOf<SelectField<Obj>['value']>().toEqualTypeOf<Obj | null | undefined>();
  });
});

// ============================================================================
// SelectProps - Whitelist Test
// ============================================================================

describe('SelectProps', () => {
  type ActualKeys = keyof SelectProps;

  it('should have no keys (empty base props)', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// Generic TProps Parameter Extension
// ============================================================================

describe('SelectField - TProps extension', () => {
  interface CustomSelectProps extends SelectProps {
    searchable: boolean;
  }

  it('accepts custom props extending SelectProps', () => {
    expectTypeOf<SelectField<string, CustomSelectProps>['props']>().toEqualTypeOf<CustomSelectProps | undefined>();
  });
});

// ============================================================================
// SelectField - Usage Tests
// ============================================================================

describe('SelectField - Usage Tests', () => {
  it('should accept as const satisfies for string select', () => {
    const field = {
      key: 'color',
      type: 'select',
      label: 'Favorite Color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
      ],
    } as const satisfies SelectField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'select'>();
    expectTypeOf(field.key).toEqualTypeOf<'color'>();
  });
});
