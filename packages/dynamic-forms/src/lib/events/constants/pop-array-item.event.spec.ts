import { describe, it, expect } from 'vitest';
import { PopArrayItemEvent } from './pop-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('PopArrayItemEvent', () => {
  it('should create event with correct type', () => {
    const event = new PopArrayItemEvent('contacts');

    expect(event).toBeInstanceOf(PopArrayItemEvent);
    expect(event.type).toBe('pop-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new PopArrayItemEvent('contacts');
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('pop-array-item');
  });

  it('should store arrayKey', () => {
    const event = new PopArrayItemEvent('contacts');

    expect(event.arrayKey).toBe('contacts');
  });
});
