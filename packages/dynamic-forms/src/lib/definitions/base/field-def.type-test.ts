/**
 * Exhaustive type tests for FieldDef interface.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText } from '../../models/types/dynamic-text';
import type { FieldDef, FieldComponent } from './field-def';
import type { RequiredKeys, OptionalKeys } from '@ng-forge/utils';

// ============================================================================
// FieldDef - Whitelist Test
// ============================================================================

describe('FieldDef - Exhaustive Whitelist', () => {
  type TestProps = { placeholder?: string };
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
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly';
  type ActualKeys = keyof FieldDef<TestProps>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<RequiredKeys<FieldDef<TestProps>>>().toEqualTypeOf<'key' | 'type'>();
    });

    it('key is string', () => {
      expectTypeOf<FieldDef<TestProps>['key']>().toEqualTypeOf<string>();
    });

    it('type is required', () => {
      expectTypeOf<FieldDef<TestProps>['type']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('all optional keys', () => {
      expectTypeOf<OptionalKeys<FieldDef<TestProps>>>().toEqualTypeOf<
        | 'label'
        | 'props'
        | 'className'
        | 'disabled'
        | 'readonly'
        | 'hidden'
        | 'tabIndex'
        | 'col'
        | 'meta'
        | 'excludeValueIfHidden'
        | 'excludeValueIfDisabled'
        | 'excludeValueIfReadonly'
      >();
    });

    it('label', () => {
      expectTypeOf<FieldDef<TestProps>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      expectTypeOf<FieldDef<TestProps>['props']>().toEqualTypeOf<TestProps | undefined>();
    });

    it('className', () => {
      expectTypeOf<FieldDef<TestProps>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<FieldDef<TestProps>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<FieldDef<TestProps>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<FieldDef<TestProps>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<FieldDef<TestProps>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<FieldDef<TestProps>['col']>().toEqualTypeOf<number | undefined>();
    });

    it('excludeValueIfHidden', () => {
      expectTypeOf<FieldDef<TestProps>['excludeValueIfHidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('excludeValueIfDisabled', () => {
      expectTypeOf<FieldDef<TestProps>['excludeValueIfDisabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('excludeValueIfReadonly', () => {
      expectTypeOf<FieldDef<TestProps>['excludeValueIfReadonly']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// FieldDef - Props Generic Parameter
// ============================================================================

describe('FieldDef - Props Generic Parameter', () => {
  it('should accept unknown props type', () => {
    type TestField = FieldDef<unknown>;
    expectTypeOf<TestField['props']>().toEqualTypeOf<unknown>();
  });

  it('should accept Record props type', () => {
    type TestProps = Record<string, unknown>;
    type TestField = FieldDef<TestProps>;
    expectTypeOf<TestField['props']>().toEqualTypeOf<TestProps | undefined>();
  });

  it('should accept specific interface props', () => {
    interface CustomProps {
      size?: 'sm' | 'lg';
      variant?: 'primary' | 'secondary';
    }
    type TestField = FieldDef<CustomProps>;
    expectTypeOf<TestField['props']>().toEqualTypeOf<CustomProps | undefined>();
  });

  it('should accept empty object props', () => {
    type TestField = FieldDef<object>;
    expectTypeOf<TestField['props']>().toEqualTypeOf<object | undefined>();
  });
});

// ============================================================================
// FieldDef - Usage Examples
// ============================================================================

describe('FieldDef - Usage Examples', () => {
  it('should accept minimal field definition', () => {
    const field = {
      key: 'username',
      type: 'input',
    } as const satisfies FieldDef<unknown>;

    expectTypeOf(field.key).toEqualTypeOf<'username'>();
    expectTypeOf(field.type).toEqualTypeOf<'input'>();
  });

  it('should accept complete field definition', () => {
    interface InputProps {
      placeholder?: string;
      maxLength?: number;
    }

    const field = {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      props: {
        placeholder: 'Enter your email',
        maxLength: 100,
      },
      className: 'custom-input',
      disabled: false,
      readonly: false,
      hidden: false,
      tabIndex: 0,
      col: 6,
    } as const satisfies FieldDef<InputProps>;

    expectTypeOf(field.key).toEqualTypeOf<'email'>();
    expectTypeOf(field.type).toEqualTypeOf<'input'>();
    expectTypeOf(field.label).toEqualTypeOf<'Email Address'>();
  });

  it('should accept field with dynamic label', () => {
    const field = {
      key: 'name',
      type: 'input',
      label: 'form.name.label' as DynamicText,
    } as const satisfies FieldDef<unknown>;

    expectTypeOf(field.label).toMatchTypeOf<DynamicText>();
  });

  it('should accept field with col sizing', () => {
    const fullWidth = {
      key: 'description',
      type: 'textarea',
      col: 12,
    } as const satisfies FieldDef<unknown>;

    const halfWidth = {
      key: 'firstName',
      type: 'input',
      col: 6,
    } as const satisfies FieldDef<unknown>;

    expectTypeOf(fullWidth.col).toEqualTypeOf<12>();
    expectTypeOf(halfWidth.col).toEqualTypeOf<6>();
  });

  it('should accept field with state flags', () => {
    const field = {
      key: 'secretField',
      type: 'input',
      disabled: true,
      readonly: false,
      hidden: true,
    } as const satisfies FieldDef<unknown>;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
    expectTypeOf(field.readonly).toEqualTypeOf<false>();
    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });
});

// ============================================================================
// FieldComponent - Type Extraction
// ============================================================================

describe('FieldComponent - Type Extraction', () => {
  interface TestProps {
    size?: 'sm' | 'lg';
  }

  interface TestFieldDef extends FieldDef<TestProps> {
    customProp?: string;
  }

  type TestComponent = FieldComponent<TestFieldDef>;

  it('should include only specific keys from FieldDef', () => {
    type ExpectedKeys = 'label' | 'className' | 'hidden' | 'tabIndex';
    type ActualKeys = keyof TestComponent;

    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should not include key', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'key'>();
  });

  it('should not include type', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'type'>();
  });

  it('should not include props', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'props'>();
  });

  it('should not include disabled', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'disabled'>();
  });

  it('should not include readonly', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'readonly'>();
  });

  it('should not include col', () => {
    expectTypeOf<keyof TestComponent>().not.toMatchTypeOf<'col'>();
  });
});
