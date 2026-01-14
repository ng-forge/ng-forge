import { TestBed } from '@angular/core/testing';
import { rowFieldMapper } from './row-field-mapper';
import { RowField } from '../../definitions';

describe('rowFieldMapper', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should create inputs object with key and field for minimal row field', () => {
    const fieldDef: RowField = {
      key: 'testRow',
      type: 'row',
      fields: [],
    };

    const inputsSignal = rowFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call the signal to get the actual inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key', 'testRow');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef: RowField = {
      key: 'complexRow',
      type: 'row',
      label: 'Complex Row',
      className: 'row-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const inputsSignal = rowFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call the signal to get the actual inputs
    expect(Object.keys(inputs)).toHaveLength(3);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'row-class');
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

    const inputsSignal = rowFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call the signal to get the actual inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
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
      const inputsSignal = rowFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call the signal to get the actual inputs
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });
});
