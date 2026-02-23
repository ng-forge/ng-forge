import { describe, it, expect } from 'vitest';
import { mapSchemaToFieldType } from './type-mapping.js';
import type { SchemaObject } from '../parser/schema-walker.js';

describe('mapSchemaToFieldType', () => {
  describe('string types', () => {
    it('should map plain string to input(text) with ambiguous flag', () => {
      const result = mapSchemaToFieldType({ type: 'string' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'text' });
      expect(result.isContainer).toBe(false);
      expect(result.isAmbiguous).toBe(true);
      expect(result.ambiguousScope).toBe('text-input');
      expect(result.defaultAlternative).toBe('textarea');
    });

    it('should map string+enum to select with ambiguous flag', () => {
      const result = mapSchemaToFieldType({ type: 'string', enum: ['a', 'b'] } as SchemaObject);
      expect(result.fieldType).toBe('select');
      expect(result.isAmbiguous).toBe(true);
      expect(result.ambiguousScope).toBe('single-select');
      expect(result.defaultAlternative).toBe('radio');
    });

    it('should map string+email to input(email)', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'email' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'email' });
      expect(result.isAmbiguous).toBe(false);
    });

    it('should map string+uri to input(url)', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'uri' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'url' });
    });

    it('should map string+url to input(url)', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'url' } as SchemaObject);
      expect(result.props).toEqual({ type: 'url' });
    });

    it('should map string+date to datepicker', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'date' } as SchemaObject);
      expect(result.fieldType).toBe('datepicker');
      expect(result.isAmbiguous).toBe(false);
    });

    it('should map string+date-time to datepicker', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'date-time' } as SchemaObject);
      expect(result.fieldType).toBe('datepicker');
    });

    it('should map string+password to input(password)', () => {
      const result = mapSchemaToFieldType({ type: 'string', format: 'password' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'password' });
      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('numeric types', () => {
    it('should map integer to input(number) with ambiguous flag', () => {
      const result = mapSchemaToFieldType({ type: 'integer' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'number' });
      expect(result.isAmbiguous).toBe(true);
      expect(result.ambiguousScope).toBe('numeric');
      expect(result.defaultAlternative).toBe('slider');
    });

    it('should map number to input(number) with ambiguous flag', () => {
      const result = mapSchemaToFieldType({ type: 'number' } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'number' });
      expect(result.isAmbiguous).toBe(true);
    });
  });

  describe('boolean type', () => {
    it('should map boolean to checkbox with ambiguous flag', () => {
      const result = mapSchemaToFieldType({ type: 'boolean' } as SchemaObject);
      expect(result.fieldType).toBe('checkbox');
      expect(result.isAmbiguous).toBe(true);
      expect(result.ambiguousScope).toBe('boolean');
      expect(result.defaultAlternative).toBe('toggle');
    });
  });

  describe('array types', () => {
    it('should map array+enum items to multi-checkbox', () => {
      const result = mapSchemaToFieldType({
        type: 'array',
        items: { type: 'string', enum: ['a', 'b', 'c'] },
      } as SchemaObject);
      expect(result.fieldType).toBe('multi-checkbox');
      expect(result.isContainer).toBe(false);
      expect(result.isAmbiguous).toBe(false);
    });

    it('should map array+object items to array container', () => {
      const result = mapSchemaToFieldType({
        type: 'array',
        items: { type: 'object', properties: { name: { type: 'string' } } },
      } as SchemaObject);
      expect(result.fieldType).toBe('array');
      expect(result.isContainer).toBe(true);
    });

    it('should map array+items with properties to array container', () => {
      const result = mapSchemaToFieldType({
        type: 'array',
        items: { properties: { name: { type: 'string' } } },
      } as SchemaObject);
      expect(result.fieldType).toBe('array');
      expect(result.isContainer).toBe(true);
    });

    it('should map array of primitives to input', () => {
      const result = mapSchemaToFieldType({
        type: 'array',
        items: { type: 'string' },
      } as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.isContainer).toBe(false);
    });
  });

  describe('object types', () => {
    it('should map object to group container', () => {
      const result = mapSchemaToFieldType({
        type: 'object',
        properties: { name: { type: 'string' } },
      } as SchemaObject);
      expect(result.fieldType).toBe('group');
      expect(result.isContainer).toBe(true);
      expect(result.isAmbiguous).toBe(false);
    });

    it('should map schema with properties (no explicit type) to group', () => {
      const result = mapSchemaToFieldType({
        properties: { name: { type: 'string' } },
      } as SchemaObject);
      expect(result.fieldType).toBe('group');
      expect(result.isContainer).toBe(true);
    });
  });

  describe('fallback', () => {
    it('should fall back to input(text) for unknown types', () => {
      const result = mapSchemaToFieldType({} as SchemaObject);
      expect(result.fieldType).toBe('input');
      expect(result.props).toEqual({ type: 'text' });
      expect(result.isAmbiguous).toBe(false);
    });
  });
});
