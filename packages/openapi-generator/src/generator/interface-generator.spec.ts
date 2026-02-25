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

  it('should handle numeric enums without quoting', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        priority: { type: 'integer', enum: [1, 2, 3] },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  priority?: 1 | 2 | 3;');
  });

  it('should handle nullable types', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true } as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name?: string | null;');
  });

  it('should handle oneOf as union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        value: {
          oneOf: [{ type: 'string' }, { type: 'number' }],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  value?: string | number;');
  });

  it('should handle anyOf as union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        value: {
          anyOf: [{ type: 'string' }, { type: 'boolean' }],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  value?: string | boolean;');
  });

  it('should handle allOf as intersection type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        data: {
          allOf: [
            { type: 'object', properties: { id: { type: 'integer' } } },
            { type: 'object', properties: { name: { type: 'string' } } },
          ],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    // allOf should produce an intersection
    expect(result).toMatch(/data\?:.*&/);
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

  it('should include @generated header', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toMatch(/^\/\/ @generated by @ng-forge\/openapi-generator — DO NOT EDIT\n/);
  });

  it('should include @generated header with nested interfaces', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: { street: { type: 'string' } },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toMatch(/^\/\/ @generated by @ng-forge\/openapi-generator — DO NOT EDIT\n/);
  });
});
