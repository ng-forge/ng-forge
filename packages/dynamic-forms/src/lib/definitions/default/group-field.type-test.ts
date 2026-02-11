/**
 * Exhaustive type tests for GroupField type.
 */
import { expectTypeOf } from 'vitest';
import type { GroupField, GroupComponent } from './group-field';
import type { ContainerLogicConfig } from '../base/container-logic-config';
import type { GroupAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// GroupField - Whitelist Test
// ============================================================================

describe('GroupField - Exhaustive Whitelist', () => {
  // GroupField extends FieldDef<never> and adds: fields, label?: never, meta?: never
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
    | 'logic';

  type ActualKeys = keyof GroupField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<GroupField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<GroupField['type']>().toEqualTypeOf<'group'>();
    });

    it('fields is required', () => {
      type GroupRequiredKeys = RequiredKeys<GroupField>;
      expectTypeOf<'fields'>().toMatchTypeOf<GroupRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (groups do not have labels)', () => {
      expectTypeOf<GroupField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<GroupField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (groups have no native form element)', () => {
      expectTypeOf<GroupField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<GroupField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<GroupField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<GroupField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<GroupField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<GroupField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<GroupField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<GroupField['logic']>().toEqualTypeOf<ContainerLogicConfig[] | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts GroupAllowedChildren array', () => {
      type FieldsType = GroupField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly GroupAllowedChildren[]>();
    });
  });
});

// ============================================================================
// GroupField - Generic Type Parameter
// ============================================================================

describe('GroupField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly GroupAllowedChildren[];
    type CustomGroupField = GroupField<CustomFields>;
    expectTypeOf<CustomGroupField['fields']>().toMatchTypeOf<readonly GroupAllowedChildren[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificGroupField = GroupField<readonly GroupAllowedChildren[]>;
    expectTypeOf<SpecificGroupField['type']>().toEqualTypeOf<'group'>();
  });
});

// ============================================================================
// GroupComponent - Type Extraction
// ============================================================================

describe('GroupComponent - Type Extraction', () => {
  type TestComponent = GroupComponent<GroupAllowedChildren[]>;

  it('should be a valid type', () => {
    expectTypeOf<TestComponent>().not.toBeNever();
  });
});

// ============================================================================
// GroupField - Usage Tests
// ============================================================================

describe('GroupField - Usage Tests', () => {
  it('should accept minimal group definition', () => {
    const field = {
      key: 'address',
      type: 'group',
      fields: [],
    } as const satisfies GroupField;

    expectTypeOf(field.type).toEqualTypeOf<'group'>();
  });

  it('should accept group with className', () => {
    const field = {
      key: 'contactInfo',
      type: 'group',
      fields: [],
      className: 'contact-group',
    } as const satisfies GroupField;

    expectTypeOf(field.className).toEqualTypeOf<'contact-group'>();
  });

  it('should accept group with disabled state', () => {
    const field = {
      key: 'disabledGroup',
      type: 'group',
      fields: [],
      disabled: true,
    } as const satisfies GroupField;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
  });

  it('should accept group with hidden state', () => {
    const field = {
      key: 'hiddenGroup',
      type: 'group',
      fields: [],
      hidden: true,
    } as const satisfies GroupField;

    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });

  it('should accept group with logic configuration', () => {
    const field = {
      key: 'conditionalGroup',
      type: 'group',
      fields: [],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
      ],
    } as const satisfies GroupField;

    expectTypeOf(field.logic).not.toBeUndefined();
  });

  it('should accept group with col sizing', () => {
    const field = {
      key: 'sizedGroup',
      type: 'group',
      fields: [],
      col: 6,
    } as const satisfies GroupField;

    expectTypeOf(field.col).toEqualTypeOf<6>();
  });
});
