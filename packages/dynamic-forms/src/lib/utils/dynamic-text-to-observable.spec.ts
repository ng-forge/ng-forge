import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { of, Subject } from 'rxjs';
import { dynamicTextToObservable } from './dynamic-text-to-observable';
import { firstValueFrom } from 'rxjs';

describe('dynamicTextToObservable', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  describe('string values', () => {
    it('should convert string to observable', async () => {
      const result = dynamicTextToObservable('Hello');
      const value = await firstValueFrom(result);

      expect(value).toBe('Hello');
    });

    it('should convert empty string to observable', async () => {
      const result = dynamicTextToObservable('');
      const value = await firstValueFrom(result);

      expect(value).toBe('');
    });

    it('should convert number to string observable', async () => {
      const result = dynamicTextToObservable(123 as any);
      const value = await firstValueFrom(result);

      expect(value).toBe('123');
    });
  });

  describe('undefined values', () => {
    it('should convert undefined to empty string observable', async () => {
      const result = dynamicTextToObservable(undefined);
      const value = await firstValueFrom(result);

      expect(value).toBe('');
    });
  });

  describe('Observable values', () => {
    it('should return Observable as-is', async () => {
      const obs = of('Observable value');
      const result = dynamicTextToObservable(obs);

      expect(result).toBe(obs);
      const value = await firstValueFrom(result);
      expect(value).toBe('Observable value');
    });

    it('should handle Subject', async () => {
      const subject = new Subject<string>();
      const result = dynamicTextToObservable(subject);

      expect(result).toBe(subject);

      setTimeout(() => subject.next('Subject value'), 0);
      const value = await firstValueFrom(result);
      expect(value).toBe('Subject value');
    });

    it('should handle Observable with multiple emissions', async () => {
      const subject = new Subject<string>();
      const result = dynamicTextToObservable(subject);

      const values: string[] = [];
      const promise = new Promise<void>((resolve) => {
        result.subscribe((value) => {
          values.push(value);
          if (values.length === 3) {
            resolve();
          }
        });
      });

      subject.next('first');
      subject.next('second');
      subject.next('third');

      await promise;
      expect(values).toEqual(['first', 'second', 'third']);
    });
  });

  describe('Signal values', () => {
    it('should convert Signal to Observable', async () => {
      const textSignal = signal('Signal value');

      const result = runInInjectionContext(injector, () => dynamicTextToObservable(textSignal, injector));

      const value = await firstValueFrom(result);
      expect(value).toBe('Signal value');
    });

    it('should convert Signal with injector parameter', async () => {
      const textSignal = signal('With injector');

      const result = runInInjectionContext(injector, () => dynamicTextToObservable(textSignal, injector));

      const value = await firstValueFrom(result);
      expect(value).toBe('With injector');
    });

    it('should handle Signal updates', async () => {
      const textSignal = signal('Initial');

      const result = runInInjectionContext(injector, () => dynamicTextToObservable(textSignal, injector));

      const values: string[] = [];
      const promise = new Promise<void>((resolve) => {
        result.subscribe((value) => {
          values.push(value);
          if (values.length === 1) {
            // After getting first value, update signal
            textSignal.set('Updated');
          }
          if (values.length === 2) {
            resolve();
          }
        });
      });

      await promise;
      expect(values).toEqual(['Initial', 'Updated']);
    });

    it('should convert empty Signal to Observable', async () => {
      const textSignal = signal('');

      const result = runInInjectionContext(injector, () => dynamicTextToObservable(textSignal, injector));

      const value = await firstValueFrom(result);
      expect(value).toBe('');
    });
  });

  describe('type handling', () => {
    it('should handle all supported types', async () => {
      // String
      const stringResult = dynamicTextToObservable('text');
      expect(await firstValueFrom(stringResult)).toBe('text');

      // Observable
      const obsResult = dynamicTextToObservable(of('obs'));
      expect(await firstValueFrom(obsResult)).toBe('obs');

      // Signal
      const signal$ = signal('sig');
      const signalResult = runInInjectionContext(injector, () => dynamicTextToObservable(signal$, injector));
      expect(await firstValueFrom(signalResult)).toBe('sig');

      // Undefined
      const undefinedResult = dynamicTextToObservable(undefined);
      expect(await firstValueFrom(undefinedResult)).toBe('');
    });

    it('should convert non-string primitives to strings', async () => {
      const boolResult = dynamicTextToObservable(true as any);
      expect(await firstValueFrom(boolResult)).toBe('true');

      const numResult = dynamicTextToObservable(42 as any);
      expect(await firstValueFrom(numResult)).toBe('42');

      const nullResult = dynamicTextToObservable(null as any);
      expect(await firstValueFrom(nullResult)).toBe('null');
    });
  });

  describe('edge cases', () => {
    it('should handle Observable that emits undefined', async () => {
      const obs = of(undefined as any);
      const result = dynamicTextToObservable(obs);

      const value = await firstValueFrom(result);
      expect(value).toBe(undefined);
    });

    it('should handle Observable that emits numbers', async () => {
      const obs = of(123 as any);
      const result = dynamicTextToObservable(obs);

      const value = await firstValueFrom(result);
      expect(value).toBe(123);
    });

    it('should handle Signal with complex updates', async () => {
      const textSignal = signal('one');

      const result = runInInjectionContext(injector, () => dynamicTextToObservable(textSignal, injector));

      const values: string[] = [];
      const promise = new Promise<void>((resolve) => {
        result.subscribe((value) => {
          values.push(value);

          if (values.length === 1) {
            textSignal.set('two');
          } else if (values.length === 2) {
            textSignal.set('three');
          } else if (values.length === 3) {
            resolve();
          }
        });
      });

      await promise;
      expect(values).toEqual(['one', 'two', 'three']);
    });
  });
});
