import { describe, it, expect } from 'vitest';
import { AddArrayItemEvent } from './add-array-item.event';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import { FormEvent } from '../interfaces/form-event';

describe('AddArrayItemEvent', () => {
  describe('Event creation', () => {
    it('should create event with all parameters', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'email' };
      const event = new AddArrayItemEvent('contacts', field, 2);

      expect(event.arrayKey).toBe('contacts');
      expect(event.field).toBe(field);
      expect(event.index).toBe(2);
    });

    it('should create event without optional index', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'name' };
      const event = new AddArrayItemEvent('items', field);

      expect(event.arrayKey).toBe('items');
      expect(event.field).toBe(field);
      expect(event.index).toBeUndefined();
    });

    it('should create event with index 0', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'value' };
      const event = new AddArrayItemEvent('list', field, 0);

      expect(event.index).toBe(0);
    });

    it('should accept group field type', () => {
      const field: ArrayAllowedChildren = {
        type: 'group',
        key: 'address',
        fields: [
          { type: 'input', key: 'street' },
          { type: 'input', key: 'city' },
        ],
      };
      const event = new AddArrayItemEvent('addresses', field);

      expect(event.field).toBe(field);
      expect(event.field.type).toBe('group');
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'test' };
      const event = new AddArrayItemEvent('array', field);

      expect(event.type).toBe('add-array-item');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'test' };
      const event = new AddArrayItemEvent('array', field);

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('add-array-item');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string arrayKey', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'test' };
      const event = new AddArrayItemEvent('', field);

      expect(event.arrayKey).toBe('');
    });

    it('should handle large index values', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'test' };
      const event = new AddArrayItemEvent('array', field, 999999);

      expect(event.index).toBe(999999);
    });

    it('should store field reference correctly', () => {
      const field: ArrayAllowedChildren = { type: 'input', key: 'test', label: 'Test Field' };
      const event = new AddArrayItemEvent('array', field);

      expect(event.field).toBe(field);
      expect(event.field.label).toBe('Test Field');
    });

    it('should handle complex nested field definitions', () => {
      const field: ArrayAllowedChildren = {
        type: 'row',
        fields: [
          { type: 'input', key: 'firstName' },
          { type: 'input', key: 'lastName' },
        ],
      };
      const event = new AddArrayItemEvent('people', field);

      expect(event.field).toBe(field);
      expect(event.field.type).toBe('row');
    });
  });
});
