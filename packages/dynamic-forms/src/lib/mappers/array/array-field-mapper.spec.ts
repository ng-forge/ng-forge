import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { arrayFieldMapper } from './array-field-mapper';
import { ArrayField } from '../../definitions';

describe('arrayFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  it('should create 2 bindings (key + field) for minimal array field', () => {
    const fieldDef: ArrayField = {
      key: 'items',
      type: 'array',
      items: { key: 'item', type: 'input' },
    };

    const bindings = arrayFieldMapper(fieldDef);

    expect(bindings).toHaveLength(2);
  });

  it('should create 2 bindings regardless of additional properties', () => {
    const fieldDef: ArrayField = {
      key: 'complexArray',
      type: 'array',
      label: 'Complex Array',
      className: 'array-class',
      tabIndex: 1,
      items: { key: 'item', type: 'input' },
      props: { minItems: 1, maxItems: 10 },
    };

    const bindings = arrayFieldMapper(fieldDef);

    expect(bindings).toHaveLength(2);
  });

  it('should handle nested array items', () => {
    const fieldDef: ArrayField = {
      key: 'nestedArray',
      type: 'array',
      items: {
        key: 'subArray',
        type: 'array',
        items: { key: 'item', type: 'input' },
      },
    };

    const bindings = arrayFieldMapper(fieldDef);

    expect(bindings).toHaveLength(2);
  });

  it('should handle edge cases (empty key, null values)', () => {
    const testCases = [
      { key: '', type: 'array' as const, items: { key: 'item', type: 'input' as const } },
      {
        key: 'arr',
        type: 'array' as const,
        className: null as any,
        items: { key: 'item', type: 'input' as const },
      },
      {
        key: 'arr',
        type: 'array' as const,
        props: {},
        items: { key: 'item', type: 'input' as const },
      },
    ];

    testCases.forEach((fieldDef) => {
      const bindings = arrayFieldMapper(fieldDef);
      expect(bindings).toHaveLength(2);
    });
  });
});
