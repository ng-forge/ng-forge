import { describe, it, expect } from 'vitest';
import { PreviousPageEvent } from './previous-page.event';
import { FormEvent } from '../interfaces/form-event';

describe('PreviousPageEvent', () => {
  it('should create event with correct type', () => {
    const event = new PreviousPageEvent();

    expect(event).toBeInstanceOf(PreviousPageEvent);
    expect(event.type).toBe('previous-page');
  });

  it('should implement FormEvent interface', () => {
    const event = new PreviousPageEvent();
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('previous-page');
  });
});
