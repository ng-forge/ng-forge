/**
 * Exhaustive type tests for field registry types:
 * ExtractField, NarrowField, NarrowFields, ContainerFieldTypes,
 * LeafFieldTypes, RegisteredFieldTypes, AvailableFieldTypes.
 */
import { expectTypeOf } from 'vitest';
import type {
  AvailableFieldTypes,
  ContainerFieldTypes,
  ExtractField,
  LeafFieldTypes,
  NarrowField,
  NarrowFields,
  RegisteredFieldTypes,
} from './field-registry';
import type { PageField } from '../../definitions/default/page-field';
import type { RowField } from '../../definitions/default/row-field';
import type { GroupField } from '../../definitions/default/group-field';
import type { ArrayField, SimplifiedArrayField } from '../../definitions/default/array-field';
import type { TextField } from '../../definitions/default/text-field';
import type { HiddenField } from '../../definitions/default/hidden-field';

// ============================================================================
// ExtractField
// ============================================================================

describe('ExtractField', () => {
  it('should extract PageField for "page"', () => {
    expectTypeOf<ExtractField<'page'>>().toEqualTypeOf<PageField>();
  });

  it('should extract ArrayField | SimplifiedArrayField for "array"', () => {
    expectTypeOf<ExtractField<'array'>>().toEqualTypeOf<ArrayField | SimplifiedArrayField>();
  });

  it('should extract TextField for "text"', () => {
    expectTypeOf<ExtractField<'text'>>().toEqualTypeOf<TextField>();
  });

  it('should extract HiddenField for "hidden"', () => {
    expectTypeOf<ExtractField<'hidden'>>().toEqualTypeOf<HiddenField>();
  });

  it('should extract RowField for "row"', () => {
    expectTypeOf<ExtractField<'row'>>().toEqualTypeOf<RowField>();
  });

  it('should extract GroupField for "group"', () => {
    expectTypeOf<ExtractField<'group'>>().toEqualTypeOf<GroupField>();
  });
});

// ============================================================================
// NarrowField
// ============================================================================

describe('NarrowField', () => {
  it('should narrow { type: "page" } to PageField', () => {
    expectTypeOf<NarrowField<{ type: 'page' }>>().toEqualTypeOf<PageField>();
  });

  it('should narrow { type: "text" } to TextField', () => {
    expectTypeOf<NarrowField<{ type: 'text' }>>().toEqualTypeOf<TextField>();
  });

  it('should distribute over RegisteredFieldTypes union', () => {
    expectTypeOf<NarrowField<RegisteredFieldTypes>>().toEqualTypeOf<RegisteredFieldTypes>();
  });
});

// ============================================================================
// NarrowFields
// ============================================================================

describe('NarrowFields', () => {
  it('should be readonly NarrowField<RegisteredFieldTypes>[]', () => {
    expectTypeOf<NarrowFields>().toEqualTypeOf<readonly NarrowField<RegisteredFieldTypes>[]>();
  });
});

// ============================================================================
// ContainerFieldTypes
// ============================================================================

describe('ContainerFieldTypes', () => {
  it('should be union of PageField | RowField | GroupField | ArrayField | SimplifiedArrayField', () => {
    expectTypeOf<ContainerFieldTypes>().toEqualTypeOf<PageField | RowField | GroupField | ArrayField | SimplifiedArrayField>();
  });
});

// ============================================================================
// LeafFieldTypes
// ============================================================================

describe('LeafFieldTypes', () => {
  it('should be union of TextField | HiddenField', () => {
    expectTypeOf<LeafFieldTypes>().toEqualTypeOf<TextField | HiddenField>();
  });
});

// ============================================================================
// RegisteredFieldTypes
// ============================================================================

describe('RegisteredFieldTypes', () => {
  it('should be ContainerFieldTypes | LeafFieldTypes', () => {
    expectTypeOf<RegisteredFieldTypes>().toEqualTypeOf<ContainerFieldTypes | LeafFieldTypes>();
  });
});

// ============================================================================
// AvailableFieldTypes
// ============================================================================

describe('AvailableFieldTypes', () => {
  it('should include all registered type names', () => {
    expectTypeOf<AvailableFieldTypes>().toEqualTypeOf<'page' | 'row' | 'group' | 'array' | 'text' | 'hidden'>();
  });
});
