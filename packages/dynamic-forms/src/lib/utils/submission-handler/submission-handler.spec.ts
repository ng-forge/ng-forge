import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal, type Signal } from '@angular/core';
import { form, type FieldTree } from '@angular/forms/signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Subscription } from 'rxjs';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { SubmitEvent } from '../../events/constants/submit.event';
import type { FormConfig } from '@ng-forge/dynamic-forms/internal';
import type { Logger } from '@ng-forge/dynamic-forms/internal';
import { createSubmissionHandler } from './submission-handler';

// The submission handler had no dedicated coverage. These tests pin its guard contract:
// the configured submission.action runs only when the form is valid. Angular Signal Forms
// reports valid() === false while async validators are pending, so "not valid" here also
// covers the submit-while-async-pending case (issue: pending async at submit time).

type Model = { email: string };

const makeLogger = (): Logger => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() });
const tick = (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('createSubmissionHandler', () => {
  let injector: Injector;
  let eventBus: EventBus;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EventBus] });
    injector = TestBed.inject(Injector);
    eventBus = TestBed.inject(EventBus);
  });

  function start(valid: boolean, action?: (form: FieldTree<Model>) => unknown): Subscription {
    return runInInjectionContext(injector, () => {
      const formInstance = form(signal<Model>({ email: 'a@b.com' }));
      const config = { fields: [], submission: action ? { action } : undefined } as unknown as FormConfig;
      const handler$ = createSubmissionHandler({
        eventBus,
        configSignal: signal(config),
        formSignal: signal(formInstance) as unknown as Signal<FieldTree<Record<string, unknown>>>,
        validSignal: signal(valid),
        logger: makeLogger(),
      });
      return handler$.subscribe();
    });
  }

  const dispatchSubmit = () => runInInjectionContext(injector, () => eventBus.dispatch(new SubmitEvent()));

  it('skips the submission action when the form is not valid (invalid OR pending async validators)', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const sub = start(false, action);
    dispatchSubmit();
    await tick(15);
    expect(action).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('runs the submission action when the form is valid', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const sub = start(true, action);
    dispatchSubmit();
    await tick(25);
    expect(action).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
  });

  it('does nothing (no throw) when no submission.action is configured', async () => {
    const sub = start(true, undefined);
    expect(() => dispatchSubmit()).not.toThrow();
    await tick(15);
    sub.unsubscribe();
  });

  it('drops a second submit while the first is in-flight (exhaustMap first-wins)', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const action = vi.fn().mockReturnValue(gate);
    const sub = start(true, action);
    runInInjectionContext(injector, () => {
      eventBus.dispatch(new SubmitEvent());
      eventBus.dispatch(new SubmitEvent());
    });
    await tick(15);
    expect(action).toHaveBeenCalledTimes(1);
    release();
    await tick(15);
    sub.unsubscribe();
  });
});
