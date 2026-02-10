/**
 * Exhaustive type tests for IonicSlider field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicSliderProps, IonicSliderField } from './ionic-slider.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicSliderProps - Whitelist Test
// ============================================================================

describe('IonicSliderProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'min'
    | 'max'
    | 'step'
    | 'dualKnobs'
    | 'pin'
    | 'pinFormatter'
    | 'ticks'
    | 'snaps'
    | 'color'
    | 'labelPlacement'
    | 'hint';
  type ActualKeys = keyof IonicSliderProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicSliderProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('min', () => {
      expectTypeOf<IonicSliderProps['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicSliderProps['max']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<IonicSliderProps['step']>().toEqualTypeOf<number | undefined>();
    });

    it('dualKnobs', () => {
      expectTypeOf<IonicSliderProps['dualKnobs']>().toEqualTypeOf<boolean | undefined>();
    });

    it('pin', () => {
      expectTypeOf<IonicSliderProps['pin']>().toEqualTypeOf<boolean | undefined>();
    });

    it('pinFormatter', () => {
      type PinFormatterType = IonicSliderProps['pinFormatter'];
      expectTypeOf<PinFormatterType>().toEqualTypeOf<((value: number) => string | number) | undefined>();
    });

    it('ticks', () => {
      expectTypeOf<IonicSliderProps['ticks']>().toEqualTypeOf<boolean | undefined>();
    });

    it('snaps', () => {
      expectTypeOf<IonicSliderProps['snaps']>().toEqualTypeOf<boolean | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicSliderProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('labelPlacement', () => {
      expectTypeOf<IonicSliderProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | undefined>();
    });
  });
});

// ============================================================================
// IonicSliderField - Whitelist Test
// ============================================================================

describe('IonicSliderField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof IonicSliderField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicSliderField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicSliderField['type']>().toEqualTypeOf<'slider'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicSliderField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicSliderField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicSliderField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicSliderField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicSliderField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicSliderField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicSliderField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicSliderField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicSliderField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicSliderField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicSliderField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicSliderField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicSliderField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicSliderField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicSliderField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicSliderField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicSliderField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicSliderField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicSliderField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value is number', () => {
      expectTypeOf<IonicSliderField['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicSliderField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('slider-specific keys from SliderField', () => {
    it('minValue', () => {
      expectTypeOf<IonicSliderField['minValue']>().toEqualTypeOf<number | undefined>();
    });

    it('maxValue', () => {
      expectTypeOf<IonicSliderField['maxValue']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<IonicSliderField['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// IonicSliderField - Usage Tests
// ============================================================================

describe('IonicSliderField - Usage Tests', () => {
  it('should accept slider with all Ionic props', () => {
    const field = {
      type: 'slider',
      key: 'volume',
      label: 'Volume',
      props: {
        min: 0,
        max: 100,
        step: 1,
        dualKnobs: false,
        pin: true,
        pinFormatter: (value: number) => `${value}%`,
        ticks: true,
        snaps: true,
        color: 'primary',
        labelPlacement: 'start',
      },
      value: 50,
    } as const satisfies IonicSliderField;

    expectTypeOf(field.value).toEqualTypeOf<50>();
  });

  it('should accept slider without props', () => {
    const field = {
      type: 'slider',
      key: 'brightness',
      value: 75,
    } as const satisfies IonicSliderField;

    expectTypeOf(field.value).toEqualTypeOf<75>();
  });

  it('should accept slider with min and max', () => {
    const field = {
      type: 'slider',
      key: 'temperature',
      props: {
        min: -10,
        max: 40,
        step: 0.5,
      },
      value: 20,
    } as const satisfies IonicSliderField;

    expectTypeOf(field.value).toEqualTypeOf<20>();
  });

  it('should accept dual knobs slider', () => {
    const field = {
      type: 'slider',
      key: 'priceRange',
      props: {
        dualKnobs: true,
        min: 0,
        max: 1000,
      },
    } as const satisfies IonicSliderField;

    expectTypeOf(field.type).toEqualTypeOf<'slider'>();
  });

  it('should accept pin formatter function', () => {
    const field = {
      type: 'slider',
      key: 'rating',
      props: {
        pin: true,
        pinFormatter: (value: number) => value.toFixed(2),
      },
    } as const satisfies IonicSliderField;

    expectTypeOf(field.type).toEqualTypeOf<'slider'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'slider',
      key: 's1',
      props: { color: 'primary' },
    } as const satisfies IonicSliderField;

    const success = {
      type: 'slider',
      key: 's2',
      props: { color: 'success' },
    } as const satisfies IonicSliderField;

    const danger = {
      type: 'slider',
      key: 's3',
      props: { color: 'danger' },
    } as const satisfies IonicSliderField;

    expectTypeOf(primary.type).toEqualTypeOf<'slider'>();
    expectTypeOf(success.type).toEqualTypeOf<'slider'>();
    expectTypeOf(danger.type).toEqualTypeOf<'slider'>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'slider',
      key: 's1',
      props: { labelPlacement: 'start' },
    } as const satisfies IonicSliderField;

    const end = {
      type: 'slider',
      key: 's2',
      props: { labelPlacement: 'end' },
    } as const satisfies IonicSliderField;

    const fixed = {
      type: 'slider',
      key: 's3',
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicSliderField;

    const stacked = {
      type: 'slider',
      key: 's4',
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicSliderField;

    expectTypeOf(start.type).toEqualTypeOf<'slider'>();
    expectTypeOf(end.type).toEqualTypeOf<'slider'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'slider'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'slider'>();
  });

  it('should accept ticks and snaps', () => {
    const field = {
      type: 'slider',
      key: 'discrete',
      props: {
        ticks: true,
        snaps: true,
        step: 10,
      },
    } as const satisfies IonicSliderField;

    expectTypeOf(field.props?.ticks).toEqualTypeOf<true>();
    expectTypeOf(field.props?.snaps).toEqualTypeOf<true>();
  });
});
