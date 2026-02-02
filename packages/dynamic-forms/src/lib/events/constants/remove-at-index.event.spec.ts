import { describe, it, expect } from 'vitest';
import { RemoveAtIndexEvent } from './remove-at-index.event';
import { FormEvent } from '../interfaces/form-event';

describe('RemoveAtIndexEvent', () => {
  it('should create event with correct type', () => {
    const event = new RemoveAtIndexEvent('contacts', 2);

    expect(event).toBeInstanceOf(RemoveAtIndexEvent);
    expect(event.type).toBe('remove-at-index');
  });

  it('should implement FormEvent interface', () => {
    const event = new RemoveAtIndexEvent('contacts', 2);
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('remove-at-index');
  });

  it('should store arrayKey', () => {
    const event = new RemoveAtIndexEvent('contacts', 2);

    expect(event.arrayKey).toBe('contacts');
  });

  it('should store index', () => {
    const event = new RemoveAtIndexEvent('contacts', 5);

    expect(event.index).toBe(5);
  });

  it('should accept zero as valid index', () => {
    const event = new RemoveAtIndexEvent('contacts', 0);

    expect(event.index).toBe(0);
  });
});
