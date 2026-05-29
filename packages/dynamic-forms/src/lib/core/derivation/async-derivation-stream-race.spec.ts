import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { computed, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { createAsyncDerivationStream, AsyncDerivationStreamContext } from './async-derivation-stream';
import { createHttpDerivationStream, HttpDerivationStreamContext } from './http-derivation-stream';
import { DerivationEntry } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogger } from './derivation-logger.service';

/**
 * ASYNC-IN-FLIGHT × STATE-CHANGE races.
 *
 * Stream cancellation (switchMap) is already covered in async-derivation-stream.spec.ts.
 * The UNTESTED seam exercised here is what happens when an async result lands AFTER the
 * target field's hidden-state or dirty-state changed while the call was in flight. This is
 * the #394 family (NaN / stale value leaking into a now-hidden or user-edited field).
 *
 * The async function returns a Subject so the test controls EXACTLY when the result lands,
 * after mutating form/dirty state — no real sleeps, same controllable-observable mechanism
 * the existing spec uses.
 */
describe('createAsyncDerivationStream — in-flight × state-change races', () => {
  function createMockLogger(): Logger {
    return { log: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  }

  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

  /** Field instance matching the public Angular Signal Forms API used by the applicator. */
  function createFieldInstance(initial: unknown): {
    field: unknown;
    value: WritableSignal<unknown>;
    dirty: WritableSignal<boolean>;
  } {
    const value = signal(initial);
    const dirty = signal(false);
    const touched = signal(false);
    const field = computed(() => ({
      value,
      dirty,
      touched,
      reset: () => {
        dirty.set(false);
        touched.set(false);
      },
    }));
    return { field, value, dirty };
  }

  function createAsyncEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? ['productId'],
      condition: options.condition ?? true,
      asyncFunctionName: options.asyncFunctionName ?? 'fetchValue',
      asyncFn: options.asyncFn,
      trigger: options.trigger ?? 'onChange',
      isShorthand: options.isShorthand ?? false,
      stopOnUserOverride: options.stopOnUserOverride,
      reEngageOnDependencyChange: options.reEngageOnDependencyChange,
      debugName: options.debugName,
      debounceMs: options.debounceMs,
    };
  }

  let logger: Logger;
  let derivationLogger: DerivationLogger;
  let formValue$: Subject<Record<string, unknown>>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    derivationLogger = createMockDerivationLogger();
    formValue$ = new Subject<Record<string, unknown>>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: target field becomes HIDDEN/excluded while async is in flight.
  //
  // Modeled at the unit seam the way the runtime models it: when a value field is
  // hidden+excluded it is removed from the Signal Forms tree, so `rootForm[fieldKey]`
  // no longer resolves. The stream reads `context.form()` lazily in its `next` handler
  // (untracked), so swapping the form signal to a tree WITHOUT the field reproduces the
  // "field gone by the time the result lands" race. applyValueToForm must then refuse to
  // write (returns false + missing-field warning), so no stale/NaN value leaks.
  // ---------------------------------------------------------------------------
  describe('field hidden (removed from tree) before async resolves', () => {
    it('does NOT leak the late result into a field that was removed while in flight', () => {
      const productId = createFieldInstance('abc');
      const price = createFieldInstance(0);

      // Full tree (price present) at fire time.
      const fullForm: Record<string, unknown> = { productId: productId.field, price: price.field };
      // Tree after the field was hidden + excluded → price removed.
      const hiddenForm: Record<string, unknown> = { productId: productId.field };

      const formSignal = signal<Record<string, unknown>>(fullForm);
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const resultSubject = new Subject<number>();
      const asyncFn = vi.fn().mockReturnValue(resultSubject);

      const entry = createAsyncEntry('price', { dependsOn: ['productId'] });
      const context: AsyncDerivationStreamContext = {
        formValue: formValueSignal,
        form: formSignal as AsyncDerivationStreamContext['form'],
        logger,
        derivationLogger: signal(derivationLogger) as AsyncDerivationStreamContext['derivationLogger'],
        asyncDerivationFunctions: () => ({ fetchValue: asyncFn }),
      };

      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Fire the derivation: dependency changes.
      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);
      expect(asyncFn).toHaveBeenCalledTimes(1);

      // Field becomes hidden+excluded WHILE the async call is in flight → removed from tree.
      formSignal.set(hiddenForm);
      formValueSignal.set({ productId: 'xyz' });

      // Late result lands.
      resultSubject.next(42);
      resultSubject.complete();

      // The now-removed field must not be written. The original value signal is untouched,
      // and applyValueToForm logged a missing-field warning instead of leaking 42.
      expect(price.value()).toBe(0);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("target field 'price' not found"));
    });

    it('does NOT leak a NaN late result into a removed field (#394 family)', () => {
      const productId = createFieldInstance('abc');
      const qty = createFieldInstance(5);

      const fullForm: Record<string, unknown> = { productId: productId.field, qty: qty.field };
      const hiddenForm: Record<string, unknown> = { productId: productId.field };

      const formSignal = signal<Record<string, unknown>>(fullForm);
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', qty: 5 });

      const resultSubject = new Subject<number>();
      const asyncFn = vi.fn().mockReturnValue(resultSubject);

      const entry = createAsyncEntry('qty', { dependsOn: ['productId'] });
      const context: AsyncDerivationStreamContext = {
        formValue: formValueSignal,
        form: formSignal as AsyncDerivationStreamContext['form'],
        logger,
        derivationLogger: signal(derivationLogger) as AsyncDerivationStreamContext['derivationLogger'],
        asyncDerivationFunctions: () => ({ fetchValue: asyncFn }),
      };

      createAsyncDerivationStream(entry, formValue$, context).subscribe();

      formValue$.next({ productId: 'abc', qty: 5 });
      formValue$.next({ productId: 'xyz', qty: 5 });
      vi.advanceTimersByTime(300);

      // Hide the field mid-flight.
      formSignal.set(hiddenForm);
      formValueSignal.set({ productId: 'xyz' });

      // Late result is NaN (e.g. parsed from a response for a field that no longer applies).
      resultSubject.next(NaN);
      resultSubject.complete();

      // No NaN leaked.
      expect(Number.isNaN(qty.value() as number)).toBe(false);
      expect(qty.value()).toBe(5);
    });
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 2: stopOnUserOverride — user edits the field (dirty=true) AFTER the
  // async fn was invoked but BEFORE the result lands.
  //
  // The stream checks dirty ONLY at fire-time inside switchMap, then applies the result
  // in `next` without re-reading dirty. If the user types during the in-flight window,
  // the late write can clobber their input. Reproduce-first.
  // ---------------------------------------------------------------------------
  describe('stopOnUserOverride — user edits field while async is in flight', () => {
    it.fails('does NOT overwrite the user edit that happened during the in-flight window', () => {
      // BUG: async-derivation-stream.ts reads dirty() only at fire-time (switchMap, lines
      // ~117-138). When the result arrives in `next` (lines ~191-222) it applies the value
      // with no re-check of dirty/stopOnUserOverride. A user who edits the field after the
      // async call started but before it resolves gets their input silently overwritten by
      // the stale derived value. Same #394-family late-write leak, dirty-state variant.
      const productId = createFieldInstance('abc');
      const price = createFieldInstance(0);

      const formSignal = signal<Record<string, unknown>>({ productId: productId.field, price: price.field });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const resultSubject = new Subject<number>();
      const asyncFn = vi.fn().mockReturnValue(resultSubject);

      const entry = createAsyncEntry('price', { dependsOn: ['productId'], stopOnUserOverride: true });
      const context: AsyncDerivationStreamContext = {
        formValue: formValueSignal,
        form: formSignal as AsyncDerivationStreamContext['form'],
        logger,
        derivationLogger: signal(derivationLogger) as AsyncDerivationStreamContext['derivationLogger'],
        asyncDerivationFunctions: () => ({ fetchValue: asyncFn }),
      };

      createAsyncDerivationStream(entry, formValue$, context).subscribe();

      // Fire: field is pristine, so the async call starts.
      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);
      expect(asyncFn).toHaveBeenCalledTimes(1);

      // User types into the field WHILE the call is in flight → field becomes dirty.
      price.value.set(777);
      price.dirty.set(true);
      formValueSignal.set({ productId: 'xyz', price: 777 });

      // Late derived result lands.
      resultSubject.next(42);
      resultSubject.complete();

      // The user's input must win — stopOnUserOverride should protect it.
      expect(price.value()).toBe(777);
    });

    it('still applies the late result when the field stays pristine (control)', () => {
      const productId = createFieldInstance('abc');
      const price = createFieldInstance(0);

      const formSignal = signal<Record<string, unknown>>({ productId: productId.field, price: price.field });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const resultSubject = new Subject<number>();
      const asyncFn = vi.fn().mockReturnValue(resultSubject);

      const entry = createAsyncEntry('price', { dependsOn: ['productId'], stopOnUserOverride: true });
      const context: AsyncDerivationStreamContext = {
        formValue: formValueSignal,
        form: formSignal as AsyncDerivationStreamContext['form'],
        logger,
        derivationLogger: signal(derivationLogger) as AsyncDerivationStreamContext['derivationLogger'],
        asyncDerivationFunctions: () => ({ fetchValue: asyncFn }),
      };

      createAsyncDerivationStream(entry, formValue$, context).subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      // No user edit — field stays pristine.
      resultSubject.next(42);
      resultSubject.complete();

      expect(price.value()).toBe(42);
    });
  });
});

/**
 * Same race class on the HTTP-derivation path. createHttpDerivationStream shares the
 * identical seam: dirty()/stopOnUserOverride is checked at fire-time inside switchMap, and
 * the HTTP response `next` handler applies the value with no re-check of dirty/hidden state.
 * Controllable timing comes from the mock HttpClient returning a Subject.
 */
describe('createHttpDerivationStream — in-flight × state-change races', () => {
  function createMockLogger(): Logger {
    return { log: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  }

  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

  function createFieldInstance(initial: unknown): {
    field: unknown;
    value: WritableSignal<unknown>;
    dirty: WritableSignal<boolean>;
  } {
    const value = signal(initial);
    const dirty = signal(false);
    const touched = signal(false);
    const field = computed(() => ({
      value,
      dirty,
      touched,
      reset: () => {
        dirty.set(false);
        touched.set(false);
      },
    }));
    return { field, value, dirty };
  }

  function createHttpEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? ['country'],
      condition: options.condition ?? true,
      http: options.http ?? { url: 'https://api.example.com/rate', method: 'GET' },
      responseExpression: options.responseExpression ?? 'response.rate',
      trigger: options.trigger ?? 'onChange',
      debounceMs: options.debounceMs,
      isShorthand: options.isShorthand ?? false,
      stopOnUserOverride: options.stopOnUserOverride,
      reEngageOnDependencyChange: options.reEngageOnDependencyChange,
      debugName: options.debugName,
    };
  }

  let logger: Logger;
  let derivationLogger: DerivationLogger;
  let formValue$: Subject<Record<string, unknown>>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    derivationLogger = createMockDerivationLogger();
    formValue$ = new Subject<Record<string, unknown>>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createContext(
    formSignal: WritableSignal<Record<string, unknown>>,
    formValueSignal: WritableSignal<Record<string, unknown>>,
    httpClient: { request: ReturnType<typeof vi.fn> },
  ): HttpDerivationStreamContext {
    return {
      formValue: formValueSignal,
      form: formSignal as HttpDerivationStreamContext['form'],
      httpClient: httpClient as unknown as HttpDerivationStreamContext['httpClient'],
      logger,
      derivationLogger: signal(derivationLogger) as HttpDerivationStreamContext['derivationLogger'],
    };
  }

  it('does NOT leak the late HTTP response into a field removed while in flight', () => {
    const country = createFieldInstance('US');
    const rate = createFieldInstance(0);

    const fullForm: Record<string, unknown> = { country: country.field, rate: rate.field };
    const hiddenForm: Record<string, unknown> = { country: country.field };

    const formSignal = signal<Record<string, unknown>>(fullForm);
    const formValueSignal = signal<Record<string, unknown>>({ country: 'US', rate: 0 });

    const responseSubject = new Subject<{ rate: number }>();
    const httpClient = { request: vi.fn().mockReturnValue(responseSubject) };

    const entry = createHttpEntry('rate', { dependsOn: ['country'] });
    const stream$ = createHttpDerivationStream(entry, formValue$, createContext(formSignal, formValueSignal, httpClient));
    stream$.subscribe();

    formValue$.next({ country: 'US', rate: 0 });
    formValue$.next({ country: 'DE', rate: 0 });
    vi.advanceTimersByTime(300);
    expect(httpClient.request).toHaveBeenCalledTimes(1);

    // Field hidden + removed from tree mid-flight.
    formSignal.set(hiddenForm);
    formValueSignal.set({ country: 'DE' });

    // Late response lands.
    responseSubject.next({ rate: 1.5 });
    responseSubject.complete();

    expect(rate.value()).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("target field 'rate' not found"));
  });

  it.fails('does NOT overwrite a user edit that happened during the in-flight HTTP window', () => {
    // BUG: http-derivation-stream.ts mirrors the async stream — dirty() is read at fire-time
    // only (switchMap, lines ~104-137); the response `next` handler (lines ~201-234) applies
    // with no dirty re-check. A user edit during the in-flight window is clobbered.
    const country = createFieldInstance('US');
    const rate = createFieldInstance(0);

    const formSignal = signal<Record<string, unknown>>({ country: country.field, rate: rate.field });
    const formValueSignal = signal<Record<string, unknown>>({ country: 'US', rate: 0 });

    const responseSubject = new Subject<{ rate: number }>();
    const httpClient = { request: vi.fn().mockReturnValue(responseSubject) };

    const entry = createHttpEntry('rate', { dependsOn: ['country'], stopOnUserOverride: true });
    createHttpDerivationStream(entry, formValue$, createContext(formSignal, formValueSignal, httpClient)).subscribe();

    formValue$.next({ country: 'US', rate: 0 });
    formValue$.next({ country: 'DE', rate: 0 });
    vi.advanceTimersByTime(300);
    expect(httpClient.request).toHaveBeenCalledTimes(1);

    // User edits the field while the request is in flight.
    rate.value.set(9.9);
    rate.dirty.set(true);
    formValueSignal.set({ country: 'DE', rate: 9.9 });

    // Late response lands and clobbers the user input.
    responseSubject.next({ rate: 1.5 });
    responseSubject.complete();

    expect(rate.value()).toBe(9.9);
  });
});
