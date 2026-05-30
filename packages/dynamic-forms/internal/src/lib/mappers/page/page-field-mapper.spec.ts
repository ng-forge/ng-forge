import { TestBed } from '@angular/core/testing';
import { pageFieldMapper } from './page-field-mapper';
import { PageField } from '../../definitions';

describe('pageFieldMapper', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should create inputs object with key and field for minimal page field', () => {
    const fieldDef: PageField = {
      key: 'page1',
      type: 'page',
      fields: [],
    };

    const inputsSignal = pageFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key', 'page1');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef: PageField = {
      key: 'page2',
      type: 'page',
      label: 'Page Label',
      className: 'page-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const inputsSignal = pageFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(3);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'page-class');
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: PageField = {
      key: 'formPage',
      type: 'page',
      fields: [
        { key: 'input', type: 'input', label: 'Input' },
        {
          key: 'group',
          type: 'group',
          fields: [{ key: 'nested', type: 'input', label: 'Nested' }],
        } as any,
      ],
    };

    const inputsSignal = pageFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle edge cases (empty fields, validation)', () => {
    const testCases = [
      { key: '', type: 'page' as const, fields: [] },
      {
        key: 'validated',
        type: 'page' as const,
        fields: [],
        validation: { required: true },
      } as any,
      {
        key: 'multiField',
        type: 'page' as const,
        fields: [
          { key: 'f1', type: 'input' as const },
          { key: 'f2', type: 'input' as const },
          { key: 'f3', type: 'input' as const },
        ],
      },
    ];

    testCases.forEach((fieldDef) => {
      const inputsSignal = pageFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });
});
