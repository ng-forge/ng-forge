import { describe, it, expect } from 'vitest';
import { SubmitEvent } from './submit.event';
import { FormEvent } from '../interfaces/form-event';

describe('SubmitEvent', () => {
  describe('Event creation', () => {
    it('should create event instance', () => {
      const event = new SubmitEvent();

      expect(event).toBeInstanceOf(SubmitEvent);
    });

    it('should create multiple independent instances', () => {
      const event1 = new SubmitEvent();
      const event2 = new SubmitEvent();

      expect(event1).toBeInstanceOf(SubmitEvent);
      expect(event2).toBeInstanceOf(SubmitEvent);
      expect(event1).not.toBe(event2);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new SubmitEvent();

      expect(event.type).toBe('submit');
    });

    it('should have const type literal', () => {
      const event = new SubmitEvent();
      const type: 'submit' = event.type;

      expect(type).toBe('submit');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new SubmitEvent();

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('submit');
    });

    it('should be assignable to FormEvent', () => {
      const events: FormEvent[] = [new SubmitEvent(), new SubmitEvent()];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('submit');
      expect(events[1].type).toBe('submit');
    });
  });

  describe('Event properties', () => {
    it('should only have type property', () => {
      const event = new SubmitEvent();
      const keys = Object.keys(event);

      expect(keys).toEqual(['type']);
    });

    it('should have no constructor parameters', () => {
      expect(() => new SubmitEvent()).not.toThrow();
    });
  });

  describe('Type consistency', () => {
    it('should maintain same type across instances', () => {
      const event1 = new SubmitEvent();
      const event2 = new SubmitEvent();

      expect(event1.type).toBe(event2.type);
      expect(event1.type).toBe('submit');
    });
  });
});
