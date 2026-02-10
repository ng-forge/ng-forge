/**
 * Exhaustive type tests for PrimeSlider field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeSliderProps, PrimeSliderField } from './prime-slider.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeSliderProps - Whitelist Test
// ============================================================================

describe('PrimeSliderProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'min' | 'max' | 'step' | 'range' | 'orientation' | 'styleClass' | 'hint';
  type ActualKeys = keyof PrimeSliderProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeSliderProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('min', () => {
      expectTypeOf<PrimeSliderProps['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<PrimeSliderProps['max']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<PrimeSliderProps['step']>().toEqualTypeOf<number | undefined>();
    });

    it('range', () => {
      expectTypeOf<PrimeSliderProps['range']>().toEqualTypeOf<boolean | undefined>();
    });

    it('orientation', () => {
      expectTypeOf<PrimeSliderProps['orientation']>().toEqualTypeOf<'horizontal' | 'vertical' | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeSliderProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeSliderProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeSliderField - Whitelist Test
// ============================================================================

describe('PrimeSliderField - Exhaustive Whitelist', () => {
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
    | 'placeholder'
    // From SliderField
    | 'minValue'
    | 'maxValue'
    | 'step';

  type ActualKeys = keyof PrimeSliderField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeSliderField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeSliderField['type']>().toEqualTypeOf<'slider'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeSliderField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeSliderField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeSliderField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeSliderField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeSliderField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeSliderField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeSliderField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeSliderField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeSliderField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeSliderField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeSliderField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeSliderField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeSliderField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is number', () => {
      expectTypeOf<PrimeSliderField['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeSliderField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('slider-specific keys', () => {
    it('minValue', () => {
      expectTypeOf<PrimeSliderField['minValue']>().toEqualTypeOf<number | undefined>();
    });

    it('maxValue', () => {
      expectTypeOf<PrimeSliderField['maxValue']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<PrimeSliderField['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeSliderField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'slider',
      key: 'volume',
      label: 'Volume',
      value: 50,
      minValue: 0,
      maxValue: 100,
      step: 5,
      props: {
        orientation: 'horizontal',
        styleClass: 'custom-slider',
        hint: 'Adjust the volume',
      },
    } as const satisfies PrimeSliderField;

    expectTypeOf(field.type).toEqualTypeOf<'slider'>();
    expectTypeOf(field.value).toEqualTypeOf<50>();
  });
});
