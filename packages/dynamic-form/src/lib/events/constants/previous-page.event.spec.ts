import { describe, it, expect } from 'vitest';
import { PreviousPageEvent } from './previous-page.event';
import { FormEvent } from '../interfaces/form-event';

describe('PreviousPageEvent', () => {
  describe('Event creation', () => {
    it('should create event instance', () => {
      const event = new PreviousPageEvent();

      expect(event).toBeInstanceOf(PreviousPageEvent);
    });

    it('should create multiple independent instances', () => {
      const event1 = new PreviousPageEvent();
      const event2 = new PreviousPageEvent();

      expect(event1).toBeInstanceOf(PreviousPageEvent);
      expect(event2).toBeInstanceOf(PreviousPageEvent);
      expect(event1).not.toBe(event2);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new PreviousPageEvent();

      expect(event.type).toBe('previous-page');
    });

    it('should have const type literal', () => {
      const event = new PreviousPageEvent();
      const type: 'previous-page' = event.type;

      expect(type).toBe('previous-page');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new PreviousPageEvent();

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('previous-page');
    });

    it('should be assignable to FormEvent', () => {
      const events: FormEvent[] = [new PreviousPageEvent(), new PreviousPageEvent()];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('previous-page');
      expect(events[1].type).toBe('previous-page');
    });
  });

  describe('Event properties', () => {
    it('should only have type property', () => {
      const event = new PreviousPageEvent();
      const keys = Object.keys(event);

      expect(keys).toEqual(['type']);
    });

    it('should have no constructor parameters', () => {
      expect(() => new PreviousPageEvent()).not.toThrow();
    });
  });

  describe('Type consistency', () => {
    it('should maintain same type across instances', () => {
      const event1 = new PreviousPageEvent();
      const event2 = new PreviousPageEvent();

      expect(event1.type).toBe(event2.type);
      expect(event1.type).toBe('previous-page');
    });
  });
});
