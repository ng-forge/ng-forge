import { describe, it, expect } from 'vitest';
import { InsertArrayItemEvent } from './insert-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('InsertArrayItemEvent', () => {
  const defaultTemplate = [{ key: 'name', type: 'input' as const }];

  it('should create event with correct type', () => {
    const event = new InsertArrayItemEvent('contacts', 2, defaultTemplate);

    expect(event).toBeInstanceOf(InsertArrayItemEvent);
    expect(event.type).toBe('insert-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new InsertArrayItemEvent('contacts', 2, defaultTemplate);
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('insert-array-item');
  });

  it('should store arrayKey', () => {
    const event = new InsertArrayItemEvent('contacts', 2, defaultTemplate);

    expect(event.arrayKey).toBe('contacts');
  });

  it('should store index', () => {
    const event = new InsertArrayItemEvent('contacts', 5, defaultTemplate);

    expect(event.index).toBe(5);
  });

  it('should store required template', () => {
    const template = [{ key: 'name', type: 'input' as const }];
    const event = new InsertArrayItemEvent('contacts', 1, template);

    expect(event.template).toEqual(template);
  });

  it('should accept zero as valid index', () => {
    const event = new InsertArrayItemEvent('contacts', 0, defaultTemplate);

    expect(event.index).toBe(0);
  });

  it('should accept array of field definitions as template', () => {
    const template = [
      { key: 'name', type: 'input' as const, label: 'Name' },
      { key: 'email', type: 'input' as const, label: 'Email' },
    ];
    const event = new InsertArrayItemEvent('contacts', 2, template);

    expect(event.template).toHaveLength(2);
    expect(event.template[0].key).toBe('name');
    expect(event.template[1].key).toBe('email');
  });
});
