/**
 * Exhaustive type tests for ArrayField type.
 */
import { expectTypeOf } from 'vitest';
import type { ArrayField, ArrayComponent } from './array-field';
import type { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/testing';

// ============================================================================
// ArrayField - Whitelist Test
// ============================================================================

describe('ArrayField - Exhaustive Whitelist', () => {
  // ArrayField extends FieldDef<never> and adds: fields, label?: never, meta?: never
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
    | 'fields';

  type ActualKeys = keyof ArrayField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<ArrayField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<ArrayField['type']>().toEqualTypeOf<'array'>();
    });

    it('fields is required', () => {
      type ArrayRequiredKeys = RequiredKeys<ArrayField>;
      expectTypeOf<'fields'>().toMatchTypeOf<ArrayRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (arrays do not have labels)', () => {
      expectTypeOf<ArrayField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<ArrayField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (arrays have no native form element)', () => {
      expectTypeOf<ArrayField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<ArrayField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<ArrayField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<ArrayField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<ArrayField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<ArrayField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<ArrayField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts ArrayAllowedChildren array', () => {
      type FieldsType = ArrayField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly ArrayAllowedChildren[]>();
    });
  });
});

// ============================================================================
// ArrayField - Generic Type Parameter
// ============================================================================

describe('ArrayField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly ArrayAllowedChildren[];
    type CustomArrayField = ArrayField<CustomFields>;
    expectTypeOf<CustomArrayField['fields']>().toMatchTypeOf<readonly ArrayAllowedChildren[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificArrayField = ArrayField<readonly ArrayAllowedChildren[]>;
    expectTypeOf<SpecificArrayField['type']>().toEqualTypeOf<'array'>();
  });
});

// ============================================================================
// ArrayComponent - Type Extraction
// ============================================================================

describe('ArrayComponent - Type Extraction', () => {
  type TestComponent = ArrayComponent<ArrayAllowedChildren[]>;

  it('should be a valid type', () => {
    expectTypeOf<TestComponent>().not.toBeNever();
  });
});

// ============================================================================
// ArrayField - Usage Tests
// ============================================================================

describe('ArrayField - Usage Tests', () => {
  it('should accept minimal array definition', () => {
    const field = {
      key: 'items',
      type: 'array',
      fields: [],
    } as const satisfies ArrayField;

    expectTypeOf(field.type).toEqualTypeOf<'array'>();
  });

  it('should accept array with className', () => {
    const field = {
      key: 'tags',
      type: 'array',
      fields: [],
      className: 'tags-container',
    } as const satisfies ArrayField;

    expectTypeOf(field.className).toEqualTypeOf<'tags-container'>();
  });

  it('should accept array with disabled state', () => {
    const field = {
      key: 'disabledArray',
      type: 'array',
      fields: [],
      disabled: true,
    } as const satisfies ArrayField;

    expectTypeOf(field.disabled).toEqualTypeOf<true>();
  });

  it('should accept array with hidden state', () => {
    const field = {
      key: 'hiddenArray',
      type: 'array',
      fields: [],
      hidden: true,
    } as const satisfies ArrayField;

    expectTypeOf(field.hidden).toEqualTypeOf<true>();
  });
});
