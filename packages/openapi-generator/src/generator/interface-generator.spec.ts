import type { OpenAPIV3 } from 'openapi-types';
import { generateInterface } from './interface-generator';
import type { InterfaceGeneratorOptions } from './interface-generator';

const defaultOptions: InterfaceGeneratorOptions = {
  method: 'POST',
  path: '/pets',
  operationId: 'createPet',
};

describe('generateInterface', () => {
  it('should generate interface with string, number, boolean fields', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        active: { type: 'boolean' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValue {');
    expect(result).toContain('  name: string;');
    expect(result).toContain('  age?: number;');
    expect(result).toContain('  active?: boolean;');
    expect(result).toContain('}');
  });

  it('should mark required fields without question mark', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name: string;');
    expect(result).toContain('  email: string;');
    expect(result).toContain('  phone?: string;');
  });

  it('should map enum to union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain("  status?: 'active' | 'inactive' | 'pending';");
  });

  it('should generate nested interface for object properties', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          required: ['street'],
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValueAddress {');
    expect(result).toContain('  street: string;');
    expect(result).toContain('  city?: string;');
    expect(result).toContain('  address?: CreatePetFormValueAddress;');
  });

  it('should generate nested interface for array of objects', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValueTagsItem {');
    expect(result).toContain('  id?: number;');
    expect(result).toContain('  name?: string;');
    expect(result).toContain('  tags?: CreatePetFormValueTagsItem[];');
  });

  it('should handle array of primitives', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  tags?: string[];');
  });

  it('should handle array of enums', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string', enum: ['admin', 'user'] },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain("  roles?: ('admin' | 'user')[];");
  });

  it('should handle number type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        price: { type: 'number' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  price?: number;');
  });

  it('should use path-based name when operationId is not provided', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    const result = generateInterface(schema, { method: 'POST', path: '/pets' });

    expect(result).toContain('export interface PostPetsFormValue {');
  });

  it('should use unknown for unrecognized types', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        data: {} as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  data?: unknown;');
  });

  it('should skip $ref properties', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ref: { $ref: '#/components/schemas/Other' } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name?: string;');
    expect(result).not.toContain('ref');
  });
});
