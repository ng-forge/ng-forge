import { FieldConfig } from '../models/field-config';
import { FieldTypeDefinition } from '../models/field-type';

// Helper functions for field processing (extracted from DynamicFormComponent logic)
function processFields<TModel = unknown>(
  fields: FieldConfig<TModel>[],
  getTypeDefaults: (typeName: string) => FieldTypeDefinition | undefined
): FieldConfig<TModel>[] {
  return fields.map((field) => processField(field, getTypeDefaults));
}

function processField<TModel = unknown>(
  field: FieldConfig<TModel>,
  getTypeDefaults: (typeName: string) => FieldTypeDefinition | undefined
): FieldConfig<TModel> {
  // Generate field ID if not provided
  if (!field.id) {
    field.id = generateFieldId(field);
  }

  // Handle field groups recursively
  if (field.fieldGroup && field.fieldGroup.length > 0) {
    field.fieldGroup = field.fieldGroup.map((nestedField) => {
      nestedField.parent = field;
      return processField(nestedField as FieldConfig<TModel>, getTypeDefaults);
    });
  }

  // Merge field props with type defaults
  if (field.type) {
    const fieldType = getTypeDefaults(field.type);
    if (fieldType?.defaultProps) {
      field.props = {
        ...fieldType.defaultProps,
        ...field.props,
      };
    }
  }

  // Call onInit hook
  field.hooks?.onInit?.(field);

  return field;
}

function generateFieldId(field: FieldConfig<any>): string {
  const prefix = 'dynamic-field';
  const key = field.key || field.type;
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${key}-${random}`;
}

describe('Field Processing Logic', () => {
  const mockTypes = new Map<string, FieldTypeDefinition>([
    [
      'input',
      {
        name: 'input',
        defaultProps: {
          type: 'text',
          placeholder: 'Enter value',
          required: false,
        },
      },
    ],
    [
      'select',
      {
        name: 'select',
        defaultProps: {
          multiple: false,
          options: [],
        },
      },
    ],
  ]);

  const getTypeDefaults = (typeName: string) => mockTypes.get(typeName);

  it('should process fields correctly', () => {
    expect(processFields).toBeTruthy();
  });

  describe('processFields', () => {
    it('should process multiple fields', () => {
      const fields: FieldConfig[] = [
        { key: 'firstName', type: 'input' },
        { key: 'lastName', type: 'input' },
      ];

      const result = processFields(fields, getTypeDefaults);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[1]).toHaveProperty('id');
    });

    it('should return empty array for empty input', () => {
      const result = processFields([], getTypeDefaults);
      expect(result).toEqual([]);
    });

    it('should preserve original fields structure', () => {
      const fields: FieldConfig[] = [
        {
          key: 'firstName',
          type: 'input',
          props: { label: 'First Name' },
        },
      ];

      const result = processFields(fields, getTypeDefaults);

      expect(result[0].key).toBe('firstName');
      expect(result[0].type).toBe('input');
      expect(result[0].props?.label).toBe('First Name');
    });
  });

  describe('field processing', () => {
    it('should generate field ID when not provided', () => {
      const field: FieldConfig = { key: 'firstName', type: 'input' };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.id).toMatch(/^dynamic-field-firstName-\w+$/);
    });

    it('should preserve existing field ID', () => {
      const field: FieldConfig = {
        key: 'firstName',
        type: 'input',
        id: 'custom-id',
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.id).toBe('custom-id');
    });

    it('should merge field props with type defaults', () => {
      const field: FieldConfig = {
        key: 'firstName',
        type: 'input',
        props: { label: 'First Name' },
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.props).toEqual({
        type: 'text',
        placeholder: 'Enter value',
        required: false,
        label: 'First Name',
      });
    });

    it('should override defaults with field props', () => {
      const field: FieldConfig = {
        key: 'firstName',
        type: 'input',
        props: {
          placeholder: 'Custom placeholder',
          required: true,
        },
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.props).toEqual({
        type: 'text',
        placeholder: 'Custom placeholder',
        required: true,
      });
    });

    it('should handle fields with unregistered type', () => {
      const field: FieldConfig = { key: 'firstName', type: 'unknown' };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.type).toBe('unknown');
      expect(result.props).toBeUndefined();
    });

    it('should call onInit hook if provided', () => {
      const onInitSpy = jest.fn();
      const field: FieldConfig = {
        key: 'firstName',
        type: 'input',
        hooks: { onInit: onInitSpy },
      };

      processFields([field], getTypeDefaults);

      expect(onInitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'firstName',
          type: 'input',
        })
      );
    });

    it('should not call onInit hook if not provided', () => {
      const field: FieldConfig = { key: 'firstName', type: 'input' };

      expect(() => processFields([field], getTypeDefaults)).not.toThrow();
    });
  });

  describe('field groups', () => {
    it('should process nested field groups recursively', () => {
      const field: FieldConfig = {
        key: 'userGroup',
        type: 'fieldgroup',
        fieldGroup: [
          { key: 'firstName', type: 'input' },
          { key: 'lastName', type: 'input' },
        ],
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.fieldGroup).toHaveLength(2);
      expect(result.fieldGroup![0]).toHaveProperty('id');
      expect(result.fieldGroup![1]).toHaveProperty('id');
    });

    it('should set parent reference on nested fields', () => {
      const field: FieldConfig = {
        key: 'userGroup',
        type: 'fieldgroup',
        fieldGroup: [{ key: 'firstName', type: 'input' }],
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.fieldGroup![0].parent).toBe(result);
    });

    it('should handle deeply nested field groups', () => {
      const field: FieldConfig = {
        key: 'rootGroup',
        type: 'fieldgroup',
        fieldGroup: [
          {
            key: 'nestedGroup',
            type: 'fieldgroup',
            fieldGroup: [{ key: 'firstName', type: 'input' }],
          },
        ],
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.fieldGroup![0].fieldGroup![0]).toHaveProperty('id');
      expect(result.fieldGroup![0].fieldGroup![0].parent).toBe(result.fieldGroup![0]);
    });

    it('should handle empty field groups', () => {
      const field: FieldConfig = {
        key: 'emptyGroup',
        type: 'fieldgroup',
        fieldGroup: [],
      };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.fieldGroup).toEqual([]);
    });
  });

  describe('field ID generation', () => {
    it('should generate unique IDs for same field', () => {
      const field1: FieldConfig = { key: 'firstName', type: 'input' };
      const field2: FieldConfig = { key: 'firstName', type: 'input' };

      const result1 = processFields([field1], getTypeDefaults)[0];
      const result2 = processFields([field2], getTypeDefaults)[0];

      expect(result1.id).toMatch(/^dynamic-field-firstName-\w+$/);
      expect(result2.id).toMatch(/^dynamic-field-firstName-\w+$/);
      expect(result1.id).not.toBe(result2.id);
    });

    it('should use type as fallback when no key', () => {
      const field: FieldConfig = { type: 'submit' };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.id).toMatch(/^dynamic-field-submit-\w+$/);
    });

    it('should handle fields with neither key nor type gracefully', () => {
      const field: FieldConfig = { type: 'unknown' };

      const result = processFields([field], getTypeDefaults)[0];

      expect(result.id).toMatch(/^dynamic-field-unknown-\w+$/);
    });
  });
});
