import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal, type Signal } from '@angular/core';
import { form, type FieldTree } from '@angular/forms/signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError, timer, type Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormSubmitEvent } from '../../events/constants/submit.event';
import type { FormConfig } from '@ng-forge/dynamic-forms/internal';
import type { Logger } from '@ng-forge/dynamic-forms/internal';
import { createSubmissionHandler } from './submission-handler';
import { createPendingSubmission } from './submission-outcome';

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

  function start<M extends Record<string, unknown> = Model>(
    valid: boolean,
    action?: (form: FieldTree<M>) => unknown,
    initial: M = { email: 'a@b.com' } as unknown as M,
  ): { sub: Subscription; formInstance: FieldTree<M>; logger: Logger } {
    return runInInjectionContext(injector, () => {
      const formInstance = form(signal<M>(initial));
      const config = { fields: [], submission: action ? { action } : undefined } as unknown as FormConfig;
      const logger = makeLogger();
      const handler$ = createSubmissionHandler({
        eventBus,
        configSignal: signal(config),
        formSignal: signal(formInstance) as unknown as Signal<FieldTree<Record<string, unknown>>>,
        validSignal: signal(valid),
        logger,
      });
      return { sub: handler$.subscribe(), formInstance, logger };
    });
  }

  const dispatchSubmit = () => runInInjectionContext(injector, () => eventBus.dispatch(new FormSubmitEvent()));

  it('skips the submission action when the form is not valid (invalid OR pending async validators)', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { sub } = start(false, action);
    dispatchSubmit();
    await tick(15);
    expect(action).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('runs the submission action when the form is valid', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { sub } = start(true, action);
    dispatchSubmit();
    await tick(25);
    expect(action).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
  });

  it('does nothing (no throw) when no submission.action is configured', async () => {
    const { sub } = start(true, undefined);
    expect(() => dispatchSubmit()).not.toThrow();
    await tick(15);
    sub.unsubscribe();
  });

  it('drops a second submit while the first is in-flight (exhaustMap first-wins)', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const action = vi.fn().mockReturnValue(gate);
    const { sub } = start(true, action);
    runInInjectionContext(injector, () => {
      eventBus.dispatch(new FormSubmitEvent());
      eventBus.dispatch(new FormSubmitEvent());
    });
    await tick(15);
    expect(action).toHaveBeenCalledTimes(1);
    release();
    await tick(15);
    sub.unsubscribe();
  });

  // ─── Observable actions (wrapSubmissionAction) ──────────────────────────────

  it('awaits an Observable action before completing the submission', async () => {
    let resolved = false;
    const action = vi.fn().mockImplementation(() => timer(20).pipe(map(() => (resolved = true))));
    const { sub, formInstance } = start(true, action);

    dispatchSubmit();
    await tick(5);
    expect(resolved).toBe(false);

    await tick(40);
    expect(resolved).toBe(true);
    expect(formInstance().submitting()).toBe(false);
    sub.unsubscribe();
  });

  it('uses only the first emission of a multi-emit Observable action', async () => {
    const subject = new Subject<undefined>();
    const seen: number[] = [];
    const action = vi.fn().mockImplementation(() =>
      subject.pipe(
        map(() => {
          seen.push(seen.length + 1);
          return undefined;
        }),
      ),
    );
    const { sub } = start(true, action);

    dispatchSubmit();
    await tick(5);
    subject.next(undefined);
    subject.next(undefined);
    subject.next(undefined);
    await tick(15);

    // firstValueFrom unsubscribes after the first emission.
    expect(seen).toEqual([1]);
    sub.unsubscribe();
  });

  // ─── submitting() lifecycle ─────────────────────────────────────────────────

  it('holds submitting() true for the duration of the action and clears it after', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let submittingDuringAction: boolean | undefined;
    const { sub, formInstance } = start(true, (f) => {
      submittingDuringAction = f().submitting();
      return gate;
    });

    expect(formInstance().submitting()).toBe(false);
    dispatchSubmit();
    await tick(15);

    expect(submittingDuringAction).toBe(true);
    expect(formInstance().submitting()).toBe(true);

    release();
    await tick(15);
    expect(formInstance().submitting()).toBe(false);
    sub.unsubscribe();
  });

  // ─── Failure resilience (the catchError contract) ────────────────────────────

  it('keeps accepting submissions after the action rejects', async () => {
    const action = vi.fn().mockRejectedValueOnce(new Error('network down')).mockResolvedValue(undefined);
    const { sub } = start(true, action);

    dispatchSubmit();
    await tick(25);
    expect(action).toHaveBeenCalledTimes(1);

    // Without catchError in the handler the stream would be dead here.
    dispatchSubmit();
    await tick(25);
    expect(action).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
  });

  it('keeps accepting submissions after an Observable action errors', async () => {
    const action = vi
      .fn()
      .mockImplementationOnce(() => throwError(() => new Error('network down')))
      .mockImplementation(() => of(undefined));
    const { sub } = start(true, action);

    dispatchSubmit();
    await tick(25);
    dispatchSubmit();
    await tick(25);

    expect(action).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
  });

  it('logs the failure when the action rejects', async () => {
    const action = vi.fn().mockRejectedValue(new Error('network down'));
    const { sub, logger } = start(true, action);

    dispatchSubmit();
    await tick(25);

    expect(logger.error).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('treats a non-error return value as a successful submission', async () => {
    const action = vi.fn().mockResolvedValue({ id: 123, status: 'created' });
    const { sub, formInstance, logger } = start(true, action);

    dispatchSubmit();
    await tick(25);

    expect(formInstance().submitting()).toBe(false);
    expect(logger.error).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  // ─── Submitted payload (issue #341 nullable contract) ───────────────────────

  it('passes an untouched nullable field through to the action as null', async () => {
    type Profile = { firstName: string; middleName: string | null; age: number | null };
    let payload: Profile | undefined;
    const { sub } = start<Profile>(
      true,
      (f) => {
        payload = f().value();
        return Promise.resolve(undefined);
      },
      { firstName: 'Jane', middleName: null, age: null },
    );

    dispatchSubmit();
    await tick(25);

    expect(payload).toEqual({ firstName: 'Jane', middleName: null, age: null });
    sub.unsubscribe();
  });

  it('passes "" (not null) for a nullable text field that was typed then cleared', async () => {
    // Web IDL contract: a cleared text input reads back as "", never null.
    type Profile = { middleName: string | null };
    let payload: Profile | undefined;
    const { sub } = start<Profile>(
      true,
      (f) => {
        payload = f().value();
        return Promise.resolve(undefined);
      },
      { middleName: '' },
    );

    dispatchSubmit();
    await tick(25);

    expect(payload).toEqual({ middleName: '' });
    sub.unsubscribe();
  });
  // ─── Server errors returned by the action ───────────────────────────────────

  it('applies server errors returned by the action to the target field', async () => {
    type Account = { username: string };
    const { sub, formInstance } = start<Account>(
      true,
      (f) => Promise.resolve([{ kind: 'server', message: 'Username taken', fieldTree: f.username }]),
      { username: 'takenname' },
    );

    dispatchSubmit();
    await tick(25);

    expect(
      formInstance
        .username()
        .errors()
        .some((e) => e.kind === 'server'),
    ).toBe(true);
    sub.unsubscribe();
  });

  it('applies server errors returned by an Observable action', async () => {
    type Account = { username: string };
    const { sub, formInstance } = start<Account>(true, (f) => of([{ kind: 'server', message: 'Username taken', fieldTree: f.username }]), {
      username: 'takenname',
    });

    dispatchSubmit();
    await tick(25);

    expect(
      formInstance
        .username()
        .errors()
        .some((e) => e.kind === 'server'),
    ).toBe(true);
    sub.unsubscribe();
  });

  it('does not treat a success payload as a validation error', async () => {
    // An Observable action is usually an HTTP call resolving to a response body;
    // that body must reach submit() as success, not as a server error.
    type Account = { username: string };
    const { sub, formInstance } = start<Account>(true, () => of({ id: 123, status: 'created' }), { username: 'freename' });

    dispatchSubmit();
    await tick(25);

    expect(formInstance.username().errors()).toEqual([]);
    expect(formInstance().valid()).toBe(true);
    sub.unsubscribe();
  });

  describe('outcome reporting', () => {
    // A caller that has to report back — an agent tool call above all — cannot
    // use fire-and-forget dispatch: the pipeline drops, skips and swallows in
    // ways that are invisible from the outside. These pin what the reply says.
    const dispatchAndWait = () => {
      const pending = createPendingSubmission();
      runInInjectionContext(injector, () => eventBus.dispatch(new FormSubmitEvent(pending.reply)));
      return pending;
    };

    it('reports success once a resolved action has finished', async () => {
      const { sub } = start(true, () => timer(20));

      const pending = dispatchAndWait();
      await tick(40);

      await expect(pending.outcome).resolves.toEqual({ status: 'success' });
      sub.unsubscribe();
    });

    it('does not resolve before the action does', async () => {
      const { sub } = start(true, () => timer(40));
      const settled = vi.fn();

      const pending = dispatchAndWait();
      void pending.outcome.then(settled);
      await tick(15);

      expect(settled).not.toHaveBeenCalled();
      sub.unsubscribe();
    });

    it('reports a rejected action as a failure rather than a success', async () => {
      const error = new Error('gateway exploded');
      const { sub } = start(true, () => Promise.reject(error));

      const pending = dispatchAndWait();
      await tick(25);

      await expect(pending.outcome).resolves.toEqual({ status: 'action-failed', error });
      sub.unsubscribe();
    });

    it('reports server errors returned by the action', async () => {
      type Account = { username: string };
      const { sub } = start<Account>(true, (f) => of([{ kind: 'server', message: 'Username taken', fieldTree: f.username }]), {
        username: 'takenname',
      });

      const pending = dispatchAndWait();
      await tick(25);

      await expect(pending.outcome).resolves.toEqual({ status: 'server-errors' });
      sub.unsubscribe();
    });

    it('reports a skipped submission on an invalid form', async () => {
      const { sub } = start(false, vi.fn());

      const pending = dispatchAndWait();
      await tick(15);

      await expect(pending.outcome).resolves.toEqual({ status: 'validation-failed' });
      sub.unsubscribe();
    });

    it('reports a dispatch that the page handles itself', async () => {
      const { sub } = start(true);

      const pending = dispatchAndWait();
      await tick(15);

      await expect(pending.outcome).resolves.toEqual({ status: 'dispatched' });
      sub.unsubscribe();
    });

    it('leaves a dropped second submission unaccepted, so the caller can call it busy', async () => {
      const { sub } = start(true, () => timer(40));

      const first = dispatchAndWait();
      const second = dispatchAndWait();

      expect(first.accepted()).toBe(true);
      expect(second.accepted()).toBe(false);

      await tick(60);
      await expect(first.outcome).resolves.toEqual({ status: 'success' });
      sub.unsubscribe();
    });

    it('leaves a plain button submit unaffected', async () => {
      const action = vi.fn().mockResolvedValue(undefined);
      const { sub } = start(true, action);

      expect(() => dispatchSubmit()).not.toThrow();
      await tick(25);

      expect(action).toHaveBeenCalledOnce();
      sub.unsubscribe();
    });
  });
});
