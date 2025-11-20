import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaRegistryService } from './schema-registry.service';
import { SchemaDefinition } from '../../models';

describe('SchemaRegistryService', () => {
  let service: SchemaRegistryService;

  beforeEach(() => {
    service = new SchemaRegistryService();
  });

  describe('registerSchema', () => {
    it('should register a schema', () => {
      const schema: SchemaDefinition = {
        name: 'emailSchema',
        fields: [{ type: 'input', key: 'email' }],
      };

      service.registerSchema(schema);
      const retrieved = service.getSchema('emailSchema');

      expect(retrieved).toEqual(schema);
    });

    it('should register multiple schemas', () => {
      const schema1: SchemaDefinition = {
        name: 'schema1',
        fields: [{ type: 'input', key: 'field1' }],
      };
      const schema2: SchemaDefinition = {
        name: 'schema2',
        fields: [{ type: 'input', key: 'field2' }],
      };

      service.registerSchema(schema1);
      service.registerSchema(schema2);

      expect(service.getSchema('schema1')).toEqual(schema1);
      expect(service.getSchema('schema2')).toEqual(schema2);
    });

    it('should overwrite schema with same name', () => {
      const schema1: SchemaDefinition = {
        name: 'mySchema',
        fields: [{ type: 'input', key: 'field1' }],
      };
      const schema2: SchemaDefinition = {
        name: 'mySchema',
        fields: [{ type: 'input', key: 'field2' }],
      };

      service.registerSchema(schema1);
      service.registerSchema(schema2);

      const retrieved = service.getSchema('mySchema');
      expect(retrieved).toEqual(schema2);
      expect(retrieved?.fields[0]).toHaveProperty('key', 'field2');
    });

    it('should handle schema with complex fields', () => {
      const schema: SchemaDefinition = {
        name: 'complexSchema',
        fields: [
          {
            type: 'group',
            key: 'address',
            fields: [
              { type: 'input', key: 'street' },
              { type: 'input', key: 'city' },
            ],
          },
        ],
      };

      service.registerSchema(schema);
      const retrieved = service.getSchema('complexSchema');

      expect(retrieved).toEqual(schema);
    });
  });

  describe('getSchema', () => {
    it('should return undefined for non-existent schema', () => {
      const result = service.getSchema('nonExistent');

      expect(result).toBeUndefined();
    });

    it('should return registered schema', () => {
      const schema: SchemaDefinition = {
        name: 'testSchema',
        fields: [{ type: 'input', key: 'test' }],
      };

      service.registerSchema(schema);
      const result = service.getSchema('testSchema');

      expect(result).toEqual(schema);
    });

    it('should return correct schema when multiple are registered', () => {
      const schemas: SchemaDefinition[] = [
        { name: 'schema1', fields: [{ type: 'input', key: 'field1' }] },
        { name: 'schema2', fields: [{ type: 'input', key: 'field2' }] },
        { name: 'schema3', fields: [{ type: 'input', key: 'field3' }] },
      ];

      schemas.forEach((s) => service.registerSchema(s));

      expect(service.getSchema('schema2')).toEqual(schemas[1]);
    });
  });

  describe('getAllSchemas', () => {
    it('should return empty map when no schemas registered', () => {
      const allSchemas = service.getAllSchemas();

      expect(allSchemas.size).toBe(0);
    });

    it('should return all registered schemas', () => {
      const schema1: SchemaDefinition = {
        name: 'schema1',
        fields: [{ type: 'input', key: 'field1' }],
      };
      const schema2: SchemaDefinition = {
        name: 'schema2',
        fields: [{ type: 'input', key: 'field2' }],
      };

      service.registerSchema(schema1);
      service.registerSchema(schema2);

      const allSchemas = service.getAllSchemas();

      expect(allSchemas.size).toBe(2);
      expect(allSchemas.get('schema1')).toEqual(schema1);
      expect(allSchemas.get('schema2')).toEqual(schema2);
    });

    it('should return new Map instance', () => {
      const schema: SchemaDefinition = {
        name: 'test',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);

      const map1 = service.getAllSchemas();
      const map2 = service.getAllSchemas();

      expect(map1).not.toBe(map2);
      expect(map1).toEqual(map2);
    });

    it('should not affect internal state when modifying returned map', () => {
      const schema: SchemaDefinition = {
        name: 'original',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      const allSchemas = service.getAllSchemas();

      allSchemas.set('newSchema', {
        name: 'newSchema',
        fields: [{ type: 'input', key: 'newField' }],
      });

      expect(service.getSchema('newSchema')).toBeUndefined();
      expect(service.getAllSchemas().size).toBe(1);
    });
  });

  describe('clearSchemas', () => {
    it('should clear all registered schemas', () => {
      const schemas: SchemaDefinition[] = [
        { name: 'schema1', fields: [{ type: 'input', key: 'field1' }] },
        { name: 'schema2', fields: [{ type: 'input', key: 'field2' }] },
      ];

      schemas.forEach((s) => service.registerSchema(s));
      expect(service.getAllSchemas().size).toBe(2);

      service.clearSchemas();

      expect(service.getAllSchemas().size).toBe(0);
      expect(service.getSchema('schema1')).toBeUndefined();
      expect(service.getSchema('schema2')).toBeUndefined();
    });

    it('should allow re-registering after clear', () => {
      const schema: SchemaDefinition = {
        name: 'test',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      service.clearSchemas();
      service.registerSchema(schema);

      expect(service.getSchema('test')).toEqual(schema);
    });

    it('should not throw when clearing empty registry', () => {
      expect(() => service.clearSchemas()).not.toThrow();
    });
  });

  describe('resolveSchema', () => {
    it('should resolve schema from string reference', () => {
      const schema: SchemaDefinition = {
        name: 'mySchema',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      const resolved = service.resolveSchema('mySchema');

      expect(resolved).toEqual(schema);
    });

    it('should return null for non-existent string reference', () => {
      const resolved = service.resolveSchema('nonExistent');

      expect(resolved).toBeNull();
    });

    it('should return schema object directly when passed', () => {
      const schema: SchemaDefinition = {
        name: 'directSchema',
        fields: [{ type: 'input', key: 'field' }],
      };

      const resolved = service.resolveSchema(schema);

      expect(resolved).toBe(schema);
    });

    it('should prefer direct schema over registered one with same name', () => {
      const registeredSchema: SchemaDefinition = {
        name: 'mySchema',
        fields: [{ type: 'input', key: 'registered' }],
      };
      const directSchema: SchemaDefinition = {
        name: 'mySchema',
        fields: [{ type: 'input', key: 'direct' }],
      };

      service.registerSchema(registeredSchema);
      const resolved = service.resolveSchema(directSchema);

      expect(resolved).toBe(directSchema);
      expect(resolved?.fields[0]).toHaveProperty('key', 'direct');
    });

    it('should handle empty string reference', () => {
      const resolved = service.resolveSchema('');

      expect(resolved).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle schema with empty fields array', () => {
      const schema: SchemaDefinition = {
        name: 'emptySchema',
        fields: [],
      };

      service.registerSchema(schema);
      const retrieved = service.getSchema('emptySchema');

      expect(retrieved).toEqual(schema);
      expect(retrieved?.fields).toEqual([]);
    });

    it('should handle schema names with special characters', () => {
      const schema: SchemaDefinition = {
        name: 'schema-with-dashes_and_underscores.and.dots',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      const retrieved = service.getSchema('schema-with-dashes_and_underscores.and.dots');

      expect(retrieved).toEqual(schema);
    });

    it('should maintain schema reference integrity', () => {
      const schema: SchemaDefinition = {
        name: 'refSchema',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      const retrieved = service.getSchema('refSchema');

      expect(retrieved).toBe(schema);
    });
  });

  describe('multiple operations', () => {
    it('should handle register, get, clear, and re-register cycle', () => {
      const schema: SchemaDefinition = {
        name: 'cycleSchema',
        fields: [{ type: 'input', key: 'field' }],
      };

      service.registerSchema(schema);
      expect(service.getSchema('cycleSchema')).toEqual(schema);

      service.clearSchemas();
      expect(service.getSchema('cycleSchema')).toBeUndefined();

      service.registerSchema(schema);
      expect(service.getSchema('cycleSchema')).toEqual(schema);
    });

    it('should handle mix of string and direct schema resolution', () => {
      const registeredSchema: SchemaDefinition = {
        name: 'registered',
        fields: [{ type: 'input', key: 'field1' }],
      };
      const directSchema: SchemaDefinition = {
        name: 'direct',
        fields: [{ type: 'input', key: 'field2' }],
      };

      service.registerSchema(registeredSchema);

      const resolved1 = service.resolveSchema('registered');
      const resolved2 = service.resolveSchema(directSchema);

      expect(resolved1).toEqual(registeredSchema);
      expect(resolved2).toEqual(directSchema);
      expect(service.getSchema('direct')).toBeUndefined();
    });
  });
});
