/**
 * Type tests for the consumer-facing inference surface of `DynamicForm`.
 *
 * These guard the "required -> non-optional, typo-safe" story end to end:
 *  - `submitted` emits the fully-inferred model (required fields stay required,
 *    it is NOT widened to `Partial`).
 *  - the model carries NO `Record<string, unknown>` index signature, so typo'd
 *    key access is a compile error instead of silently resolving to `unknown`.
 *  - `value` stays `Partial` (it is a two-way input that accepts partial seed
 *    values) but is still typo-safe for the same reason.
 *
 * Regression coverage for the `InferFormValue<TFields> & Record<string, unknown>`
 * default that previously (a) over-widened `submitted` to `Partial<TModel>` and
 * (b) grafted an index signature onto the model.
 *
 * The `type-test` target compiles in isolation (no UI adapter in scope), so the
 * value-field leaves are registered here the same way an adapter would augment
 * them at the consumer's call site.
 */
import { expectTypeOf } from 'vitest';
import type { ModelSignal, OutputRef } from '@angular/core';
import { DynamicForm } from './dynamic-form.component';

interface TestInputLeaf {
  key: string;
  type: 'input';
  value?: string | number;
  required?: boolean;
  props?: { type?: string };
  label?: string;
  nullable?: boolean;
}
interface TestCheckboxLeaf {
  key: string;
  type: 'checkbox';
  value?: boolean;
  required?: boolean;
  label?: string;
  nullable?: boolean;
}
interface TestSubmitLeaf {
  key: string;
  type: 'submit';
  label?: string;
}

declare module '@ng-forge/dynamic-forms/internal' {
  interface FieldRegistryLeaves {
    input: TestInputLeaf;
    checkbox: TestCheckboxLeaf;
    submit: TestSubmitLeaf;
  }
}

// Representative config as mutable type literals (DynamicForm's TFields constraint
// is the mutable `RegisteredFieldTypes[]`). A named alias for the group children
// keeps the nested tuple from being inferred too loosely.
type AddressFields = [{ key: 'city'; type: 'input'; value: ''; required: true }, { key: 'zip'; type: 'input'; value: '' }];

type Fields = [
  { key: 'email'; type: 'input'; value: ''; required: true },
  { key: 'age'; type: 'input'; value: 0; props: { type: 'number' }; required: true },
  { key: 'nickname'; type: 'input'; value: '' },
  { key: 'subscribe'; type: 'checkbox'; value: false },
  { key: 'address'; type: 'group'; fields: AddressFields },
  { key: 'submit'; type: 'submit'; label: 'Go' },
];

// A form typed exactly as a consumer's `<form [dynamic-form]="config">` would be;
// TModel is left to its default (the chain under test).
type Form = DynamicForm<Fields>;

// Payload of the `(submitted)` output and the read type of the `value` model.
type Submitted = Form['submitted'] extends OutputRef<infer T> ? T : never;
type ValueModel = Form['value'] extends ModelSignal<infer T> ? T : never;

// ============================================================================
// submitted: fully-inferred model, required-aware (NOT Partial)
// ============================================================================

describe('DynamicForm submitted output inference', () => {
  it('keeps required fields non-optional', () => {
    expectTypeOf<Submitted['email']>().toEqualTypeOf<string>();
    expectTypeOf<Submitted['age']>().toEqualTypeOf<number>();
  });

  it('marks non-required fields optional', () => {
    expectTypeOf<Submitted['nickname']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Submitted['subscribe']>().toEqualTypeOf<boolean | undefined>();
  });

  it('preserves required-ness through nested groups', () => {
    expectTypeOf<Submitted['address']['city']>().toEqualTypeOf<string>();
    expectTypeOf<Submitted['address']['zip']>().toEqualTypeOf<string | undefined>();
  });

  it('exposes exactly the value-bearing keys (submit button excluded)', () => {
    expectTypeOf<keyof Submitted>().toEqualTypeOf<'email' | 'age' | 'nickname' | 'subscribe' | 'address'>();
  });

  it('is not widened to Partial', () => {
    // A Partial would make `email` `string | undefined`; the full model keeps it `string`.
    expectTypeOf<Submitted>().not.toEqualTypeOf<Partial<Submitted>>();
  });
});

// ============================================================================
// Typo-safety: the model must NOT carry an index signature
// ============================================================================

describe('DynamicForm model typo-safety', () => {
  it('has no `Record<string, unknown>` index signature on submitted', () => {
    // With an index signature, `string extends keyof Submitted` would be true.
    type NoIndexSignature = string extends keyof Submitted ? false : true;
    expectTypeOf<NoIndexSignature>().toEqualTypeOf<true>();
  });

  it('makes a typo a compile error rather than `unknown`', () => {
    // An index signature would make every string key "present"; without one, a
    // typo'd key is genuinely absent.
    expectTypeOf<Submitted>().not.toHaveProperty('totallyMadeUp');
  });

  it('keeps the two-way `value` input typo-safe as well', () => {
    type NoIndexSignature = string extends keyof NonNullable<ValueModel> ? false : true;
    expectTypeOf<NoIndexSignature>().toEqualTypeOf<true>();
    expectTypeOf<NonNullable<ValueModel>>().not.toHaveProperty('totallyMadeUp');
  });
});

// ============================================================================
// value: Partial (accepts partial seed values) but built from the same model
// ============================================================================

describe('DynamicForm value model', () => {
  it('is a Partial of the inferred model, plus undefined', () => {
    expectTypeOf<ValueModel>().toEqualTypeOf<Partial<Submitted> | undefined>();
  });

  it('relaxes required fields for two-way seeding', () => {
    expectTypeOf<NonNullable<ValueModel>['email']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<NonNullable<ValueModel>['age']>().toEqualTypeOf<number | undefined>();
  });
});
