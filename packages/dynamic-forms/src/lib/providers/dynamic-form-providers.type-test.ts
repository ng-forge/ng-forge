/**
 * Exhaustive type tests for ExtractFieldDefs and ExtractFormValue utility types.
 */
import { expectTypeOf } from 'vitest';
import type { EnvironmentProviders } from '@angular/core';
import type { ExtractFieldDefs, ExtractFormValue } from './dynamic-form-providers';
import type { FieldDef } from '../definitions/base/field-def';

// ============================================================================
// Test Helpers — Phantom-typed result shapes
// ============================================================================

interface InputProps {
  placeholder: string;
}

interface SelectProps {
  options: string[];
}

type InputFieldDef = FieldDef<InputProps> & { type: 'input' };
type SelectFieldDef = FieldDef<SelectProps> & { type: 'select' };

/** Mimics ProvideDynamicFormResult with a single field def type */
type SingleFieldResult = EnvironmentProviders & {
  __fieldDefs?: InputFieldDef;
  __formValue?: { name: string };
};

/** Mimics ProvideDynamicFormResult with a union of field def types */
type UnionFieldResult = EnvironmentProviders & {
  __fieldDefs?: InputFieldDef | SelectFieldDef;
  __formValue?: { name: string; country: string };
};

/** Object without phantom type properties */
type PlainProviders = EnvironmentProviders;

/** Object with only __fieldDefs */
type FieldDefsOnly = EnvironmentProviders & {
  __fieldDefs?: InputFieldDef;
};

/** Object with only __formValue */
type FormValueOnly = EnvironmentProviders & {
  __formValue?: { email: string };
};

// ============================================================================
// ExtractFieldDefs
// ============================================================================

describe('ExtractFieldDefs', () => {
  it('should extract field defs from object with __fieldDefs property', () => {
    type Result = ExtractFieldDefs<SingleFieldResult>;
    // Optional phantom property means the extracted type includes undefined
    expectTypeOf<Result>().toMatchTypeOf<InputFieldDef | undefined>();
    // Non-undefined branch is the field def
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<InputFieldDef>();
  });

  it('should preserve the union of field def types through extraction', () => {
    type Result = ExtractFieldDefs<UnionFieldResult>;
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<InputFieldDef | SelectFieldDef>();
  });

  it('should return never when __fieldDefs is absent', () => {
    expectTypeOf<ExtractFieldDefs<PlainProviders>>().toEqualTypeOf<never>();
  });

  it('should extract field defs even when __formValue is absent', () => {
    type Result = ExtractFieldDefs<FieldDefsOnly>;
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<InputFieldDef>();
  });

  it('should return never for a completely unrelated type', () => {
    expectTypeOf<ExtractFieldDefs<{ unrelated: true }>>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// ExtractFormValue
// ============================================================================

describe('ExtractFormValue', () => {
  it('should extract form value type from object with __formValue property', () => {
    type Result = ExtractFormValue<SingleFieldResult>;
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<{ name: string }>();
  });

  it('should preserve generic parameters through extraction', () => {
    type Result = ExtractFormValue<UnionFieldResult>;
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<{ name: string; country: string }>();
  });

  it('should return never when __formValue is absent', () => {
    expectTypeOf<ExtractFormValue<PlainProviders>>().toEqualTypeOf<never>();
  });

  it('should extract form value even when __fieldDefs is absent', () => {
    type Result = ExtractFormValue<FormValueOnly>;
    expectTypeOf<NonNullable<Result>>().toEqualTypeOf<{ email: string }>();
  });

  it('should return never for a completely unrelated type', () => {
    expectTypeOf<ExtractFormValue<{ unrelated: true }>>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// Combined — Both types work together on ProvideDynamicFormResult shapes
// ============================================================================

describe('ExtractFieldDefs and ExtractFormValue together', () => {
  it('should extract both types from the same result object', () => {
    type Result = UnionFieldResult;

    type Defs = NonNullable<ExtractFieldDefs<Result>>;
    type Value = NonNullable<ExtractFormValue<Result>>;

    expectTypeOf<Defs>().toEqualTypeOf<InputFieldDef | SelectFieldDef>();
    expectTypeOf<Value>().toEqualTypeOf<{ name: string; country: string }>();
  });

  it('should handle result with no phantom properties gracefully', () => {
    type Result = PlainProviders;

    expectTypeOf<ExtractFieldDefs<Result>>().toEqualTypeOf<never>();
    expectTypeOf<ExtractFormValue<Result>>().toEqualTypeOf<never>();
  });
});
