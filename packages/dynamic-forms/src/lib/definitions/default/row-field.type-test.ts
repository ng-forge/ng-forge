/**
 * Exhaustive type tests for RowField type.
 */
import { expectTypeOf } from 'vitest';
import type { RowField, RowComponent } from './row-field';
import type { ContainerLogicConfig } from '../base/container-logic-config';
import type { RowAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// RowField - Whitelist Test
// ============================================================================

describe('RowField - Exhaustive Whitelist', () => {
  // RowField extends FieldDef<never> and adds: fields, label?: never, meta?: never
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

  type ActualKeys = keyof RowField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<RowField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<RowField['type']>().toEqualTypeOf<'row'>();
    });

    it('fields is required', () => {
      type RowRequiredKeys = RequiredKeys<RowField>;
      expectTypeOf<'fields'>().toMatchTypeOf<RowRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (rows do not have labels)', () => {
      expectTypeOf<RowField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<RowField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (rows have no native form element)', () => {
      expectTypeOf<RowField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<RowField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<RowField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<RowField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<RowField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<RowField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<RowField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<RowField['logic']>().toEqualTypeOf<ContainerLogicConfig[] | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts RowAllowedChildren array', () => {
      type FieldsType = RowField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly RowAllowedChildren[]>();
    });
  });
});

// ============================================================================
// RowField - Generic Type Parameter
// ============================================================================

describe('RowField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly RowAllowedChildren[];
    type CustomRowField = RowField<CustomFields>;
    expectTypeOf<CustomRowField['fields']>().toMatchTypeOf<readonly RowAllowedChildren[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificRowField = RowField<readonly RowAllowedChildren[]>;
    expectTypeOf<SpecificRowField['type']>().toEqualTypeOf<'row'>();
  });
});

// ============================================================================
// RowComponent - Type Extraction
// ============================================================================

describe('RowComponent - Type Extraction', () => {
  type TestComponent = RowComponent;

  it('should be a valid type', () => {
    expectTypeOf<TestComponent>().not.toBeNever();
  });
});

// ============================================================================
// RowField - Usage Tests
// ============================================================================

describe('RowField - Usage Tests', () => {
  it('should accept minimal row definition', () => {
    const field = {
      key: 'row1',
      type: 'row',
      fields: [],
    } as const satisfies RowField;

    expectTypeOf(field.type).toEqualTypeOf<'row'>();
  });

  it('should accept row with className', () => {
    const field = {
      key: 'styledRow',
      type: 'row',
      fields: [],
      className: 'row-container',
    } as const satisfies RowField;

    expectTypeOf(field.className).toEqualTypeOf<'row-container'>();
  });

  it('should accept row with disabled state', () => {
    const field = {
      key: 'disabledRow',
      type: 'row',
      fields: [],
      disabled: true,
    } as const satisfies RowField;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
  });

  it('should accept row with hidden state', () => {
    const field = {
      key: 'hiddenRow',
      type: 'row',
      fields: [],
      hidden: true,
    } as const satisfies RowField;

    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });

  it('should accept row with logic configuration', () => {
    const field = {
      key: 'conditionalRow',
      type: 'row',
      fields: [],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'enableAdvanced',
            operator: 'equals',
            value: false,
          },
        },
      ],
    } as const satisfies RowField;

    expectTypeOf(field.logic).not.toBeUndefined();
  });

  it('should accept row with col sizing', () => {
    const field = {
      key: 'sizedRow',
      type: 'row',
      fields: [],
      col: 12,
    } as const satisfies RowField;

    expectTypeOf(field.col).toEqualTypeOf<12>();
  });
});
