/**
 * Exhaustive type tests for PrimeInput field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeInputProps, PrimeInputField, PrimeInputAddonExtensions } from './prime-input.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeInputProps - Whitelist Test
// ============================================================================

describe('PrimeInputProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'styleClass' | 'hint' | 'size' | 'variant' | 'type';
  type ActualKeys = keyof PrimeInputProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeInputProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('styleClass', () => {
      expectTypeOf<PrimeInputProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeInputProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('size', () => {
      expectTypeOf<PrimeInputProps['size']>().toEqualTypeOf<'small' | 'large' | undefined>();
    });

    it('variant', () => {
      expectTypeOf<PrimeInputProps['variant']>().toEqualTypeOf<'outlined' | 'filled' | undefined>();
    });

    it('type', () => {
      expectTypeOf<PrimeInputProps['type']>().toEqualTypeOf<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | undefined>();
    });
  });
});

// ============================================================================
// PrimeInputField (String) - Whitelist Test
// ============================================================================

describe('PrimeInputField (String) - Exhaustive Whitelist', () => {
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
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
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
    | 'placeholder'
    | 'nullable';

  // String input field (without props.type: 'number')
  type StringInputField = Extract<PrimeInputField, { props?: { type?: 'text' | 'email' | 'password' | 'tel' | 'url' } }>;
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
      expectTypeOf<StringInputField['value']>().toEqualTypeOf<string | null | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<StringInputField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeInputField (Number) - Whitelist Test
// ============================================================================

describe('PrimeInputField (Number) - Exhaustive Whitelist', () => {
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
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
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
    | 'placeholder'
    | 'nullable';

  // Number input field (with props.type: 'number')
  type NumberInputField = Extract<PrimeInputField, { props: { type: 'number' } }>;
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
      expectTypeOf<NumberInputField['value']>().toEqualTypeOf<number | null | undefined>();
    });
  });
});

// ============================================================================
// PrimeInputField - Discriminated Union
// ============================================================================

describe('PrimeInputField - Discriminated Union', () => {
  it('should accept string value when props.type is text', () => {
    const field = {
      type: 'input',
      key: 'username',
      props: { type: 'text' },
      value: 'hello',
    } as const satisfies PrimeInputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should accept number value when props.type is number', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 25,
    } as const satisfies PrimeInputField;

    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should accept string value when props is omitted', () => {
    const field = {
      type: 'input',
      key: 'name',
      value: 'test',
    } as const satisfies PrimeInputField;

    expectTypeOf(field.value).toEqualTypeOf<'test'>();
  });

  it('should accept PrimeNG-specific props', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: {
        type: 'email',
        size: 'large',
        variant: 'outlined',
        hint: 'Enter your email',
      },
    } as const satisfies PrimeInputField;

    expectTypeOf(field.type).toEqualTypeOf<'input'>();
  });
});

// ============================================================================
// PrimeInputField — Addons (compile-time)
// ============================================================================

describe('PrimeInputField - addons', () => {
  it('accepts pi-icon addon with required `icon`', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'prefix', kind: 'pi-icon', icon: 'search' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-icon'>();
  });

  it('accepts pi-button addon with preset', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('accepts text addon with DynamicText', () => {
    const field = {
      type: 'input',
      key: 'amount',
      addons: [{ slot: 'prefix', kind: 'text', text: '$' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'text'>();
  });

  it('accepts template addon with templateKey', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'template', templateKey: 'mySlot' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'template'>();
  });

  it("base addon kinds are present in PrimeInput's union", () => {
    // Base kinds always appear; user augmentations via `PrimeInputAddonExtensions`
    // extend the union further. We assert direction (base → accepted) so the
    // test stays correct when extensions are added in user code.
    type AcceptedKinds = NonNullable<PrimeInputField['addons']>[number]['kind'];
    expectTypeOf<'pi-icon' | 'pi-button' | 'text' | 'template'>().toMatchTypeOf<AcceptedKinds>();
  });

  it('PrimeInputAddonExtensions is empty by default — augmentable seam', () => {
    // The interface itself ships empty so `keyof` resolves to `never` and the
    // extension contributes nothing. Users can declare-module-augment it to
    // bring custom kinds into the typed union.
    expectTypeOf<keyof PrimeInputAddonExtensions>().toEqualTypeOf<never>();
  });

  it('accepts addons with optional reactive hidden flag', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', icon: 'x', ariaLabel: 'Clear', preset: 'clear', hidden: false }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].hidden).toEqualTypeOf<false>();
  });

  it('rejects icon-only pi-button without ariaLabel via content XOR', () => {
    // The PiButtonAddon content axis is `IconOnly` | `Labeled` | `Decorative`.
    // An icon-only shape WITHOUT ariaLabel doesn't match any branch — assert
    // that explicitly so a future regression that loosens the XOR fails this test.
    type IconOnlyMissingAria = { slot: 'suffix'; kind: 'pi-button'; icon: 'times'; preset: 'clear' };
    type AcceptedPiButtonShapes = Extract<NonNullable<PrimeInputField['addons']>[number], { kind: 'pi-button' }>;
    expectTypeOf<IconOnlyMissingAria>().not.toMatchTypeOf<AcceptedPiButtonShapes>();
  });

  it('accepts labeled pi-button without ariaLabel', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', label: 'Clear', preset: 'clear' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('accepts icon-only pi-button when ariaLabel is provided', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('accepts pi-button with actionRef alone (click XOR)', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', label: 'Open', actionRef: 'openProfile' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('accepts pi-button with inline action alone (click XOR)', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', label: 'Run', action: () => undefined }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('accepts decorative pi-button with no click handler', () => {
    const field = {
      type: 'input',
      key: 'q',
      addons: [{ slot: 'suffix', kind: 'pi-button', label: 'Static' }],
    } as const satisfies PrimeInputField;
    expectTypeOf(field.addons[0].kind).toEqualTypeOf<'pi-button'>();
  });

  it('rejects pi-button combining preset + actionRef via click XOR', () => {
    type PresetAndActionRef = {
      slot: 'suffix';
      kind: 'pi-button';
      label: 'Bad';
      preset: 'clear';
      actionRef: 'openProfile';
    };
    type AcceptedPiButtonShapes = Extract<NonNullable<PrimeInputField['addons']>[number], { kind: 'pi-button' }>;
    expectTypeOf<PresetAndActionRef>().not.toMatchTypeOf<AcceptedPiButtonShapes>();
  });

  it('rejects pi-button combining preset + inline action via click XOR', () => {
    type PresetAndAction = {
      slot: 'suffix';
      kind: 'pi-button';
      label: 'Bad';
      preset: 'clear';
      action: () => void;
    };
    type AcceptedPiButtonShapes = Extract<NonNullable<PrimeInputField['addons']>[number], { kind: 'pi-button' }>;
    expectTypeOf<PresetAndAction>().not.toMatchTypeOf<AcceptedPiButtonShapes>();
  });

  it('rejects pi-button combining actionRef + inline action via click XOR', () => {
    type ActionRefAndAction = {
      slot: 'suffix';
      kind: 'pi-button';
      label: 'Bad';
      actionRef: 'openProfile';
      action: () => void;
    };
    type AcceptedPiButtonShapes = Extract<NonNullable<PrimeInputField['addons']>[number], { kind: 'pi-button' }>;
    expectTypeOf<ActionRefAndAction>().not.toMatchTypeOf<AcceptedPiButtonShapes>();
  });
});
