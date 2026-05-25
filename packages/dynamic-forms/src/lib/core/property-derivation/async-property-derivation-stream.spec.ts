import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '../../providers/features/logger/logger.interface';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { createAsyncPropertyDerivationStream, AsyncPropertyDerivationStreamContext } from './async-property-derivation-stream';
import { PropertyDerivationEntry } from './property-derivation-types';
import { createPropertyOverrideStore, PropertyOverrideStore } from './property-override-store';

function createMockLogger(): Logger {
  return { log: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
}

function createEntry(overrides: Partial<PropertyDerivationEntry> = {}): PropertyDerivationEntry {
  return {
    fieldKey: 'cityField',
    targetProperty: 'options',
    dependsOn: ['country'],
    condition: true,
    trigger: 'onChange',
    ...overrides,
  };
}

describe('createAsyncPropertyDerivationStream', () => {
  let logger: Logger;
  let store: PropertyOverrideStore;
  let formValue$: Subject<Record<string, unknown>>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    store = createPropertyOverrideStore();
    formValue$ = new Subject<Record<string, unknown>>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function buildContext(
    formValueSignal: ReturnType<typeof signal<Record<string, unknown>>>,
    asyncFns: Record<string, AsyncDerivationFunction> = {},
  ): AsyncPropertyDerivationStreamContext {
    return {
      formValue: formValueSignal,
      store,
      logger,
      asyncDerivationFunctions: () => asyncFns,
    };
  }

  it('writes the async result to the override store via asyncFn', async () => {
    const asyncFn: AsyncDerivationFunction = vi.fn().mockResolvedValue([{ value: '1', label: 'NY' }]);
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });

    const stream$ = createAsyncPropertyDerivationStream(createEntry({ asyncFn }), formValue$, buildContext(formValueSignal));

    stream$.subscribe();

    formValue$.next({ country: 'US' });
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(store.getOverrides('cityField')()).toEqual({ options: [{ value: '1', label: 'NY' }] });
  });

  it('writes the async result to the override store via asyncFunctionName', async () => {
    const registered: AsyncDerivationFunction = vi.fn().mockResolvedValue([{ value: 'a', label: 'A' }]);
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });

    const stream$ = createAsyncPropertyDerivationStream(
      createEntry({ asyncFunctionName: 'fetchCities' }),
      formValue$,
      buildContext(formValueSignal, { fetchCities: registered }),
    );

    stream$.subscribe();

    formValue$.next({ country: 'US' });
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(registered).toHaveBeenCalledTimes(1);
    expect(store.getOverrides('cityField')()).toEqual({ options: [{ value: 'a', label: 'A' }] });
  });

  it('logs a warning when the named async function is not registered', () => {
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });
    const stream$ = createAsyncPropertyDerivationStream(
      createEntry({ asyncFunctionName: 'missingFn' }),
      formValue$,
      buildContext(formValueSignal, {}),
    );

    stream$.subscribe();
    formValue$.next({ country: 'US' });
    vi.advanceTimersByTime(300);

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("'missingFn' not found"));
    expect(store.getOverrides('cityField')()).toEqual({});
  });

  it('skips when condition is false', () => {
    const asyncFn: AsyncDerivationFunction = vi.fn().mockResolvedValue([]);
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });
    const stream$ = createAsyncPropertyDerivationStream(
      createEntry({
        asyncFn,
        condition: { type: 'fieldValue', fieldPath: 'country', operator: 'notEquals', value: '' },
      }),
      formValue$,
      buildContext(formValueSignal),
    );

    stream$.subscribe();
    formValue$.next({ country: '' });
    vi.advanceTimersByTime(300);

    expect(asyncFn).not.toHaveBeenCalled();
  });

  it('logs a warning and does not write to the store when asyncFn rejects', async () => {
    const asyncFn: AsyncDerivationFunction = vi.fn().mockRejectedValue(new Error('downstream failure'));
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });
    const stream$ = createAsyncPropertyDerivationStream(createEntry({ asyncFn }), formValue$, buildContext(formValueSignal));

    stream$.subscribe();
    formValue$.next({ country: 'US' });
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Async function failed'));
    expect(store.getOverrides('cityField')()).toEqual({});
  });

  it('logs a warning when asyncFn throws synchronously and does not write to the store', () => {
    const asyncFn: AsyncDerivationFunction = vi.fn().mockImplementation(() => {
      throw new Error('sync throw');
    });
    const formValueSignal = signal<Record<string, unknown>>({ country: '' });
    const stream$ = createAsyncPropertyDerivationStream(createEntry({ asyncFn }), formValue$, buildContext(formValueSignal));

    stream$.subscribe();
    formValue$.next({ country: 'US' });
    vi.advanceTimersByTime(300);

    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected stream error'));
    expect(store.getOverrides('cityField')()).toEqual({});
  });
});
