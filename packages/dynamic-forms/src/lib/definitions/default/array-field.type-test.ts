/**
 * Exhaustive type tests for ArrayField type.
 */
import { expectTypeOf } from 'vitest';
import type { ArrayField, ArrayComponent, ArrayItemDefinition, ArrayItemTemplate } from './array-field';
import type { RequiredKeys } from '@ng-forge/utils';

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
    it('fields accepts ArrayItemDefinition array (mixed primitive and object items)', () => {
      type FieldsType = ArrayField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly ArrayItemDefinition[]>();
    });

    it('ArrayItemTemplate is an array of fields (for object items)', () => {
      expectTypeOf<ArrayItemTemplate>().toMatchTypeOf<readonly unknown[]>();
    });

    it('ArrayItemDefinition can be single field or array (for primitive or object items)', () => {
      // ArrayItemDefinition = ArrayAllowedChildren | ArrayItemTemplate
      // This allows both primitive (single field) and object (array of fields) items
      type Definition = ArrayItemDefinition;
      expectTypeOf<Definition>().not.toBeNever();
    });
  });
});

// ============================================================================
// ArrayField - Generic Type Parameter
// ============================================================================

describe('ArrayField - Generic Type Parameter', () => {
  it('should accept custom field type array', () => {
    type CustomFields = readonly ArrayItemTemplate[];
    type CustomArrayField = ArrayField<CustomFields>;
    expectTypeOf<CustomArrayField['fields']>().toMatchTypeOf<readonly ArrayItemTemplate[]>();
  });

  it('should preserve field types in generic', () => {
    type SpecificArrayField = ArrayField<readonly ArrayItemTemplate[]>;
    expectTypeOf<SpecificArrayField['type']>().toEqualTypeOf<'array'>();
  });
});

// ============================================================================
// ArrayComponent - Type Extraction
// ============================================================================

describe('ArrayComponent - Type Extraction', () => {
  type TestComponent = ArrayComponent<ArrayItemTemplate[]>;

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

  it('should accept primitive array items (single field per item)', () => {
    const field = {
      key: 'tags',
      type: 'array',
      fields: [
        { key: 'tag', type: 'input', value: 'angular' },
        { key: 'tag', type: 'input', value: 'typescript' },
      ],
    } as const satisfies ArrayField;

    expectTypeOf(field.type).toEqualTypeOf<'array'>();
    expectTypeOf(field.fields).toMatchTypeOf<readonly unknown[]>();
  });

  it('should accept object array items (array of fields per item)', () => {
    const field = {
      key: 'contacts',
      type: 'array',
      fields: [
        [
          { key: 'name', type: 'input', value: 'Alice' },
          { key: 'email', type: 'input', value: 'alice@example.com' },
        ],
      ],
    } as const satisfies ArrayField;

    expectTypeOf(field.type).toEqualTypeOf<'array'>();
  });

  it('should accept heterogeneous array items (mixed primitive and object)', () => {
    const field = {
      key: 'items',
      type: 'array',
      fields: [
        [{ key: 'label', type: 'input', value: 'Structured' }], // Object item
        { key: 'value', type: 'input', value: 'Simple' }, // Primitive item
      ],
    } as const satisfies ArrayField;

    expectTypeOf(field.type).toEqualTypeOf<'array'>();
  });
});
