import { describe, it, expect } from 'vitest';
import { arrayEvent } from './array-event';
import { AppendArrayItemEvent } from './constants/append-array-item.event';
import { PrependArrayItemEvent } from './constants/prepend-array-item.event';
import { InsertArrayItemEvent } from './constants/insert-array-item.event';
import { PopArrayItemEvent } from './constants/pop-array-item.event';
import { ShiftArrayItemEvent } from './constants/shift-array-item.event';
import { RemoveAtIndexEvent } from './constants/remove-at-index.event';

describe('arrayEvent builder', () => {
  const defaultTemplate = [{ key: 'name', type: 'input' as const }];

  describe('append()', () => {
    it('should create AppendArrayItemEvent with arrayKey and template', () => {
      const template = [{ key: 'name', type: 'input' as const }];
      const event = arrayEvent('contacts').append(template);

      expect(event).toBeInstanceOf(AppendArrayItemEvent);
      expect(event.arrayKey).toBe('contacts');
      expect(event.template).toEqual(template);
    });

    it('should create AppendArrayItemEvent with multiple field template', () => {
      const template = [
        { key: 'name', type: 'input' as const },
        { key: 'email', type: 'input' as const },
      ];
      const event = arrayEvent('contacts').append(template);

      expect(event).toBeInstanceOf(AppendArrayItemEvent);
      expect(event.template).toHaveLength(2);
    });
  });

  describe('prepend()', () => {
    it('should create PrependArrayItemEvent with arrayKey and template', () => {
      const template = [{ key: 'name', type: 'input' as const }];
      const event = arrayEvent('contacts').prepend(template);

      expect(event).toBeInstanceOf(PrependArrayItemEvent);
      expect(event.arrayKey).toBe('contacts');
      expect(event.template).toEqual(template);
    });

    it('should create PrependArrayItemEvent with multiple field template', () => {
      const template = [
        { key: 'name', type: 'input' as const },
        { key: 'email', type: 'input' as const },
      ];
      const event = arrayEvent('contacts').prepend(template);

      expect(event).toBeInstanceOf(PrependArrayItemEvent);
      expect(event.template).toHaveLength(2);
    });
  });

  describe('insertAt()', () => {
    it('should create InsertArrayItemEvent with arrayKey, index, and template', () => {
      const template = [{ key: 'name', type: 'input' as const }];
      const event = arrayEvent('contacts').insertAt(3, template);

      expect(event).toBeInstanceOf(InsertArrayItemEvent);
      expect(event.arrayKey).toBe('contacts');
      expect(event.index).toBe(3);
      expect(event.template).toEqual(template);
    });

    it('should accept zero as valid index', () => {
      const event = arrayEvent('contacts').insertAt(0, defaultTemplate);

      expect(event.index).toBe(0);
    });
  });

  describe('pop()', () => {
    it('should create PopArrayItemEvent with arrayKey', () => {
      const event = arrayEvent('contacts').pop();

      expect(event).toBeInstanceOf(PopArrayItemEvent);
      expect(event.arrayKey).toBe('contacts');
    });
  });

  describe('shift()', () => {
    it('should create ShiftArrayItemEvent with arrayKey', () => {
      const event = arrayEvent('contacts').shift();

      expect(event).toBeInstanceOf(ShiftArrayItemEvent);
      expect(event.arrayKey).toBe('contacts');
    });
  });

  describe('removeAt()', () => {
    it('should create RemoveAtIndexEvent with arrayKey and index', () => {
      const event = arrayEvent('contacts').removeAt(2);

      expect(event).toBeInstanceOf(RemoveAtIndexEvent);
      expect(event.arrayKey).toBe('contacts');
      expect(event.index).toBe(2);
    });

    it('should accept zero as valid index', () => {
      const event = arrayEvent('contacts').removeAt(0);

      expect(event.index).toBe(0);
    });
  });

  describe('builder returns correct event types', () => {
    it('should have correct type discriminants', () => {
      expect(arrayEvent('x').append(defaultTemplate).type).toBe('append-array-item');
      expect(arrayEvent('x').prepend(defaultTemplate).type).toBe('prepend-array-item');
      expect(arrayEvent('x').insertAt(0, defaultTemplate).type).toBe('insert-array-item');
      expect(arrayEvent('x').pop().type).toBe('pop-array-item');
      expect(arrayEvent('x').shift().type).toBe('shift-array-item');
      expect(arrayEvent('x').removeAt(0).type).toBe('remove-at-index');
    });
  });
});
