import { describe, it, expect } from 'vitest';
import { PrependArrayItemEvent } from './prepend-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('PrependArrayItemEvent', () => {
  const defaultTemplate = [{ key: 'name', type: 'input' as const }];

  it('should create event with correct type', () => {
    const event = new PrependArrayItemEvent('contacts', defaultTemplate);

    expect(event).toBeInstanceOf(PrependArrayItemEvent);
    expect(event.type).toBe('prepend-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new PrependArrayItemEvent('contacts', defaultTemplate);
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('prepend-array-item');
  });

  it('should store arrayKey', () => {
    const event = new PrependArrayItemEvent('contacts', defaultTemplate);

    expect(event.arrayKey).toBe('contacts');
  });

  it('should store required template', () => {
    const template = [{ key: 'name', type: 'input' as const }];
    const event = new PrependArrayItemEvent('contacts', template);

    expect(event.template).toEqual(template);
  });

  it('should accept array of field definitions as template', () => {
    const template = [
      { key: 'name', type: 'input' as const, label: 'Name' },
      { key: 'email', type: 'input' as const, label: 'Email' },
    ];
    const event = new PrependArrayItemEvent('contacts', template);

    expect(event.template).toHaveLength(2);
    expect(event.template[0].key).toBe('name');
    expect(event.template[1].key).toBe('email');
  });
});
