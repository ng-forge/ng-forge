import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema, validate } from '@angular/forms/signals';
import { afterEach, describe, expect, it } from 'vitest';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { injectContainerErrors } from './container-errors';

/**
 * `FIELD_SIGNAL_CONTEXT` in a wrapper is the container's PARENT tree, so the helper
 * resolves the container's own node by key. Until now this was only covered
 * indirectly, through the five wrapper components that call it.
 */
describe('injectContainerErrors', () => {
  afterEach(() => TestBed.resetTestingModule());

  const settle = async (): Promise<void> => {
    for (let i = 0; i < 3; i++) {
      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  function setup(dateFrom: string, dateTo: string, key = 'period') {
    const holder: { form?: unknown } = {};

    TestBed.configureTestingModule({
      providers: [
        { provide: DynamicFormLogger, useClass: NoopLogger },
        { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(undefined) },
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
      ],
    });

    const value = signal({ period: { dateFrom, dateTo } });
    const parentForm = TestBed.runInInjectionContext(() =>
      form(
        value,
        schema<{ period: { dateFrom: string; dateTo: string } }>((path) => {
          validate(path.period, (ctx) => {
            const v = ctx.value() as { dateFrom: string; dateTo: string };
            return v.dateFrom && v.dateTo && v.dateTo < v.dateFrom ? { kind: 'dateOrder' } : null;
          });
        }),
      ),
    );
    holder.form = parentForm;

    const fieldInputs = signal<WrapperFieldInputs | undefined>({ key } as WrapperFieldInputs);
    const validationMessages = signal<Record<string, string> | undefined>({ dateOrder: 'The end must not be before the start.' });

    const errors = TestBed.runInInjectionContext(() =>
      injectContainerErrors({ fieldInputs, validationMessages, injector: TestBed.inject(Injector) }),
    );
    const markTouched = () => (parentForm as unknown as { period: () => { markAsTouched(): void } }).period().markAsTouched();

    return { errors, markTouched, fieldInputs };
  }

  it('resolves the container message once touched and invalid', async () => {
    const { errors, markTouched } = setup('2026-02-01', '2026-01-01');

    markTouched();
    await settle();

    expect(errors().map((e) => e.message)).toEqual(['The end must not be before the start.']);
  });

  it('stays empty while the container is untouched', async () => {
    const { errors } = setup('2026-02-01', '2026-01-01');
    await settle();

    expect(errors()).toEqual([]);
  });

  it('stays empty when the container is valid', async () => {
    const { errors, markTouched } = setup('2026-01-01', '2026-02-01');

    markTouched();
    await settle();

    expect(errors()).toEqual([]);
  });

  it('stays empty when the key matches no node in the parent tree', async () => {
    const { errors, markTouched } = setup('2026-02-01', '2026-01-01', 'notAField');

    markTouched();
    await settle();

    // Resolving to no node must render nothing rather than throw.
    expect(errors()).toEqual([]);
  });
});
