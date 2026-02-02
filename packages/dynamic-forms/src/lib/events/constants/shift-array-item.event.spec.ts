import { describe, it, expect } from 'vitest';
import { ShiftArrayItemEvent } from './shift-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('ShiftArrayItemEvent', () => {
  it('should create event with correct type', () => {
    const event = new ShiftArrayItemEvent('contacts');

    expect(event).toBeInstanceOf(ShiftArrayItemEvent);
    expect(event.type).toBe('shift-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new ShiftArrayItemEvent('contacts');
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('shift-array-item');
  });

  it('should store arrayKey', () => {
    const event = new ShiftArrayItemEvent('contacts');

    expect(event.arrayKey).toBe('contacts');
  });
});
