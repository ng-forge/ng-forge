/**
 * Exhaustive type tests for StandardSchemaMarker, FormSchema, InferSchemaOutput,
 * AngularSchemaCallback, and isStandardSchemaMarker.
 */
import { expectTypeOf } from 'vitest';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import type { StandardSchemaMarker, FormSchema, InferSchemaOutput, AngularSchemaCallback } from './standard-schema-marker';
import { isStandardSchemaMarker, STANDARD_SCHEMA_KIND } from './standard-schema-marker';

// ============================================================================
// StandardSchemaMarker - Structure Tests
// ============================================================================

describe('StandardSchemaMarker', () => {
  it('should have ɵkind property typed as the STANDARD_SCHEMA_KIND constant', () => {
    expectTypeOf<StandardSchemaMarker['ɵkind']>().toEqualTypeOf<typeof STANDARD_SCHEMA_KIND>();
  });

  it('should have schema property typed as StandardSchemaV1<T>', () => {
    expectTypeOf<StandardSchemaMarker<string>['schema']>().toEqualTypeOf<StandardSchemaV1<string>>();
  });

  it('should default T to unknown', () => {
    expectTypeOf<StandardSchemaMarker['schema']>().toEqualTypeOf<StandardSchemaV1<unknown>>();
  });

  it('should be covariant — specific type assignable to broader type', () => {
    expectTypeOf<StandardSchemaMarker<string>>().toMatchTypeOf<StandardSchemaMarker<unknown>>();
  });

  it('should have exactly ɵkind and schema as keys', () => {
    type ActualKeys = keyof StandardSchemaMarker;
    type ExpectedKeys = 'ɵkind' | 'schema';
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });
});

// ============================================================================
// FormSchema - Union Tests
// ============================================================================

describe('FormSchema', () => {
  it('should be StandardSchemaMarker<T> | AngularSchemaCallback<T>', () => {
    expectTypeOf<FormSchema<string>>().toEqualTypeOf<StandardSchemaMarker<string> | AngularSchemaCallback<string>>();
  });

  it('should accept a StandardSchemaMarker value', () => {
    expectTypeOf<StandardSchemaMarker<string>>().toMatchTypeOf<FormSchema<string>>();
  });

  it('should accept an AngularSchemaCallback value', () => {
    expectTypeOf<AngularSchemaCallback<string>>().toMatchTypeOf<FormSchema<string>>();
  });

  it('should default T to unknown', () => {
    expectTypeOf<FormSchema>().toEqualTypeOf<StandardSchemaMarker<unknown> | AngularSchemaCallback<unknown>>();
  });
});

// ============================================================================
// InferSchemaOutput - Conditional Type Tests
// ============================================================================

describe('InferSchemaOutput', () => {
  it('should extract output type from a StandardSchemaV1 type', () => {
    expectTypeOf<InferSchemaOutput<StandardSchemaV1<string>>>().toEqualTypeOf<string>();
  });

  it('should extract complex output types', () => {
    type User = { name: string; age: number };
    expectTypeOf<InferSchemaOutput<StandardSchemaV1<User>>>().toEqualTypeOf<User>();
  });

  it('should return never for non-schema types', () => {
    expectTypeOf<InferSchemaOutput<string>>().toEqualTypeOf<never>();
    expectTypeOf<InferSchemaOutput<number>>().toEqualTypeOf<never>();
    expectTypeOf<InferSchemaOutput<object>>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// AngularSchemaCallback - Function Type Tests
// ============================================================================

describe('AngularSchemaCallback', () => {
  it('should be a function type', () => {
    expectTypeOf<AngularSchemaCallback>().toBeFunction();
  });

  it('should accept a SchemaPath & SchemaPathTree parameter', () => {
    expectTypeOf<AngularSchemaCallback<string>>().toEqualTypeOf<(path: SchemaPath<string> & SchemaPathTree<string>) => void>();
  });

  it('should return void', () => {
    expectTypeOf<ReturnType<AngularSchemaCallback>>().toEqualTypeOf<void>();
  });
});

// ============================================================================
// isStandardSchemaMarker - Type Guard Tests
// ============================================================================

describe('isStandardSchemaMarker', () => {
  it('should narrow unknown to StandardSchemaMarker', () => {
    const value: unknown = {};
    if (isStandardSchemaMarker(value)) {
      expectTypeOf(value).toEqualTypeOf<StandardSchemaMarker<unknown>>();
    }
  });

  it('should accept unknown input', () => {
    expectTypeOf(isStandardSchemaMarker).parameter(0).toEqualTypeOf<unknown>();
  });

  it('should return boolean', () => {
    expectTypeOf(isStandardSchemaMarker).returns.toEqualTypeOf<boolean>();
  });
});
