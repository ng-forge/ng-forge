import { describe, it, expect } from 'vitest';
import { RemoveArrayItemEvent } from './remove-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('RemoveArrayItemEvent', () => {
  describe('Event creation', () => {
    it('should create event with arrayKey and index', () => {
      const event = new RemoveArrayItemEvent('contacts', 1);

      expect(event.arrayKey).toBe('contacts');
      expect(event.index).toBe(1);
    });

    it('should create event without optional index', () => {
      const event = new RemoveArrayItemEvent('items');

      expect(event.arrayKey).toBe('items');
      expect(event.index).toBeUndefined();
    });

    it('should create event with index 0', () => {
      const event = new RemoveArrayItemEvent('list', 0);

      expect(event.arrayKey).toBe('list');
      expect(event.index).toBe(0);
    });

    it('should accept different arrayKey values', () => {
      const event1 = new RemoveArrayItemEvent('users', 2);
      const event2 = new RemoveArrayItemEvent('addresses', 0);
      const event3 = new RemoveArrayItemEvent('phoneNumbers');

      expect(event1.arrayKey).toBe('users');
      expect(event2.arrayKey).toBe('addresses');
      expect(event3.arrayKey).toBe('phoneNumbers');
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new RemoveArrayItemEvent('array');

      expect(event.type).toBe('remove-array-item');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new RemoveArrayItemEvent('array', 5);

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('remove-array-item');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string arrayKey', () => {
      const event = new RemoveArrayItemEvent('');

      expect(event.arrayKey).toBe('');
    });

    it('should handle large index values', () => {
      const event = new RemoveArrayItemEvent('array', 999999);

      expect(event.index).toBe(999999);
    });

    it('should handle nested array keys with dot notation', () => {
      const event = new RemoveArrayItemEvent('company.addresses', 2);

      expect(event.arrayKey).toBe('company.addresses');
      expect(event.index).toBe(2);
    });

    it('should preserve undefined index when not provided', () => {
      const event = new RemoveArrayItemEvent('items');

      expect(event.index).toBeUndefined();
      expect('index' in event).toBe(true); // property exists but is undefined
    });
  });

  describe('Multiple event instances', () => {
    it('should create independent event instances', () => {
      const event1 = new RemoveArrayItemEvent('array1', 1);
      const event2 = new RemoveArrayItemEvent('array2', 2);

      expect(event1.arrayKey).toBe('array1');
      expect(event1.index).toBe(1);
      expect(event2.arrayKey).toBe('array2');
      expect(event2.index).toBe(2);
    });

    it('should not share state between instances', () => {
      const event1 = new RemoveArrayItemEvent('contacts', 0);
      const event2 = new RemoveArrayItemEvent('contacts', 5);

      expect(event1.index).toBe(0);
      expect(event2.index).toBe(5);
    });
  });
});
