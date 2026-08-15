import { Component, Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, schema, validate } from '@angular/forms/signals';
import { DynamicFormLogger, NoopLogger } from '@ng-forge/dynamic-forms';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms/integration';
import { afterEach, describe, expect, it } from 'vitest';
import PrimeContainerErrorsWrapperComponent from './prime-container-errors-wrapper.component';

/**
 * The wrapper resolves the container's own node from the PARENT tree exposed by
 * `FIELD_SIGNAL_CONTEXT`, so the harness supplies a parent form holding a
 * `period` group with a real group-level validator — the same shape
 * `mapFieldToForm` produces for a container that declares `validators`.
 */
@Component({
  imports: [PrimeContainerErrorsWrapperComponent],
  template: `<df-prime-container-errors [fieldInputs]="inputs" [validationMessages]="messages" />`,
})
class Host {
  readonly inputs = { key: 'period' } as never;
  readonly messages = { dateOrder: 'The end must not be before the start.' };
}

describe('PrimeContainerErrorsWrapperComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  function setup(dateFrom: string, dateTo: string) {
    const value = signal({ period: { dateFrom, dateTo } });
    // The form can only be built once the TestBed module exists, but the
    // context provider must be registered before that. The holder closes the
    // gap: the factory reads it lazily, at component-injection time.
    const holder: { form?: unknown } = {};

    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: DynamicFormLogger, useClass: NoopLogger },
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useFactory: () => ({
            injector: TestBed.inject(Injector),
            value,
            defaultValues: () => ({}),
            get form() {
              return holder.form;
            },
          }),
        },
      ],
    });

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

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, parentForm };
  }

  const errorTexts = (fixture: ComponentFixture<Host>): string[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('small.p-error')).map((el) => el.textContent?.trim() ?? '');

  const settle = async (fixture: ComponentFixture<Host>): Promise<void> => {
    for (let i = 0; i < 3; i++) {
      fixture.detectChanges();
      await fixture.whenStable();
    }
  };

  it('renders nothing while the container is untouched', async () => {
    const { fixture } = setup('2026-02-01', '2026-01-01');
    await settle(fixture);

    // Invalid, but untouched — same suppression rule as a leaf field.
    expect(errorTexts(fixture)).toEqual([]);
  });

  it('renders a small.p-error message once touched and invalid', async () => {
    const { fixture, parentForm } = setup('2026-02-01', '2026-01-01');

    (parentForm as unknown as { period: () => { markAsTouched(): void } }).period().markAsTouched();
    await settle(fixture);

    expect(errorTexts(fixture)).toEqual(['The end must not be before the start.']);
  });

  it('renders nothing when the container is valid', async () => {
    const { fixture, parentForm } = setup('2026-01-01', '2026-02-01');

    (parentForm as unknown as { period: () => { markAsTouched(): void } }).period().markAsTouched();
    await settle(fixture);

    expect(errorTexts(fixture)).toEqual([]);
  });
});
