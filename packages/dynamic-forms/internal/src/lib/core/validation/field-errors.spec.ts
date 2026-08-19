import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema, validate } from '@angular/forms/signals';
import { afterEach, describe, expect, it } from 'vitest';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { toReadonlyFieldTree } from '../field-tree-utils';
import { injectFieldErrors } from './field-errors';

/**
 * The helper serves both wrapper shapes, and they are NOT the same type: a leaf's
 * `fieldInputs.field` is a `ReadonlyFieldTree` (a plain object of signals, built by
 * `buildFieldInputs`), while a container has no `field` and its node is resolved from
 * the parent tree as a callable `FieldTree`. Both are exercised here with the real
 * shapes rather than a stand-in.
 */
describe('injectFieldErrors', () => {
  afterEach(() => TestBed.resetTestingModule());

  const settle = async (): Promise<void> => {
    for (let i = 0; i < 3; i++) {
      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  function configure(withContext: boolean, holder: { form?: unknown }) {
    TestBed.configureTestingModule({
      providers: [
        { provide: DynamicFormLogger, useClass: NoopLogger },
        { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(undefined) },
        ...(withContext
          ? [
              {
                provide: FIELD_SIGNAL_CONTEXT,
                useFactory: () => ({
                  injector: TestBed.inject(Injector),
                  value: signal({}),
                  defaultValues: () => ({}),
                  get form() {
                    return holder.form;
                  },
                }),
              },
            ]
          : []),
      ],
    });
  }

  describe('leaf shape (ReadonlyFieldTree in fieldInputs.field)', () => {
    function setup(value: string) {
      const holder: { form?: unknown } = {};
      configure(false, holder);

      const model = signal({ username: value });
      const root = TestBed.runInInjectionContext(() =>
        form(
          model,
          schema<{ username: string }>((path) => {
            validate(path.username, (ctx) => (ctx.value() === '' ? { kind: 'required' } : null));
          }),
        ),
      );
      const tree = (root as unknown as Record<string, never>)['username'] as unknown as () => { markAsTouched(): void };

      // Exactly what `buildFieldInputs` hands a wrapper.
      const fieldInputs = signal<WrapperFieldInputs | undefined>({
        key: 'username',
        field: toReadonlyFieldTree(tree as never),
        validationMessages: { required: 'Username is required' },
      } as unknown as WrapperFieldInputs);

      const api = TestBed.runInInjectionContext(() => injectFieldErrors({ fieldInputs, injector: TestBed.inject(Injector) }));
      return { api, markTouched: () => tree().markAsTouched() };
    }

    it('resolves the message once touched and invalid', async () => {
      const { api, markTouched } = setup('');
      markTouched();
      await settle();

      expect(api.showErrors()).toBe(true);
      expect(api.errorsToDisplay().map((e) => e.message)).toEqual(['Username is required']);
    });

    it('reports nothing while untouched', async () => {
      const { api } = setup('');
      await settle();

      expect(api.errorsToDisplay()).toEqual([]);
    });

    it('reports nothing when valid', async () => {
      const { api, markTouched } = setup('alice');
      markTouched();
      await settle();

      expect(api.errorsToDisplay()).toEqual([]);
    });
  });

  describe('container shape (no field; resolved by key from the parent tree)', () => {
    function setup(dateFrom: string, dateTo: string, key = 'period') {
      const holder: { form?: unknown } = {};
      configure(true, holder);

      const model = signal({ period: { dateFrom, dateTo } });
      const root = TestBed.runInInjectionContext(() =>
        form(
          model,
          schema<{ period: { dateFrom: string; dateTo: string } }>((path) => {
            validate(path.period, (ctx) => {
              const v = ctx.value() as { dateFrom: string; dateTo: string };
              return v.dateFrom && v.dateTo && v.dateTo < v.dateFrom ? { kind: 'dateOrder' } : null;
            });
          }),
        ),
      );
      holder.form = root;

      const fieldInputs = signal<WrapperFieldInputs | undefined>({ key } as WrapperFieldInputs);
      const validationMessages = signal<Record<string, string> | undefined>({ dateOrder: 'The end must not be before the start.' });

      const api = TestBed.runInInjectionContext(() =>
        injectFieldErrors({ fieldInputs, validationMessages, injector: TestBed.inject(Injector) }),
      );
      return { api, markTouched: () => (root as unknown as { period: () => { markAsTouched(): void } }).period().markAsTouched() };
    }

    it('resolves the container message once touched and invalid', async () => {
      const { api, markTouched } = setup('2026-02-01', '2026-01-01');
      markTouched();
      await settle();

      expect(api.errorsToDisplay().map((e) => e.message)).toEqual(['The end must not be before the start.']);
    });

    it('reports nothing when the key matches no node', async () => {
      const { api, markTouched } = setup('2026-02-01', '2026-01-01', 'notAField');
      markTouched();
      await settle();

      expect(api.errorsToDisplay()).toEqual([]);
    });
  });

  it('derives a stable error id from the key for aria wiring', () => {
    configure(false, {});
    const fieldInputs = signal<WrapperFieldInputs | undefined>({ key: 'username' } as WrapperFieldInputs);
    const api = TestBed.runInInjectionContext(() => injectFieldErrors({ fieldInputs, injector: TestBed.inject(Injector) }));

    expect(api.errorId()).toBe('username-error');
  });
});
