import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '../../providers/features/logger/logger.interface';
import { createHttpPropertyDerivationStream, HttpPropertyDerivationStreamContext } from './http-property-derivation-stream';
import { PropertyDerivationEntry } from './property-derivation-types';
import { createPropertyOverrideStore, PropertyOverrideStore } from './property-override-store';

function createMockLogger(): Logger {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

function createEntry(overrides: Partial<PropertyDerivationEntry> = {}): PropertyDerivationEntry {
  return {
    fieldKey: 'streetDropdown',
    targetProperty: 'options',
    dependsOn: ['street'],
    condition: true,
    http: { url: '/api/streets', method: 'GET', queryParams: { q: 'formValue.street' } },
    responseExpression: 'response.map(d => ({ value: d.id, label: d.name }))',
    trigger: 'onChange',
    ...overrides,
  };
}

describe('createHttpPropertyDerivationStream', () => {
  let logger: Logger;
  let store: PropertyOverrideStore;
  let httpClient: { request: ReturnType<typeof vi.fn> };
  let formValue$: Subject<Record<string, unknown>>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    store = createPropertyOverrideStore();
    httpClient = {
      request: vi.fn().mockReturnValue(
        of([
          { id: '1', name: 'Main St' },
          { id: '2', name: 'Oak Ave' },
        ]),
      ),
    };
    formValue$ = new Subject<Record<string, unknown>>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function buildContext(formValueSignal: ReturnType<typeof signal<Record<string, unknown>>>): HttpPropertyDerivationStreamContext {
    return {
      formValue: formValueSignal,
      store,
      httpClient: httpClient as unknown as HttpPropertyDerivationStreamContext['httpClient'],
      logger,
    };
  }

  it('writes the mapped response to the override store when a dependency changes', () => {
    const formValueSignal = signal<Record<string, unknown>>({ street: '' });
    const stream$ = createHttpPropertyDerivationStream(createEntry(), formValue$, buildContext(formValueSignal));

    stream$.subscribe();

    formValue$.next({ street: '' });
    formValueSignal.set({ street: 'Mai' });
    formValue$.next({ street: 'Mai' });

    vi.advanceTimersByTime(300); // default debounce

    expect(httpClient.request).toHaveBeenCalledTimes(1);
    expect(store.getOverrides('streetDropdown')()).toEqual({
      options: [
        { value: '1', label: 'Main St' },
        { value: '2', label: 'Oak Ave' },
      ],
    });
  });

  it('does not fire when dependsOn fields are unchanged', () => {
    const formValueSignal = signal<Record<string, unknown>>({ street: 'Main', other: 'a' });
    const stream$ = createHttpPropertyDerivationStream(createEntry(), formValue$, buildContext(formValueSignal));

    stream$.subscribe();

    formValue$.next({ street: 'Main', other: 'a' });
    // First emission always counts as "changed" (vs null) and fires once.
    vi.advanceTimersByTime(300);
    expect(httpClient.request).toHaveBeenCalledTimes(1);

    // A second emission where street didn't change should NOT fire.
    formValue$.next({ street: 'Main', other: 'b' });
    vi.advanceTimersByTime(300);
    expect(httpClient.request).toHaveBeenCalledTimes(1);
  });

  it('skips the request when condition evaluates to false', () => {
    const formValueSignal = signal<Record<string, unknown>>({ street: '' });
    const stream$ = createHttpPropertyDerivationStream(
      createEntry({
        condition: {
          type: 'fieldValue',
          fieldPath: 'street',
          operator: 'notEquals',
          value: '',
        },
      }),
      formValue$,
      buildContext(formValueSignal),
    );

    stream$.subscribe();

    formValue$.next({ street: '' });
    vi.advanceTimersByTime(300);

    expect(httpClient.request).not.toHaveBeenCalled();
    expect(store.getOverrides('streetDropdown')()).toEqual({});
  });

  it('logs a warning and completes when the HTTP request errors', () => {
    httpClient.request.mockReturnValue(throwError(() => new Error('Network down')));
    const formValueSignal = signal<Record<string, unknown>>({ street: 'Main' });
    const stream$ = createHttpPropertyDerivationStream(createEntry(), formValue$, buildContext(formValueSignal));

    stream$.subscribe();

    formValue$.next({ street: 'Main' });
    vi.advanceTimersByTime(300);

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('HTTP request failed'));
    expect(store.getOverrides('streetDropdown')()).toEqual({});
  });

  it("respects 'debounced' trigger with custom debounceMs", () => {
    const formValueSignal = signal<Record<string, unknown>>({ street: '' });
    const stream$ = createHttpPropertyDerivationStream(
      createEntry({ trigger: 'debounced', debounceMs: 750 }),
      formValue$,
      buildContext(formValueSignal),
    );

    stream$.subscribe();

    formValue$.next({ street: 'Mai' });
    vi.advanceTimersByTime(300);
    expect(httpClient.request).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(httpClient.request).toHaveBeenCalledTimes(1);
  });
});
