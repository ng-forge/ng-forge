import { describe, it, expect } from 'vitest';
import { InsertArrayItemEvent } from './insert-array-item.event';
import { FormEvent } from '../interfaces/form-event';

describe('InsertArrayItemEvent', () => {
  it('should create event with correct type', () => {
    const event = new InsertArrayItemEvent('contacts', 2);

    expect(event).toBeInstanceOf(InsertArrayItemEvent);
    expect(event.type).toBe('insert-array-item');
  });

  it('should implement FormEvent interface', () => {
    const event = new InsertArrayItemEvent('contacts', 2);
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('insert-array-item');
  });

  it('should store arrayKey', () => {
    const event = new InsertArrayItemEvent('contacts', 2);

    expect(event.arrayKey).toBe('contacts');
  });

  it('should store index', () => {
    const event = new InsertArrayItemEvent('contacts', 5);

    expect(event.index).toBe(5);
  });

  it('should have undefined template by default', () => {
    const event = new InsertArrayItemEvent('contacts', 0);

    expect(event.template).toBeUndefined();
  });

  it('should store provided template', () => {
    const template = [{ key: 'name', type: 'input' as const }];
    const event = new InsertArrayItemEvent('contacts', 1, template);

    expect(event.template).toEqual(template);
  });

  it('should accept zero as valid index', () => {
    const event = new InsertArrayItemEvent('contacts', 0);

    expect(event.index).toBe(0);
  });
});
