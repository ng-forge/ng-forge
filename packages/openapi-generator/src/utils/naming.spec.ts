import { describe, it, expect } from 'vitest';
import { toLabel, toPascalCase, toCamelCase, toKebabCase, toFormConfigName, toFormFileName, toInterfaceName } from './naming.js';

describe('toLabel', () => {
  it('should convert camelCase to label', () => {
    expect(toLabel('firstName')).toBe('First Name');
  });

  it('should convert snake_case to label', () => {
    expect(toLabel('pet_name')).toBe('Pet Name');
  });

  it('should convert kebab-case to label', () => {
    expect(toLabel('is-active')).toBe('Is Active');
  });

  it('should handle single word', () => {
    expect(toLabel('name')).toBe('Name');
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated to PascalCase', () => {
    expect(toPascalCase('create pet')).toBe('CreatePet');
  });

  it('should convert path-like string', () => {
    expect(toPascalCase('POST:/pets')).toBe('PostPets');
  });

  it('should handle single word', () => {
    expect(toPascalCase('pet')).toBe('Pet');
  });

  it('should handle camelCase input', () => {
    expect(toPascalCase('createPet')).toBe('CreatePet');
  });

  it('should handle already PascalCase input', () => {
    expect(toPascalCase('CreatePet')).toBe('CreatePet');
  });
});

describe('toCamelCase', () => {
  it('should convert to camelCase', () => {
    expect(toCamelCase('create pet')).toBe('createPet');
  });

  it('should handle single word', () => {
    expect(toCamelCase('pet')).toBe('pet');
  });
});

describe('toKebabCase', () => {
  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('CreatePet')).toBe('create-pet');
  });

  it('should handle already-kebab strings', () => {
    expect(toKebabCase('create-pet')).toBe('create-pet');
  });
});

describe('toFormConfigName', () => {
  it('should generate name from operationId', () => {
    expect(toFormConfigName('POST', '/pets', 'createPet')).toBe('createPetFormConfig');
  });

  it('should generate name from method+path when no operationId', () => {
    const result = toFormConfigName('POST', '/pets');
    expect(result).toBe('postPetsFormConfig');
  });

  it('should handle path parameters', () => {
    const result = toFormConfigName('GET', '/pets/{id}');
    expect(result).toBe('getPetsByIdFormConfig');
  });
});

describe('toFormFileName', () => {
  it('should generate filename from operationId', () => {
    expect(toFormFileName('POST', '/pets', 'createPet')).toBe('create-pet.form.ts');
  });

  it('should generate filename from method+path', () => {
    expect(toFormFileName('POST', '/pets')).toBe('post-pets.form.ts');
  });
});

describe('toInterfaceName', () => {
  it('should generate interface name from operationId', () => {
    expect(toInterfaceName('POST', '/pets', 'createPet')).toBe('CreatePetFormValue');
  });

  it('should generate interface name from method+path', () => {
    expect(toInterfaceName('POST', '/pets')).toBe('PostPetsFormValue');
  });
});
