import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { rowFieldMapper } from './row-field-mapper';
import { RowField } from '../../definitions';

describe('rowFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  it('should create 2 bindings (key + field) for minimal row field', () => {
    const fieldDef: RowField = {
      key: 'testRow',
      type: 'row',
      fields: [],
    };

    const bindings = rowFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should create 2 bindings regardless of additional properties', () => {
    const fieldDef: RowField = {
      key: 'complexRow',
      type: 'row',
      label: 'Complex Row',
      className: 'row-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const bindings = rowFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: RowField = {
      key: 'mixedRow',
      type: 'row',
      fields: [
        { key: 'input', type: 'input', label: 'Input' },
        { key: 'select', type: 'select', label: 'Select', props: { options: [] } } as any,
        {
          key: 'group',
          type: 'group',
          fields: [{ key: 'nested', type: 'input', label: 'Nested' }],
        } as any,
      ],
    };

    const bindings = rowFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle edge cases (empty fields, complex layouts)', () => {
    const testCases = [
      { key: '', type: 'row' as const, fields: [] },
      {
        key: 'responsive',
        type: 'row' as const,
        fields: [
          { key: 'f1', type: 'input' as const, col: { span: 6 } } as any,
          { key: 'f2', type: 'input' as const, col: { span: 6 } } as any,
        ],
      },
      {
        key: 'validated',
        type: 'row' as const,
        fields: [],
        validation: { required: true },
      } as any,
    ];

    testCases.forEach((fieldDef) => {
      const bindings = rowFieldMapper(fieldDef);
      expect(bindings).toHaveLength(2);
    });
  });
});
