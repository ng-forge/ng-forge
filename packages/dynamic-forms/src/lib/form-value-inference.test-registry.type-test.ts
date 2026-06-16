/**
 * Shared registry augmentation for the type-test suite.
 *
 * The `type-test` target compiles every `*.type-test.ts` into one program with no
 * UI adapter in scope, so the value-field leaves (`input`, `checkbox`, ...) are not
 * registered. This file registers minimal stand-ins ONCE as a global module
 * augmentation, so sibling type-tests can author real `FormConfig`s. Declaring the
 * leaves per-file would collide (TS2717: subsequent property declarations must have
 * the same type), hence the single home here.
 *
 * The set is deliberately small and the shapes minimal: every registered leaf
 * enlarges `InferFormValue<RegisteredFieldTypes[]>` (the base-default `TModel`
 * evaluated in `dynamic-form-di.ts` within this shared program), and a broad
 * registry overflows TypeScript's union-complexity limit. Field types that share
 * the generic `Widen<value>` path (textarea/select/radio/...) are intentionally
 * NOT registered — `input` already exercises that path.
 *
 * Excluded from the published build via `tsconfig.lib.json` (`*.type-test.ts`).
 */
import { expectTypeOf } from 'vitest';
import type { RegisteredFieldTypes } from '@ng-forge/dynamic-forms/internal';

export interface TestInputLeaf {
  key: string;
  type: 'input';
  value?: string | number | null;
  required?: boolean;
  nullable?: boolean;
  props?: { type?: string };
  label?: string;
}
export interface TestCheckboxLeaf {
  key: string;
  type: 'checkbox';
  value?: boolean;
  required?: boolean;
}
export interface TestSliderLeaf {
  key: string;
  type: 'slider';
  value?: number;
  required?: boolean;
}
export interface TestToggleLeaf {
  key: string;
  type: 'toggle';
  value?: boolean;
  required?: boolean;
}
export interface TestDatepickerLeaf {
  key: string;
  type: 'datepicker';
  value?: Date | string | null;
  required?: boolean;
}
export interface TestMultiCheckboxLeaf {
  key: string;
  type: 'multi-checkbox';
  value?: readonly unknown[];
  required?: boolean;
}
export interface TestButtonLeaf {
  key: string;
  type: 'submit' | 'button';
  label?: string;
}

// Array-action buttons hold no value and must be excluded from InferFormValue.
export interface TestArrayActionLeaf<T extends string> {
  key: string;
  type: T;
  label?: string;
  arrayKey?: string;
}

declare module '@ng-forge/dynamic-forms/internal' {
  interface FieldRegistryLeaves {
    input: TestInputLeaf;
    checkbox: TestCheckboxLeaf;
    slider: TestSliderLeaf;
    toggle: TestToggleLeaf;
    datepicker: TestDatepickerLeaf;
    'multi-checkbox': TestMultiCheckboxLeaf;
    submit: TestButtonLeaf;
    button: TestButtonLeaf;
    'add-array-item': TestArrayActionLeaf<'add-array-item'>;
    'prepend-array-item': TestArrayActionLeaf<'prepend-array-item'>;
    'insert-array-item': TestArrayActionLeaf<'insert-array-item'>;
    'remove-array-item': TestArrayActionLeaf<'remove-array-item'>;
    'pop-array-item': TestArrayActionLeaf<'pop-array-item'>;
    'shift-array-item': TestArrayActionLeaf<'shift-array-item'>;
  }
}

describe('type-test registry augmentation', () => {
  it('registers the value-field leaves used by sibling type-tests', () => {
    expectTypeOf<'input'>().toExtend<RegisteredFieldTypes['type']>();
    expectTypeOf<'datepicker'>().toExtend<RegisteredFieldTypes['type']>();
  });
});
