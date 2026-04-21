/**
 * Exhaustive type tests for ContainerField type.
 */
import { expectTypeOf } from 'vitest';
import type { ContainerField, ContainerComponent } from './container-field';
import type { WrapperConfig } from '../../models/wrapper-type';
import type { CssWrapper } from '../../wrappers/css/css-wrapper.type';
import type { ContainerLogicConfig } from '../base/container-logic-config';
import type { ContainerAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// ContainerField - Whitelist Test
// ============================================================================

describe('ContainerField - Exhaustive Whitelist', () => {
  // ContainerField extends FieldDef<never> and adds: fields, wrappers, label?: never, meta?: never
  // From FieldDef: key, type, label, props, className, disabled, readonly, hidden, tabIndex, col, meta
  // Note: 'meta' is overridden to 'never' because container fields don't have native form elements
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
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'logic';

  type ActualKeys = keyof ContainerField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<ContainerField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<ContainerField['type']>().toEqualTypeOf<'container'>();
    });

    it('fields is required', () => {
      type ContainerRequiredKeys = RequiredKeys<ContainerField>;
      expectTypeOf<'fields'>().toMatchTypeOf<ContainerRequiredKeys>();
    });

    it('wrappers is required', () => {
      type ContainerRequiredKeys = RequiredKeys<ContainerField>;
      expectTypeOf<'wrappers'>().toMatchTypeOf<ContainerRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (container fields do not have labels)', () => {
      expectTypeOf<ContainerField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<ContainerField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (container fields have no native form element)', () => {
      expectTypeOf<ContainerField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<ContainerField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<ContainerField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<ContainerField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<ContainerField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<ContainerField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<ContainerField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<ContainerField['logic']>().toEqualTypeOf<ContainerLogicConfig[] | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts ContainerAllowedChildren array', () => {
      type FieldsType = ContainerField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly ContainerAllowedChildren[]>();
    });
  });

  describe('wrappers property', () => {
    it('wrappers is a readonly array of WrapperConfig', () => {
      type WrappersType = ContainerField['wrappers'];
      expectTypeOf<WrappersType>().toMatchTypeOf<readonly WrapperConfig[]>();
    });
  });
});

// ============================================================================
// WrapperConfig - Type Tests
// ============================================================================

describe('WrapperConfig', () => {
  it('type resolves to registered wrapper types', () => {
    // FieldRegistryWrappers: 'css' (CssWrapper) + 'row' (RowWrapper)
    expectTypeOf<WrapperConfig['type']>().toEqualTypeOf<'css' | 'row'>();
  });

  it('resolves to CssWrapper for the css type', () => {
    // WrapperConfig<'css'> resolves to CssWrapper via FieldRegistryWrappers lookup
    expectTypeOf<WrapperConfig<'css'>>().toEqualTypeOf<CssWrapper>();
  });

  it('provides type-safe access to wrapper-specific properties', () => {
    const config = {
      type: 'css',
      cssClasses: 'my-class',
    } as const satisfies WrapperConfig;
    expectTypeOf(config.type).toEqualTypeOf<'css'>();
    expectTypeOf(config.cssClasses).toEqualTypeOf<'my-class'>();
  });
});

// ============================================================================
// ContainerField - Generic Type Parameter
// ============================================================================

describe('ContainerField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly ContainerAllowedChildren[];
    type CustomContainerField = ContainerField<CustomFields>;
    expectTypeOf<CustomContainerField['fields']>().toMatchTypeOf<readonly ContainerAllowedChildren[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificContainerField = ContainerField<readonly ContainerAllowedChildren[]>;
    expectTypeOf<SpecificContainerField['type']>().toEqualTypeOf<'container'>();
  });
});

// ============================================================================
// ContainerComponent - Type Extraction
// ============================================================================

describe('ContainerComponent - Type Extraction', () => {
  type TestComponent = ContainerComponent;

  it('should be a valid type', () => {
    expectTypeOf<TestComponent>().not.toBeNever();
  });
});

// ============================================================================
// ContainerField - Usage Tests
// ============================================================================

describe('ContainerField - Usage Tests', () => {
  it('should accept minimal container definition', () => {
    const field = {
      key: 'container1',
      type: 'container',
      fields: [],
      wrappers: [],
    } as const satisfies ContainerField;

    expectTypeOf(field.type).toEqualTypeOf<'container'>();
  });

  it('should accept container with single wrapper config', () => {
    const field = {
      key: 'sectionContainer',
      type: 'container',
      fields: [],
      wrappers: [
        {
          type: 'css',
          cssClasses: 'details-section',
        },
      ],
    } as const satisfies ContainerField;

    expectTypeOf(field.wrappers).not.toBeUndefined();
  });

  it('should accept container with multiple wrapper configs (chaining)', () => {
    const field = {
      key: 'styledSection',
      type: 'container',
      fields: [],
      wrappers: [
        { type: 'css', cssClasses: 'section-wrapper' },
        { type: 'css', cssClasses: 'highlight' },
      ],
    } as const satisfies ContainerField;

    expectTypeOf(field.wrappers).not.toBeUndefined();
  });

  it('should accept container with className', () => {
    const field = {
      key: 'styledContainer',
      type: 'container',
      fields: [],
      wrappers: [],
      className: 'container-wrapper',
    } as const satisfies ContainerField;

    expectTypeOf(field.className).toEqualTypeOf<'container-wrapper'>();
  });

  it('should accept container with disabled state', () => {
    const field = {
      key: 'disabledContainer',
      type: 'container',
      fields: [],
      wrappers: [],
      disabled: true,
    } as const satisfies ContainerField;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
  });

  it('should accept container with hidden state', () => {
    const field = {
      key: 'hiddenContainer',
      type: 'container',
      fields: [],
      wrappers: [],
      hidden: true,
    } as const satisfies ContainerField;

    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });

  it('should accept container with logic configuration', () => {
    const field = {
      key: 'conditionalContainer',
      type: 'container',
      fields: [],
      wrappers: [{ type: 'css', cssClasses: 'conditional-section' }],
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
    } as const satisfies ContainerField;

    expectTypeOf(field.logic).not.toBeUndefined();
  });

  it('should accept container with col sizing', () => {
    const field = {
      key: 'sizedContainer',
      type: 'container',
      fields: [],
      wrappers: [],
      col: 6,
    } as const satisfies ContainerField;

    expectTypeOf(field.col).toEqualTypeOf<6>();
  });
});
