import { describe, it, expect } from 'vitest';
import { NextPageEvent } from './next-page.event';
import { FormEvent } from '../interfaces/form-event';

describe('NextPageEvent', () => {
  describe('Event creation', () => {
    it('should create event instance', () => {
      const event = new NextPageEvent();

      expect(event).toBeInstanceOf(NextPageEvent);
    });

    it('should create multiple independent instances', () => {
      const event1 = new NextPageEvent();
      const event2 = new NextPageEvent();

      expect(event1).toBeInstanceOf(NextPageEvent);
      expect(event2).toBeInstanceOf(NextPageEvent);
      expect(event1).not.toBe(event2);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new NextPageEvent();

      expect(event.type).toBe('next-page');
    });

    it('should have const type literal', () => {
      const event = new NextPageEvent();
      const type: 'next-page' = event.type;

      expect(type).toBe('next-page');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new NextPageEvent();

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('next-page');
    });

    it('should be assignable to FormEvent', () => {
      const events: FormEvent[] = [new NextPageEvent(), new NextPageEvent()];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('next-page');
      expect(events[1].type).toBe('next-page');
    });
  });

  describe('Event properties', () => {
    it('should only have type property', () => {
      const event = new NextPageEvent();
      const keys = Object.keys(event);

      expect(keys).toEqual(['type']);
    });

    it('should have no constructor parameters', () => {
      expect(() => new NextPageEvent()).not.toThrow();
    });
  });

  describe('Type consistency', () => {
    it('should maintain same type across instances', () => {
      const event1 = new NextPageEvent();
      const event2 = new NextPageEvent();

      expect(event1.type).toBe(event2.type);
      expect(event1.type).toBe('next-page');
    });
  });
});
