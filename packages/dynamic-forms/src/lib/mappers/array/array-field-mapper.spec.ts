import { arrayFieldMapper } from './array-field-mapper';
import { ArrayField } from '../../definitions/default/array-field';

describe('arrayFieldMapper', () => {
  it('should create inputs object with key and field for minimal array field', () => {
    const fieldDef: ArrayField = {
      key: 'items',
      type: 'array',
      fields: [{ key: 'item', type: 'input' }],
    };

    const inputsSignal = arrayFieldMapper(fieldDef);
    const inputs = inputsSignal();
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key', 'items');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key and field regardless of additional properties', () => {
    const fieldDef: ArrayField = {
      key: 'complexArray',
      type: 'array',
      className: 'array-class',
      tabIndex: 1,
      fields: [{ key: 'item', type: 'input' }],
    };

    const inputsSignal = arrayFieldMapper(fieldDef);
    const inputs = inputsSignal();
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle group fields for object arrays', () => {
    const fieldDef: ArrayField = {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'contact',
          type: 'group',
          fields: [
            { key: 'name', type: 'input' },
            { key: 'email', type: 'input' },
          ],
        },
      ],
    };

    const inputsSignal = arrayFieldMapper(fieldDef);
    const inputs = inputsSignal();
    expect(Object.keys(inputs)).toHaveLength(2);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle edge cases (empty key, null values)', () => {
    const testCases: ArrayField[] = [
      { key: '', type: 'array', fields: [{ key: 'item', type: 'input' }] },
      {
        key: 'arr',
        type: 'array',
        className: undefined,
        fields: [{ key: 'item', type: 'input' }],
      },
    ];

    testCases.forEach((fieldDef) => {
      const inputsSignal = arrayFieldMapper(fieldDef);
      const inputs = inputsSignal();
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });

  it('should pass the complete field definition as field input', () => {
    const fieldDef: ArrayField = {
      key: 'tags',
      type: 'array',
      className: 'tag-array',
      fields: [{ key: 'tag', type: 'input' }],
    };

    const inputsSignal = arrayFieldMapper(fieldDef);
    const inputs = inputsSignal();
    expect(inputs['field']).toBe(fieldDef);
  });
});
