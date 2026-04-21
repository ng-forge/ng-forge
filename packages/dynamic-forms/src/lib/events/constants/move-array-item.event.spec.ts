import { describe, it, expect } from 'vitest';
import { MoveArrayItemEvent } from './move-array-item.event';

describe('MoveArrayItemEvent', () => {
  it('should create with arrayKey, fromIndex, and toIndex', () => {
    const event = new MoveArrayItemEvent('contacts', 0, 2);

    expect(event.arrayKey).toBe('contacts');
    expect(event.fromIndex).toBe(0);
    expect(event.toIndex).toBe(2);
  });

  it('should have correct type discriminant', () => {
    const event = new MoveArrayItemEvent('contacts', 1, 3);

    expect(event.type).toBe('move-array-item');
  });

  it('should accept same fromIndex and toIndex', () => {
    const event = new MoveArrayItemEvent('contacts', 2, 2);

    expect(event.fromIndex).toBe(2);
    expect(event.toIndex).toBe(2);
  });

  it('should accept zero as valid index', () => {
    const event = new MoveArrayItemEvent('contacts', 0, 0);

    expect(event.fromIndex).toBe(0);
    expect(event.toIndex).toBe(0);
  });
});
