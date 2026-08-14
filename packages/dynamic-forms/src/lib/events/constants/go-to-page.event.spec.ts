import { describe, it, expect } from 'vitest';
import { GoToPageEvent } from './go-to-page.event';
import { FormEvent } from '@ng-forge/dynamic-forms/internal';

describe('GoToPageEvent', () => {
  it('should create event with correct type and page index', () => {
    const event = new GoToPageEvent(2);

    expect(event).toBeInstanceOf(GoToPageEvent);
    expect(event.type).toBe('go-to-page');
    expect(event.pageIndex).toBe(2);
  });

  it('should implement FormEvent interface', () => {
    const event = new GoToPageEvent(0);
    const formEvent: FormEvent = event;

    expect(formEvent.type).toBe('go-to-page');
  });
});
