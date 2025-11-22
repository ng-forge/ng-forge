import { describe, it, expect } from 'vitest';
import { NextPageEvent } from './next-page.event';
import { FormEvent } from '../interfaces/form-event';

describe('NextPageEvent', () => {
  it('should create event with correct type', () => {
    const event = new NextPageEvent();

    expect(event).toBeInstanceOf(NextPageEvent);
    expect(event.type).toBe('next-page');
  });

  it('should implement FormEvent interface', () => {
    const event = new NextPageEvent();
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('next-page');
  });
});
