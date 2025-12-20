import { TestBed } from '@angular/core/testing';
import { groupFieldMapper } from './group-field-mapper';
import { GroupField } from '../../definitions';

describe('groupFieldMapper', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should create inputs object with key and field for minimal group field', () => {
    const fieldDef: GroupField = {
      key: 'testGroup',
      type: 'group',
      fields: [],
    };

    const inputsSignal = groupFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key', 'testGroup');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key and field regardless of additional properties', () => {
    const fieldDef: GroupField = {
      key: 'complexGroup',
      type: 'group',
      label: 'Complex Group',
      className: 'group-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const inputsSignal = groupFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: GroupField = {
      key: 'addressGroup',
      type: 'group',
      fields: [
        { key: 'street', type: 'input', label: 'Street' },
        { key: 'city', type: 'input', label: 'City' },
        {
          key: 'nestedGroup',
          type: 'group',
          fields: [{ key: 'zip', type: 'input', label: 'ZIP' }],
        } as any,
      ],
    };

    const inputsSignal = groupFieldMapper(fieldDef);
    const inputs = inputsSignal(); // Call signal to get inputs
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle edge cases (empty fields, validation)', () => {
    const testCases = [
      { key: '', type: 'group' as const, fields: [] },
      {
        key: 'validated',
        type: 'group' as const,
        fields: [],
        validation: { required: true },
      } as any,
      {
        key: 'conditional',
        type: 'group' as const,
        fields: [{ key: 'f1', type: 'input' as const }],
        conditionals: { show: true },
      } as any,
    ];

    testCases.forEach((fieldDef) => {
      const inputsSignal = groupFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });
});
