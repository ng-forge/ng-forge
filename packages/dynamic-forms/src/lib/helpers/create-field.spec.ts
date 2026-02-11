import { createField, field } from './create-field';
import { DynamicFormError } from '../errors/dynamic-form-error';

describe('createField', () => {
  describe('basic validation', () => {
    it('should throw when key is missing', () => {
      expect(() => createField('input', { label: 'Name', value: '' } as unknown as Parameters<typeof createField>[1])).toThrow(
        DynamicFormError,
      );
      expect(() => createField('input', { label: 'Name', value: '' } as unknown as Parameters<typeof createField>[1])).toThrow(
        "'key' property is required",
      );
    });

    it('should create a valid input field', () => {
      const result = createField('input', { key: 'name', label: 'Name', value: '' });
      expect(result).toEqual({ type: 'input', key: 'name', label: 'Name', value: '' });
    });
  });

  describe('container validation', () => {
    it('should throw when group has label', () => {
      expect(() =>
        createField('group', {
          key: 'address',
          label: 'Address',
          fields: [],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow(DynamicFormError);
      expect(() =>
        createField('group', {
          key: 'address',
          label: 'Address',
          fields: [],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("do NOT support 'label'");
    });

    it('should throw when row has non-hidden logic', () => {
      expect(() =>
        createField('row', {
          key: 'nameRow',
          fields: [],
          logic: [{ type: 'disabled', condition: { type: 'true' } }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow(DynamicFormError);
      expect(() =>
        createField('row', {
          key: 'nameRow',
          fields: [],
          logic: [{ type: 'disabled', condition: { type: 'true' } }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("Only 'hidden' logic type is supported");
    });

    it('should allow group with hidden logic', () => {
      const result = createField('group', {
        key: 'address',
        fields: [],
        logic: [{ type: 'hidden', condition: true }],
      });
      expect(result.type).toBe('group');
      expect(result.logic).toEqual([{ type: 'hidden', condition: true }]);
    });

    it('should allow row with hidden logic', () => {
      const result = createField('row', {
        key: 'nameRow',
        fields: [],
        logic: [{ type: 'hidden', condition: { type: 'true' } }],
      });
      expect(result.type).toBe('row');
    });

    it('should allow array with hidden logic', () => {
      const result = createField('array', {
        key: 'contacts',
        fields: [],
        logic: [{ type: 'hidden', condition: false }],
      });
      expect(result.type).toBe('array');
    });

    it('should throw when container has disabled logic', () => {
      expect(() =>
        createField('group', {
          key: 'address',
          fields: [],
          logic: [{ type: 'disabled', condition: true }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("Only 'hidden' logic type is supported");
    });

    it('should allow group without label', () => {
      const result = createField('group', { key: 'address', fields: [] });
      expect(result).toEqual({ type: 'group', key: 'address', fields: [] });
    });
  });

  describe('page validation', () => {
    it('should allow page with hidden logic', () => {
      const result = createField('page', {
        key: 'step1',
        fields: [],
        logic: [{ type: 'hidden', condition: { type: 'true' } }],
      });
      expect(result.type).toBe('page');
    });

    it('should throw when page has non-hidden logic', () => {
      expect(() =>
        createField('page', {
          key: 'step1',
          fields: [],
          logic: [{ type: 'disabled', condition: { type: 'true' } }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("Only 'hidden' logic type is supported");
    });
  });

  describe('options placement validation', () => {
    it('should throw when select has options in props', () => {
      expect(() =>
        createField('select', {
          key: 'country',
          label: 'Country',
          props: { options: [{ label: 'USA', value: 'us' }] },
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("'options' must be at FIELD level");
    });

    it('should allow select with options at field level', () => {
      const result = createField('select', {
        key: 'country',
        label: 'Country',
        options: [{ label: 'USA', value: 'us' }],
      });
      expect(result.type).toBe('select');
    });
  });

  describe('hidden field validation', () => {
    it('should throw when hidden has logic', () => {
      expect(() =>
        createField('hidden', {
          key: 'userId',
          value: '123',
          logic: [{ type: 'hidden', condition: { type: 'true' } }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("do NOT support 'logic'");
    });

    it('should throw when hidden has validators', () => {
      expect(() =>
        createField('hidden', {
          key: 'userId',
          value: '123',
          validators: [{ type: 'required' }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("do NOT support 'validators'");
    });

    it('should throw when hidden has label', () => {
      expect(() =>
        createField('hidden', {
          key: 'userId',
          value: '123',
          label: 'User ID',
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("do NOT support 'label'");
    });

    it('should allow valid hidden field', () => {
      const result = createField('hidden', { key: 'userId', value: '123' });
      expect(result).toEqual({ type: 'hidden', key: 'userId', value: '123' });
    });
  });

  describe('array validation', () => {
    it('should throw when array uses template instead of fields', () => {
      expect(() =>
        createField('array', {
          key: 'contacts',
          template: [{ type: 'input', key: 'name' }],
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("Use 'fields' (NOT 'template')");
    });

    it('should throw when array has minItems/maxItems', () => {
      expect(() =>
        createField('array', {
          key: 'contacts',
          fields: [],
          minItems: 1,
        } as unknown as Parameters<typeof createField>[1]),
      ).toThrow("'minItems' and 'maxItems' properties are NOT supported");
    });
  });

  describe('field alias', () => {
    it('should be an alias for createField', () => {
      expect(field).toBe(createField);
    });
  });
});
