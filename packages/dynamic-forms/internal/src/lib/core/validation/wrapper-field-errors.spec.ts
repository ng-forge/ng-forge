import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema, validate } from '@angular/forms/signals';
import { afterEach, describe, expect, it } from 'vitest';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { DEFAULT_VALIDATION_MESSAGES } from '../../models/field-signal-context.token';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { injectFieldErrors } from './wrapper-field-errors';

/**
 * A wrapper cannot inject `NgForgeField` — it is constructed before the field
 * component exists — so this helper gives it the same error surface from the
 * `fieldInputs` bag it already receives.
 */
describe('injectFieldErrors', () => {
  afterEach(() => TestBed.resetTestingModule());

  /** Message resolution runs through toObservable/toSignal, so it needs a tick. */
  const settle = async (): Promise<void> => {
    for (let i = 0; i < 3; i++) {
      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  function setup(email: string, opts: { messages?: Record<string, string>; defaults?: Record<string, string> } = {}) {
    TestBed.configureTestingModule({
      providers: [
        { provide: DynamicFormLogger, useClass: NoopLogger },
        { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(opts.defaults) },
      ],
    });

    const value = signal({ email });
    const f = TestBed.runInInjectionContext(() =>
      form(
        value,
        schema<{ email: string }>((path) => {
          validate(path.email, (ctx) => (ctx.value() === '' ? { kind: 'required' } : null));
        }),
      ),
    );

    const emailTree = (f as unknown as Record<string, unknown>)['email'];
    const fieldInputs = signal<WrapperFieldInputs | undefined>({
      key: 'email',
      field: emailTree,
      validationMessages: opts.messages,
    } as unknown as WrapperFieldInputs);

    const api = TestBed.runInInjectionContext(() => injectFieldErrors({ fieldInputs, injector: TestBed.inject(Injector) }));
    const markTouched = () => (emailTree as () => { markAsTouched(): void })().markAsTouched();

    return { api, markTouched };
  }

  it('exposes no errors to display while the field is untouched', async () => {
    const { api } = setup('', { messages: { required: 'Email is required' } });
    await settle();

    expect(api.showErrors()).toBe(false);
    expect(api.errorsToDisplay()).toEqual([]);
  });

  it('resolves the message from the wrapped field once touched', async () => {
    const { api, markTouched } = setup('', { messages: { required: 'Email is required' } });

    markTouched();
    await settle();

    expect(api.showErrors()).toBe(true);
    expect(api.errorsToDisplay().map((e) => e.message)).toEqual(['Email is required']);
  });

  it('falls back to form-level default messages', async () => {
    const { api, markTouched } = setup('', { defaults: { required: 'This field is required' } });

    markTouched();
    await settle();

    expect(api.errorsToDisplay().map((e) => e.message)).toEqual(['This field is required']);
  });

  it('reports no errors when the field is valid', async () => {
    const { api, markTouched } = setup('a@b.com', { messages: { required: 'Email is required' } });

    markTouched();
    await settle();

    expect(api.errorsToDisplay()).toEqual([]);
  });

  it('derives a stable error id from the field key for aria wiring', () => {
    const { api } = setup('');

    expect(api.errorId()).toBe('email-error');
  });
});
