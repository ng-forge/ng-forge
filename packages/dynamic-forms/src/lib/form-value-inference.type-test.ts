/**
 * Enforced type tests for `InferFormValue` / `InferFormModel`.
 *
 * These run under the `type-test` target (vitest `typecheck`), so the assertions
 * are real compile-time checks — unlike the prior `.spec.ts`, whose type-level
 * assertions were never type-checked in CI.
 *
 * Configs use the realistic consumer pattern (`as const satisfies FormConfig`),
 * which makes nested `fields`/`template` readonly. The value-field leaves are
 * registered by the shared augmentation (no UI adapter is in scope here).
 *
 * Nesting follows the real constraints: a `group` may hold leaves/rows/arrays but
 * NOT another group; a `page` may hold groups (see `nesting-constraints.ts`).
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- `const config = {...} satisfies FormConfig`
   fixtures are consumed only via `typeof config` in type-level assertions; the runtime binding
   exists so `satisfies` validates the config shape. This is a typecheck-only file. */
import { expectTypeOf } from 'vitest';
import type { FormConfig, InferFormModel, InferFormValue, RegisteredFieldTypes } from '@ng-forge/dynamic-forms/internal';
import './form-value-inference.test-registry.type-test';

// ============================================================================
// Leaf field value types
// ============================================================================

describe('InferFormValue - leaf value types', () => {
  // Only field types that exercise distinct inference paths are registered here
  // (see the test-registry header). `input` covers the generic `Widen<value>` path
  // shared by textarea/select/radio; `value: null` covers the string fallback used
  // by datepicker and friends.
  it('widens string/number value literals (generic path)', () => {
    const config = {
      fields: [
        { key: 'str', type: 'input', value: '' },
        { key: 'num', type: 'input', value: 0, props: { type: 'number' } },
        { key: 'nul', type: 'input', value: null },
      ],
    } as const satisfies FormConfig;
    type V = InferFormValue<typeof config>;
    expectTypeOf<V['str']>().not.toBeAny();
    expectTypeOf<V['str']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<V['num']>().toEqualTypeOf<number | undefined>();
    // value: null with no other signal falls back to string (same path as datepicker value:null).
    expectTypeOf<V['nul']>().toEqualTypeOf<string | undefined>();
  });

  it('special-cases numeric and boolean field types', () => {
    const config = {
      fields: [
        { key: 'slide', type: 'slider', value: 5 },
        { key: 'check', type: 'checkbox', value: false },
        { key: 'tog', type: 'toggle', value: false },
        { key: 'date', type: 'datepicker', value: null },
      ],
    } as const satisfies FormConfig;
    type V = InferFormValue<typeof config>;
    expectTypeOf<V['slide']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<V['check']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<V['tog']>().toEqualTypeOf<boolean | undefined>();
    // datepicker is not special-cased; value:null falls back to string.
    expectTypeOf<V['date']>().toEqualTypeOf<string | undefined>();
  });

  it('infers multi-checkbox with value:[] as never[] (known empty-literal quirk)', () => {
    // An empty array literal widens to `never[]`; a seeded `value: ['a']` would widen to string[].
    const config = { fields: [{ key: 'tags', type: 'multi-checkbox', value: [] }] } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof config>['tags']>().toEqualTypeOf<never[] | undefined>();
  });
});

// ============================================================================
// Required vs optional (and the hidden special case)
// ============================================================================

describe('InferFormValue - optionality', () => {
  const config = {
    fields: [
      { key: 'req', type: 'input', value: '', required: true },
      { key: 'opt', type: 'input', value: '' },
      { key: 'reqCheck', type: 'checkbox', value: false, required: true },
      { key: 'secret', type: 'hidden', value: 'x' },
    ],
  } as const satisfies FormConfig;
  type V = InferFormValue<typeof config>;

  it('required fields are non-optional', () => {
    expectTypeOf<V['req']>().toEqualTypeOf<string>();
    expectTypeOf<V['reqCheck']>().toEqualTypeOf<boolean>();
  });

  it('non-required fields are optional', () => {
    expectTypeOf<V['opt']>().toEqualTypeOf<string | undefined>();
  });

  it('hidden fields are never optional', () => {
    expectTypeOf<V['secret']>().toEqualTypeOf<string>();
  });
});

// ============================================================================
// Non-value fields are excluded from the model
// ============================================================================

describe('InferFormValue - excluded fields', () => {
  const config = {
    fields: [
      { key: 'keep', type: 'input', value: '' },
      { key: 'blurb', type: 'text', label: 'hello' },
      { key: 'go', type: 'submit', label: 'Go' },
      { key: 'act', type: 'button', label: 'Act' },
    ],
  } as const satisfies FormConfig;

  it('text and button fields contribute no keys', () => {
    expectTypeOf<keyof InferFormValue<typeof config>>().toEqualTypeOf<'keep'>();
  });
});

// ============================================================================
// Groups (group -> leaves / group -> array). Group-in-group is disallowed.
// ============================================================================

describe('InferFormValue - groups', () => {
  const config = {
    fields: [
      { key: 'top', type: 'input', value: '', required: true },
      {
        key: 'address',
        type: 'group',
        fields: [
          { key: 'city', type: 'input', value: '', required: true },
          { key: 'zip', type: 'input', value: '' },
        ],
      },
    ],
  } as const satisfies FormConfig;
  type V = InferFormValue<typeof config>;

  it('nests group values under the group key (regression: readonly nested fields)', () => {
    // Before the readonly fix, an `as const` config inferred group children as `unknown`.
    expectTypeOf<V['address']>().not.toBeAny();
    expectTypeOf<V['address']['city']>().toEqualTypeOf<string>();
    expectTypeOf<V['address']['zip']>().toEqualTypeOf<string | undefined>();
  });
});

// ============================================================================
// Pages and rows flatten; page -> group nests (deep readonly regression)
// ============================================================================

describe('InferFormValue - pages, rows, and page->group nesting', () => {
  const config = {
    fields: [
      {
        key: 'page1',
        type: 'page',
        fields: [
          { key: 'firstName', type: 'input', value: '', required: true },
          { key: 'row1', type: 'row', fields: [{ key: 'email', type: 'input', value: '', required: true }] },
          {
            key: 'demographics',
            type: 'group',
            fields: [{ key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true }],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;
  type V = InferFormValue<typeof config>;

  it('hoists page and row children to the top level', () => {
    expectTypeOf<V['firstName']>().toEqualTypeOf<string>();
    expectTypeOf<V['email']>().toEqualTypeOf<string>();
  });

  it('keeps a page->group nested value typed (regression: readonly nested fields)', () => {
    expectTypeOf<V['demographics']>().not.toBeAny();
    expectTypeOf<V['demographics']['age']>().toEqualTypeOf<number>();
  });
});

// ============================================================================
// Arrays
// ============================================================================

describe('InferFormValue - arrays', () => {
  it('simplified array, single-field template + value -> primitive[]', () => {
    const config = {
      fields: [{ key: 'tags', type: 'array', template: { key: 'value', type: 'input', label: 'Tag' }, value: ['a', 'b'] }],
    } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof config>['tags']>().toEqualTypeOf<string[]>();
  });

  it('simplified array, single-field template (no value) -> primitive[]', () => {
    const config = {
      fields: [{ key: 'tags', type: 'array', template: { key: 'value', type: 'input', label: 'Tag' } }],
    } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof config>['tags']>().toEqualTypeOf<string[]>();
  });

  it('simplified array, object template (no value) -> object[]', () => {
    const config = {
      fields: [
        {
          key: 'contacts',
          type: 'array',
          template: [
            { key: 'name', type: 'input', label: 'Name' },
            { key: 'phone', type: 'input', label: 'Phone' },
          ],
        },
      ],
    } as const satisfies FormConfig;
    type Contacts = InferFormValue<typeof config>['contacts'];
    expectTypeOf<Contacts>().toBeArray();
    expectTypeOf<Contacts[number]['name']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Contacts[number]['phone']>().toEqualTypeOf<string | undefined>();
  });

  it('full-API array (fields) -> unknown[] (known limitation: item type not inferred)', () => {
    const config = {
      fields: [
        {
          key: 'emails',
          type: 'array',
          fields: [
            [
              { key: 'address', type: 'input', value: '' },
              { key: 'primary', type: 'checkbox', value: false },
            ],
          ],
        },
      ],
    } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof config>['emails']>().toEqualTypeOf<unknown[]>();
  });

  it('array nested inside a group', () => {
    const config = {
      fields: [
        {
          key: 'company',
          type: 'group',
          fields: [
            { key: 'name', type: 'input', value: '', required: true },
            { key: 'staff', type: 'array', template: { key: 'value', type: 'input', label: 'Name' } },
          ],
        },
      ],
    } as const satisfies FormConfig;
    type V = InferFormValue<typeof config>;
    expectTypeOf<V['company']['name']>().toEqualTypeOf<string>();
    expectTypeOf<V['company']['staff']>().toEqualTypeOf<string[]>();
  });
});

// ============================================================================
// Nullable widening
// ============================================================================

describe('InferFormValue - nullable', () => {
  it('widens to | null when nullable: true', () => {
    const config = {
      fields: [
        { key: 'a', type: 'input', value: '' },
        { key: 'b', type: 'input', nullable: true, value: null },
      ],
    } as const satisfies FormConfig;
    type V = InferFormValue<typeof config>;
    expectTypeOf<V['a']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<V['b']>().toEqualTypeOf<string | null | undefined>();
  });

  it('widens nullable fields inside a group', () => {
    const config = {
      fields: [
        {
          key: 'profile',
          type: 'group',
          fields: [{ key: 'nickname', type: 'input', nullable: true, value: null }],
        },
      ],
    } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof config>['profile']['nickname']>().toEqualTypeOf<string | null | undefined>();
  });
});

// ============================================================================
// InferFormModel (the default TModel) - no index signature, bound satisfied
// ============================================================================

describe('InferFormModel', () => {
  const config = {
    fields: [
      { key: 'email', type: 'input', value: '', required: true },
      { key: 'nickname', type: 'input', value: '' },
      { key: 'address', type: 'group', fields: [{ key: 'city', type: 'input', value: '', required: true }] },
    ],
  } as const satisfies FormConfig;
  type Model = InferFormModel<typeof config>;

  it('equals InferFormValue (no widening) for a concrete config', () => {
    expectTypeOf<Model>().toEqualTypeOf<InferFormValue<typeof config>>();
  });

  it('has no string index signature (typo-safety)', () => {
    type HasIndexSignature = string extends keyof Model ? true : false;
    expectTypeOf<HasIndexSignature>().toEqualTypeOf<false>();
    expectTypeOf<keyof Model>().toEqualTypeOf<'email' | 'nickname' | 'address'>();
    expectTypeOf<Model>().not.toHaveProperty('totallyMadeUp');
  });

  it('falls back to Record<string, unknown> for an empty config (InferFormValue is unknown there)', () => {
    const empty = { fields: [] } as const satisfies FormConfig;
    expectTypeOf<InferFormValue<typeof empty>>().toEqualTypeOf<unknown>();
    expectTypeOf<InferFormModel<typeof empty>>().toEqualTypeOf<Record<string, unknown>>();
  });

  it('always satisfies the extends-Record bound (base default included)', () => {
    type ModelOk = Model extends Record<string, unknown> ? true : false;
    type BaseOk = InferFormModel<RegisteredFieldTypes[]> extends Record<string, unknown> ? true : false;
    expectTypeOf<ModelOk>().toEqualTypeOf<true>();
    expectTypeOf<BaseOk>().toEqualTypeOf<true>();
  });
});
