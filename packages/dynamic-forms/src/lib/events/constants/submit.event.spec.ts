import { describe, it, expect } from 'vitest';
import { SubmitEvent } from './submit.event';
import { FormEvent } from '@ng-forge/dynamic-forms/internal';

describe('SubmitEvent', () => {
  it('should create event with correct type', () => {
    const event = new SubmitEvent();

    expect(event).toBeInstanceOf(SubmitEvent);
    expect(event.type).toBe('submit');
  });

  it('should implement FormEvent interface', () => {
    const event = new SubmitEvent();
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('submit');
  });
});
