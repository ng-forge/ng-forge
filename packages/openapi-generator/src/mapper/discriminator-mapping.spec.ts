import { describe, it, expect } from 'vitest';
import { mapDiscriminator } from './discriminator-mapping.js';
import type { WalkedSchema } from '../parser/schema-walker.js';

describe('mapDiscriminator', () => {
  describe('basic discriminator mapping', () => {
    it('should map a single-variant discriminator', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          cat: { type: 'object', properties: {} },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField).toBeDefined();
      expect(result.conditionalGroups).toHaveLength(1);
    });

    it('should map a multi-variant discriminator with multiple options', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'animalType',
        mapping: {
          cat: { type: 'object', properties: {} },
          dog: { type: 'object', properties: {} },
          bird: { type: 'object', properties: {} },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.options).toHaveLength(3);
      expect(result.conditionalGroups).toHaveLength(3);
    });
  });

  describe('discriminator field properties', () => {
    it('should set the key to the discriminator propertyName', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'vehicleType',
        mapping: {
          car: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.key).toBe('vehicleType');
    });

    it('should set the field type to radio', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'kind',
        mapping: {
          alpha: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.type).toBe('radio');
    });

    it('should capitalize the label from propertyName', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'petType',
        mapping: {
          dog: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.label).toBe('PetType');
    });

    it('should capitalize a single-character propertyName label', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'x',
        mapping: {
          a: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.label).toBe('X');
    });

    it('should include required validation on the discriminator field', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          foo: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.validation).toEqual([{ type: 'required' }]);
    });
  });

  describe('options', () => {
    it('should generate an option for each mapping entry', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          cat: { type: 'object' },
          dog: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.options).toEqual([
        { label: 'Cat', value: 'cat' },
        { label: 'Dog', value: 'dog' },
      ]);
    });

    it('should capitalize option labels', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'status',
        mapping: {
          active: { type: 'object' },
          inactive: { type: 'object' },
          pending: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      const labels = result.discriminatorField.options.map((o) => o.label);
      expect(labels).toEqual(['Active', 'Inactive', 'Pending']);
    });

    it('should preserve the original value in options without modification', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          myVariant: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.discriminatorField.options[0].value).toBe('myVariant');
    });
  });

  describe('conditional groups', () => {
    it('should create one conditional group per mapping entry', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          alpha: { type: 'object' },
          beta: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      expect(result.conditionalGroups).toHaveLength(2);
    });

    it('should set discriminatorValue to the mapping key for each group', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          cat: { type: 'object' },
          dog: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      const values = result.conditionalGroups.map((g) => g.discriminatorValue);
      expect(values).toEqual(['cat', 'dog']);
    });

    it('should initialize each conditional group with an empty fields array', () => {
      const discriminator: NonNullable<WalkedSchema['discriminator']> = {
        propertyName: 'type',
        mapping: {
          foo: { type: 'object' },
          bar: { type: 'object' },
          baz: { type: 'object' },
        },
      };

      const result = mapDiscriminator(discriminator);

      for (const group of result.conditionalGroups) {
        expect(group.fields).toEqual([]);
      }
    });
  });
});
