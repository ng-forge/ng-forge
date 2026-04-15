/**
 * Exhaustive type tests for WrapperField type.
 */
import { expectTypeOf } from 'vitest';
import type { WrapperField, WrapperConfig, WrapperComponent } from './wrapper-field';
import type { ContainerLogicConfig } from '../base/container-logic-config';
import type { WrapperAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// WrapperField - Whitelist Test
// ============================================================================

describe('WrapperField - Exhaustive Whitelist', () => {
  // WrapperField extends FieldDef<never> and adds: fields, wrappers, label?: never, meta?: never
  // From FieldDef: key, type, label, props, className, disabled, readonly, hidden, tabIndex, col, meta
  // Note: 'meta' is overridden to 'never' because containers don't have native form elements
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
    | 'fields'
    | 'wrappers'
    | 'logic';

  type ActualKeys = keyof WrapperField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<WrapperField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<WrapperField['type']>().toEqualTypeOf<'wrapper'>();
    });

    it('fields is required', () => {
      type WrapperRequiredKeys = RequiredKeys<WrapperField>;
      expectTypeOf<'fields'>().toMatchTypeOf<WrapperRequiredKeys>();
    });

    it('wrappers is required', () => {
      type WrapperRequiredKeys = RequiredKeys<WrapperField>;
      expectTypeOf<'wrappers'>().toMatchTypeOf<WrapperRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (wrappers do not have labels)', () => {
      expectTypeOf<WrapperField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<WrapperField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (wrappers have no native form element)', () => {
      expectTypeOf<WrapperField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<WrapperField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<WrapperField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<WrapperField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<WrapperField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<WrapperField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<WrapperField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<WrapperField['logic']>().toEqualTypeOf<ContainerLogicConfig[] | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts WrapperAllowedChildren array', () => {
      type FieldsType = WrapperField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly WrapperAllowedChildren[]>();
    });
  });

  describe('wrappers property', () => {
    it('wrappers is a readonly array of WrapperConfig', () => {
      type WrappersType = WrapperField['wrappers'];
      expectTypeOf<WrappersType>().toMatchTypeOf<readonly WrapperConfig[]>();
    });
  });
});

// ============================================================================
// WrapperConfig - Type Tests
// ============================================================================

describe('WrapperConfig', () => {
  it('requires a type property', () => {
    expectTypeOf<WrapperConfig['type']>().toEqualTypeOf<string>();
  });

  it('accepts additional props via index signature', () => {
    const config: WrapperConfig = {
      type: 'section',
      header: 'My Section',
      hint: 'Some hint',
    } as const satisfies WrapperConfig;
    expectTypeOf(config.type).toBeString();
  });
});

// ============================================================================
// WrapperField - Generic Type Parameter
// ============================================================================

describe('WrapperField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly WrapperAllowedChildren[];
    type CustomWrapperField = WrapperField<CustomFields>;
    expectTypeOf<CustomWrapperField['fields']>().toMatchTypeOf<readonly WrapperAllowedChildren[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificWrapperField = WrapperField<readonly WrapperAllowedChildren[]>;
    expectTypeOf<SpecificWrapperField['type']>().toEqualTypeOf<'wrapper'>();
  });
});

// ============================================================================
// WrapperComponent - Type Extraction
// ============================================================================

describe('WrapperComponent - Type Extraction', () => {
  type TestComponent = WrapperComponent;

  it('should be a valid type', () => {
    expectTypeOf<TestComponent>().not.toBeNever();
  });
});

// ============================================================================
// WrapperField - Usage Tests
// ============================================================================

describe('WrapperField - Usage Tests', () => {
  it('should accept minimal wrapper definition', () => {
    const field = {
      key: 'wrapper1',
      type: 'wrapper',
      fields: [],
      wrappers: [],
    } as const satisfies WrapperField;

    expectTypeOf(field.type).toEqualTypeOf<'wrapper'>();
  });

  it('should accept wrapper with single wrapper config', () => {
    const field = {
      key: 'sectionWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [{ type: 'section', header: 'Details' }],
    } as const satisfies WrapperField;

    expectTypeOf(field.wrappers).not.toBeUndefined();
  });

  it('should accept wrapper with multiple wrapper configs (chaining)', () => {
    const field = {
      key: 'styledSection',
      type: 'wrapper',
      fields: [],
      wrappers: [
        { type: 'section', header: 'Details' },
        { type: 'style', class: 'highlight' },
      ],
    } as const satisfies WrapperField;

    expectTypeOf(field.wrappers).not.toBeUndefined();
  });

  it('should accept wrapper with className', () => {
    const field = {
      key: 'styledWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [],
      className: 'wrapper-container',
    } as const satisfies WrapperField;

    expectTypeOf(field.className).toEqualTypeOf<'wrapper-container'>();
  });

  it('should accept wrapper with disabled state', () => {
    const field = {
      key: 'disabledWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [],
      disabled: true,
    } as const satisfies WrapperField;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
  });

  it('should accept wrapper with hidden state', () => {
    const field = {
      key: 'hiddenWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [],
      hidden: true,
    } as const satisfies WrapperField;

    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });

  it('should accept wrapper with logic configuration', () => {
    const field = {
      key: 'conditionalWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [{ type: 'section', header: 'Conditional' }],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showSection',
            operator: 'equals',
            value: false,
          },
        },
      ],
    } as const satisfies WrapperField;

    expectTypeOf(field.logic).not.toBeUndefined();
  });

  it('should accept wrapper with col sizing', () => {
    const field = {
      key: 'sizedWrapper',
      type: 'wrapper',
      fields: [],
      wrappers: [],
      col: 6,
    } as const satisfies WrapperField;

    expectTypeOf(field.col).toEqualTypeOf<6>();
  });
});
