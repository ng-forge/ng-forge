import { describe, it, expect } from 'vitest';
import { FormSubmitEvent } from './submit.event';
import { FormEvent } from '@ng-forge/dynamic-forms/internal';

describe('FormSubmitEvent', () => {
  it('should create event with correct type', () => {
    const event = new FormSubmitEvent();

    expect(event).toBeInstanceOf(FormSubmitEvent);
    expect(event.type).toBe('submit');
  });

  it('should implement FormEvent interface', () => {
    const event = new FormSubmitEvent();
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('submit');
  });
});
