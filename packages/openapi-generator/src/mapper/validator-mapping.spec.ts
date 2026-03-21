import { describe, it, expect } from 'vitest';
import { mapSchemaToValidators } from './validator-mapping.js';
import type { SchemaObject } from '../parser/schema-walker.js';

describe('mapSchemaToValidators', () => {
  it('should add required validator when required is true', () => {
    const result = mapSchemaToValidators({ type: 'string' } as SchemaObject, true);
    expect(result).toEqual([{ type: 'required' }]);
  });

  it('should not add required when required is false', () => {
    const result = mapSchemaToValidators({ type: 'string' } as SchemaObject, false);
    expect(result).toEqual([]);
  });

  it('should map minLength', () => {
    const result = mapSchemaToValidators({ type: 'string', minLength: 3 } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'minLength', value: 3 });
  });

  it('should map maxLength', () => {
    const result = mapSchemaToValidators({ type: 'string', maxLength: 100 } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'maxLength', value: 100 });
  });

  it('should map minimum', () => {
    const result = mapSchemaToValidators({ type: 'integer', minimum: 0 } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'min', value: 0 });
  });

  it('should map maximum', () => {
    const result = mapSchemaToValidators({ type: 'integer', maximum: 999 } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'max', value: 999 });
  });

  it('should map pattern', () => {
    const result = mapSchemaToValidators({ type: 'string', pattern: '^[a-z]+$' } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'pattern', value: '^[a-z]+$' });
  });

  it('should add email validator for email format', () => {
    const result = mapSchemaToValidators({ type: 'string', format: 'email' } as SchemaObject, false);
    expect(result).toContainEqual({ type: 'email' });
  });

  it('should combine multiple validators', () => {
    const result = mapSchemaToValidators(
      { type: 'string', minLength: 1, maxLength: 50, pattern: '^\\w+$', format: 'email' } as SchemaObject,
      true,
    );
    expect(result).toHaveLength(5);
    expect(result.map((v) => v.type)).toEqual(['required', 'minLength', 'maxLength', 'pattern', 'email']);
  });

  it('should map exclusiveMinimum (adjusted by +1 for inclusive min)', () => {
    const result = mapSchemaToValidators({ type: 'integer', exclusiveMinimum: 0 } as unknown as SchemaObject, false);
    expect(result).toContainEqual({ type: 'min', value: 1 });
  });

  it('should map exclusiveMaximum (adjusted by -1 for inclusive max)', () => {
    const result = mapSchemaToValidators({ type: 'integer', exclusiveMaximum: 100 } as unknown as SchemaObject, false);
    expect(result).toContainEqual({ type: 'max', value: 99 });
  });

  it('should add UUID pattern validator for uuid format', () => {
    const result = mapSchemaToValidators({ type: 'string', format: 'uuid' } as SchemaObject, false);
    expect(result).toContainEqual({
      type: 'pattern',
      value: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    });
  });

  it('should return empty array when no constraints', () => {
    const result = mapSchemaToValidators({ type: 'string' } as SchemaObject, false);
    expect(result).toEqual([]);
  });
});
