import { describe, it, expect } from 'vitest';
import { ComponentInitializedEvent } from './component-initialized.event';
import { FormEvent } from '../interfaces/form-event';

describe('ComponentInitializedEvent', () => {
  describe('Event creation', () => {
    it('should create event with dynamic-form component type', () => {
      const event = new ComponentInitializedEvent('dynamic-form', 'form-1');

      expect(event.componentType).toBe('dynamic-form');
      expect(event.componentId).toBe('form-1');
    });

    it('should create event with page component type', () => {
      const event = new ComponentInitializedEvent('page', 'page-1');

      expect(event.componentType).toBe('page');
      expect(event.componentId).toBe('page-1');
    });

    it('should create event with row component type', () => {
      const event = new ComponentInitializedEvent('row', 'row-1');

      expect(event.componentType).toBe('row');
      expect(event.componentId).toBe('row-1');
    });

    it('should create event with group component type', () => {
      const event = new ComponentInitializedEvent('group', 'group-1');

      expect(event.componentType).toBe('group');
      expect(event.componentId).toBe('group-1');
    });

    it('should accept different component IDs', () => {
      const event1 = new ComponentInitializedEvent('page', 'step1');
      const event2 = new ComponentInitializedEvent('page', 'step2');
      const event3 = new ComponentInitializedEvent('group', 'address-group');

      expect(event1.componentId).toBe('step1');
      expect(event2.componentId).toBe('step2');
      expect(event3.componentId).toBe('address-group');
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new ComponentInitializedEvent('page', 'page-1');

      expect(event.type).toBe('component-initialized');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new ComponentInitializedEvent('dynamic-form', 'main-form');

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('component-initialized');
    });

    it('should be assignable to FormEvent array', () => {
      const events: FormEvent[] = [new ComponentInitializedEvent('page', 'p1'), new ComponentInitializedEvent('row', 'r1')];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('component-initialized');
      expect(events[1].type).toBe('component-initialized');
    });
  });

  describe('Property mutability', () => {
    it('should allow modification of componentType', () => {
      const event = new ComponentInitializedEvent('page', 'page-1');

      event.componentType = 'row';
      expect(event.componentType).toBe('row');
    });

    it('should allow modification of componentId', () => {
      const event = new ComponentInitializedEvent('page', 'page-1');

      event.componentId = 'page-2';
      expect(event.componentId).toBe('page-2');
    });
  });

  describe('Component type validation', () => {
    it('should handle all valid component types', () => {
      const types: Array<'dynamic-form' | 'page' | 'row' | 'group'> = ['dynamic-form', 'page', 'row', 'group'];

      types.forEach((type) => {
        const event = new ComponentInitializedEvent(type, `${type}-1`);
        expect(event.componentType).toBe(type);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string component ID', () => {
      const event = new ComponentInitializedEvent('page', '');

      expect(event.componentId).toBe('');
    });

    it('should handle long component IDs', () => {
      const longId = 'very-long-component-id-with-many-segments-and-dashes';
      const event = new ComponentInitializedEvent('group', longId);

      expect(event.componentId).toBe(longId);
    });

    it('should handle component IDs with special characters', () => {
      const event = new ComponentInitializedEvent('row', 'row_123-abc.xyz');

      expect(event.componentId).toBe('row_123-abc.xyz');
    });

    it('should handle numeric-like component IDs', () => {
      const event = new ComponentInitializedEvent('page', '12345');

      expect(event.componentId).toBe('12345');
    });
  });

  describe('Event usage scenarios', () => {
    it('should track initialization of different component types', () => {
      const formEvent = new ComponentInitializedEvent('dynamic-form', 'main');
      const pageEvent = new ComponentInitializedEvent('page', 'step1');
      const rowEvent = new ComponentInitializedEvent('row', 'row1');
      const groupEvent = new ComponentInitializedEvent('group', 'address');

      const events = [formEvent, pageEvent, rowEvent, groupEvent];

      expect(events).toHaveLength(4);
      expect(events.map((e) => e.componentType)).toEqual(['dynamic-form', 'page', 'row', 'group']);
    });

    it('should differentiate between same type components by ID', () => {
      const page1 = new ComponentInitializedEvent('page', 'personal-info');
      const page2 = new ComponentInitializedEvent('page', 'contact-info');

      expect(page1.componentType).toBe(page2.componentType);
      expect(page1.componentId).not.toBe(page2.componentId);
    });
  });
});
