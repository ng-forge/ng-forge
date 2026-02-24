import type { OpenAPIV3 } from 'openapi-types';
import { walkSchema } from './schema-walker.js';
import type { SchemaObject } from './schema-walker.js';

describe('walkSchema', () => {
  it('should walk a simple object with properties', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        email: { type: 'string', format: 'email' },
      },
    };

    const result = walkSchema(schema);

    expect(result.properties).toHaveLength(3);
    expect(result.properties[0].name).toBe('name');
    expect(result.properties[0].schema.type).toBe('string');
    expect(result.properties[0].required).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it('should detect required fields from schema.required', () => {
    const schema: SchemaObject = {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        email: { type: 'string' },
      },
    };

    const result = walkSchema(schema);

    expect(result.properties.find((p) => p.name === 'name')?.required).toBe(true);
    expect(result.properties.find((p) => p.name === 'age')?.required).toBe(false);
    expect(result.properties.find((p) => p.name === 'email')?.required).toBe(true);
  });

  it('should detect required fields from requiredFields parameter', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
      },
    };

    const result = walkSchema(schema, ['name']);

    expect(result.properties.find((p) => p.name === 'name')?.required).toBe(true);
    expect(result.properties.find((p) => p.name === 'age')?.required).toBe(false);
  });

  it('should merge allOf schemas', () => {
    const schema: SchemaObject = {
      allOf: [
        {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        } as SchemaObject,
        {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            age: { type: 'integer' },
          },
        } as SchemaObject,
      ],
    };

    const result = walkSchema(schema);

    expect(result.properties).toHaveLength(3);
    expect(result.properties.find((p) => p.name === 'id')?.required).toBe(true);
    expect(result.properties.find((p) => p.name === 'name')?.required).toBe(true);
    expect(result.properties.find((p) => p.name === 'age')?.required).toBe(false);
  });

  it('should handle allOf with overlapping properties (last wins)', () => {
    const schema: SchemaObject = {
      allOf: [
        {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 50 },
          },
        } as SchemaObject,
        {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 100 },
          },
        } as SchemaObject,
      ],
    };

    const result = walkSchema(schema);

    expect(result.properties).toHaveLength(1);
    expect(result.properties[0].schema.maxLength).toBe(100);
  });

  it('should handle oneOf with discriminator', () => {
    const schema: SchemaObject = {
      discriminator: {
        propertyName: 'petType',
      } as OpenAPIV3.DiscriminatorObject,
      oneOf: [
        {
          type: 'object',
          properties: {
            petType: { type: 'string', enum: ['dog'] },
            breed: { type: 'string' },
          },
        } as SchemaObject,
        {
          type: 'object',
          properties: {
            petType: { type: 'string', enum: ['cat'] },
            indoor: { type: 'boolean' },
          },
        } as SchemaObject,
      ],
    };

    const result = walkSchema(schema);

    expect(result.discriminator).toBeDefined();
    expect(result.discriminator?.propertyName).toBe('petType');
    expect(result.discriminator?.mapping).toHaveProperty('dog');
    expect(result.discriminator?.mapping).toHaveProperty('cat');
    expect(result.properties).toEqual([]);
  });

  it('should skip anyOf with warning', () => {
    const schema: SchemaObject = {
      anyOf: [{ type: 'string' } as SchemaObject, { type: 'integer' } as SchemaObject],
    };

    const result = walkSchema(schema);

    expect(result.properties).toEqual([]);
    expect(result.warnings).toContain('anyOf schemas are not supported and were skipped');
  });

  it('should skip if/then/else with warning', () => {
    const schema = {
      type: 'object',
      if: { properties: { type: { const: 'a' } } },
      then: { properties: { extra: { type: 'string' } } },
    } as unknown as SchemaObject;

    const result = walkSchema(schema);

    expect(result.warnings).toContain('if/then/else schemas are not supported and were skipped');
  });

  it('should warn about additionalProperties', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      additionalProperties: { type: 'string' },
    };

    const result = walkSchema(schema);

    expect(result.properties).toHaveLength(1);
    expect(result.warnings).toContain('additionalProperties are not supported and were skipped');
  });

  it('should not warn when additionalProperties is false', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      additionalProperties: false,
    };

    const result = walkSchema(schema);

    expect(result.warnings).toEqual([]);
  });

  it('should handle schema with no properties', () => {
    const schema: SchemaObject = {
      type: 'object',
    };

    const result = walkSchema(schema);

    expect(result.properties).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('should resolve explicit discriminator.mapping with $ref-based paths', () => {
    const schema: SchemaObject = {
      discriminator: {
        propertyName: 'petType',
        mapping: {
          dog: '#/components/schemas/Dog',
          cat: '#/components/schemas/Cat',
        },
      } as OpenAPIV3.DiscriminatorObject,
      oneOf: [
        {
          type: 'object',
          title: 'Dog',
          properties: {
            petType: { type: 'string', enum: ['dog'] },
            breed: { type: 'string' },
          },
        } as SchemaObject,
        {
          type: 'object',
          title: 'Cat',
          properties: {
            petType: { type: 'string', enum: ['cat'] },
            indoor: { type: 'boolean' },
          },
        } as SchemaObject,
      ],
    };

    const result = walkSchema(schema);

    expect(result.discriminator).toBeDefined();
    expect(result.discriminator?.mapping).toHaveProperty('dog');
    expect(result.discriminator?.mapping).toHaveProperty('cat');
    expect(result.discriminator?.mapping['dog']).toHaveProperty('title', 'Dog');
    expect(result.discriminator?.mapping['cat']).toHaveProperty('title', 'Cat');
  });
});
