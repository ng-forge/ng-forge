import { describe, it, expect } from 'vitest';
import { mapSchemaToFields } from './schema-to-fields.js';
import type { SchemaObject } from '../parser/schema-walker.js';

describe('mapSchemaToFields', () => {
  it('should map a simple flat object schema', () => {
    const schema: SchemaObject = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
      },
    };

    const result = mapSchemaToFields(schema, ['name']);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]).toMatchObject({ key: 'name', type: 'input', label: 'Name' });
    expect(result.fields[1]).toMatchObject({ key: 'age', type: 'input', label: 'Age' });

    // name should be required
    expect(result.fields[0].validation).toContainEqual({ type: 'required' });
  });

  it('should map nested object to group with child fields', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].type).toBe('group');
    expect(result.fields[0].fields).toHaveLength(2);
    expect(result.fields[0].fields![0]).toMatchObject({ key: 'street', type: 'input' });
  });

  it('should map array of objects to array field with child fields', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'integer' },
            },
          },
        },
      },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].type).toBe('array');
    expect(result.fields[0].fields).toHaveLength(2);
  });

  it('should map enum to select with options', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.fields[0].type).toBe('select');
    expect(result.fields[0].options).toEqual([
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ]);
  });

  it('should disable fields when editable is false', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    };

    const result = mapSchemaToFields(schema, [], { editable: false });
    expect(result.fields[0].disabled).toBe(true);
    expect(result.fields[1].disabled).toBe(true);
  });

  it('should not disable fields when editable is true', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = mapSchemaToFields(schema, [], { editable: true });
    expect(result.fields[0].disabled).toBeUndefined();
  });

  it('should track ambiguous fields', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.ambiguousFields).toHaveLength(2);
    expect(result.ambiguousFields[0]).toMatchObject({
      key: 'name',
      currentType: 'input',
      scope: 'text-input',
      alternative: 'textarea',
    });
    expect(result.ambiguousFields[1]).toMatchObject({
      key: 'isActive',
      currentType: 'checkbox',
      scope: 'boolean',
      alternative: 'toggle',
    });
  });

  it('should apply pre-made decisions and suppress ambiguous tracking', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        bio: { type: 'string' },
        status: { type: 'string', enum: ['a', 'b'] },
      },
    };

    const result = mapSchemaToFields(schema, [], {
      decisions: { bio: 'textarea', status: 'radio' },
    });

    expect(result.fields[0].type).toBe('textarea');
    expect(result.fields[1].type).toBe('radio');
    expect(result.ambiguousFields).toHaveLength(0);
  });

  it('should recursively handle nested groups', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        outer: {
          type: 'object',
          properties: {
            inner: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        },
      },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.fields[0].type).toBe('group');
    expect(result.fields[0].fields![0].type).toBe('group');
    expect(result.fields[0].fields![0].fields![0]).toMatchObject({ key: 'value', type: 'input' });
  });

  it('should include validators from schema constraints', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', minLength: 5, maxLength: 100 },
        count: { type: 'integer', minimum: 0, maximum: 10 },
      },
    };

    const result = mapSchemaToFields(schema, ['email']);
    const emailField = result.fields[0];
    expect(emailField.validation).toContainEqual({ type: 'required' });
    expect(emailField.validation).toContainEqual({ type: 'minLength', value: 5 });
    expect(emailField.validation).toContainEqual({ type: 'maxLength', value: 100 });
    expect(emailField.validation).toContainEqual({ type: 'email' });

    const countField = result.fields[1];
    expect(countField.validation).toContainEqual({ type: 'min', value: 0 });
    expect(countField.validation).toContainEqual({ type: 'max', value: 10 });
  });

  it('should propagate schemaName into nested group ambiguous fields', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
    };

    const result = mapSchemaToFields(schema, [], { schemaName: 'createPet' });
    // The nested field 'city' should have fieldPath 'createPet.address.city'
    const cityAmbiguous = result.ambiguousFields.find((f) => f.key === 'city');
    expect(cityAmbiguous).toBeDefined();
    expect(cityAmbiguous!.fieldPath).toBe('createPet.address.city');
  });

  it('should not leak original props when decision overrides the field type', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        bio: { type: 'string' },
      },
    };

    const result = mapSchemaToFields(schema, [], {
      decisions: { bio: 'textarea' },
    });

    // textarea was chosen via decision, so the original input props { type: 'text' } should NOT be present
    expect(result.fields[0].type).toBe('textarea');
    expect(result.fields[0].props).toBeUndefined();
  });

  it('should propagate warnings from the walker', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      additionalProperties: { type: 'string' },
    };

    const result = mapSchemaToFields(schema, []);
    expect(result.warnings).toContain('additionalProperties are not supported and were skipped');
  });
});
