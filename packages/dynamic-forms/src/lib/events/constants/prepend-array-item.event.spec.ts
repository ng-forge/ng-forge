import { describe, it, expect } from 'vitest';
import { PrependArrayItemEvent } from './prepend-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('PrependArrayItemEvent', () => {
  it('should create event with correct type', () => {
    const event = new PrependArrayItemEvent('contacts');

    expect(event).toBeInstanceOf(PrependArrayItemEvent);
    expect(event.type).toBe('prepend-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new PrependArrayItemEvent('contacts');
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('prepend-array-item');
  });

  it('should store arrayKey', () => {
    const event = new PrependArrayItemEvent('contacts');

    expect(event.arrayKey).toBe('contacts');
  });

  it('should have undefined template by default', () => {
    const event = new PrependArrayItemEvent('contacts');

    expect(event.template).toBeUndefined();
  });

  it('should store provided template', () => {
    const template = [{ key: 'name', type: 'input' as const }];
    const event = new PrependArrayItemEvent('contacts', template);

    expect(event.template).toEqual(template);
  });
});
