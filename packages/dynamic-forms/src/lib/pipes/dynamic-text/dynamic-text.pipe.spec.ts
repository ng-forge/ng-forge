import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DynamicTextPipe } from './dynamic-text.pipe';
import { signal, WritableSignal } from '@angular/core';
import { firstValueFrom, lastValueFrom, of, Subject, take, toArray } from 'rxjs';

describe('DynamicTextPipe', () => {
  let pipe: DynamicTextPipe;

  function createSignal<T>(value: T): WritableSignal<T> {
    return TestBed.runInInjectionContext(() => signal(value));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicTextPipe],
    });
    pipe = TestBed.inject(DynamicTextPipe);
  });

  describe('static strings', () => {
    it('should return static string as observable', async () => {
      const result = pipe.transform('Hello World');
      expect(await firstValueFrom(result)).toBe('Hello World');
    });

    it('should handle empty string', async () => {
      const result = pipe.transform('');
      expect(await firstValueFrom(result)).toBe('');
    });

    it('should handle string with special characters', async () => {
      const result = pipe.transform('Hello\nWorld\t!');
      expect(await firstValueFrom(result)).toBe('Hello\nWorld\t!');
    });

    it('should handle unicode characters', async () => {
      const result = pipe.transform('Hello 世界 🌍');
      expect(await firstValueFrom(result)).toBe('Hello 世界 🌍');
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const result = pipe.transform(longString);
      expect(await firstValueFrom(result)).toBe(longString);
    });
  });

  describe('undefined handling', () => {
    it('should return empty string for undefined', async () => {
      const result = pipe.transform(undefined);
      expect(await firstValueFrom(result)).toBe('');
    });

    it('should return empty string for null', async () => {
      const result = pipe.transform(null as unknown as undefined);
      expect(await firstValueFrom(result)).toBe('');
    });
  });

  describe('observables', () => {
    it('should pass through observable unchanged', async () => {
      const observable = of('Observable Value');
      const result = pipe.transform(observable);

      expect(result).toBe(observable);
      expect(await firstValueFrom(result)).toBe('Observable Value');
    });

    it('should handle observable with multiple emissions', async () => {
      const subject = new Subject<string>();
      const result = pipe.transform(subject);

      const emissions = lastValueFrom(result.pipe(toArray()));

      subject.next('First');
      subject.next('Second');
      subject.next('Third');
      subject.complete();

      expect(await emissions).toEqual(['First', 'Second', 'Third']);
    });

    it('should handle observable that emits empty string', async () => {
      const result = pipe.transform(of(''));
      expect(await firstValueFrom(result)).toBe('');
    });

    it('should handle cold observable with multiple subscriptions', async () => {
      const observable = of('Cold Observable');
      const result = pipe.transform(observable);

      expect(await firstValueFrom(result)).toBe('Cold Observable');
      expect(await firstValueFrom(result)).toBe('Cold Observable');
    });

    it('should handle observable with multiple sync emissions', async () => {
      const observable = of('test', 'another', 'value');
      const result = pipe.transform(observable);

      const emissions = await lastValueFrom(result.pipe(toArray()));
      expect(emissions).toEqual(['test', 'another', 'value']);
    });
  });

  describe('signals', () => {
    it('should convert signal to reactive observable', async () => {
      const textSignal = createSignal('Signal Value');
      const result = pipe.transform(textSignal);
      expect(await firstValueFrom(result)).toBe('Signal Value');
    });

    it('should emit when signal value changes', async () => {
      const textSignal = createSignal('Initial');
      const result = pipe.transform(textSignal);

      // Collect first 2 emissions
      const emissionsPromise = lastValueFrom(result.pipe(take(2), toArray()));

      // Update signal after subscribing
      TestBed.flushEffects();
      textSignal.set('Updated');
      TestBed.flushEffects();

      const emissions = await emissionsPromise;
      expect(emissions).toEqual(['Initial', 'Updated']);
    });

    it('should handle signal with empty string', async () => {
      const textSignal = createSignal('');
      const result = pipe.transform(textSignal);
      expect(await firstValueFrom(result)).toBe('');
    });

    it('should handle readonly signal', async () => {
      const writableSignal = createSignal('Readonly Test');
      const readonlySignal = writableSignal.asReadonly();

      const result = pipe.transform(readonlySignal);
      expect(await firstValueFrom(result)).toBe('Readonly Test');
    });
  });

  describe('type handling', () => {
    it('should emit once for static string', async () => {
      const result = pipe.transform('Static');
      const emissions = await lastValueFrom(result.pipe(toArray()));
      expect(emissions).toHaveLength(1);
    });

    it('should distinguish between string and observable', () => {
      const stringResult = pipe.transform('string');
      const observableInput = of('observable');
      const observableResult = pipe.transform(observableInput);

      expect(stringResult).not.toBe(observableResult);
      expect(observableResult).toBe(observableInput);
    });

    it('should distinguish between string and signal', async () => {
      const stringResult = pipe.transform('string');
      const signalResult = pipe.transform(createSignal('signal'));

      expect(await firstValueFrom(stringResult)).toBe('string');
      expect(await firstValueFrom(signalResult)).toBe('signal');
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only string', async () => {
      expect(await firstValueFrom(pipe.transform('   '))).toBe('   ');
    });

    it('should handle newline-only string', async () => {
      expect(await firstValueFrom(pipe.transform('\n'))).toBe('\n');
    });

    it('should handle string with null character', async () => {
      expect(await firstValueFrom(pipe.transform('test\0value'))).toBe('test\0value');
    });

    it('should return observable for all input types', () => {
      const results = [
        pipe.transform('string'),
        pipe.transform(of('observable')),
        pipe.transform(createSignal('signal')),
        pipe.transform(undefined),
      ];

      results.forEach((result) => {
        expect(typeof result.subscribe).toBe('function');
      });
    });

    it('should complete observable for static values', async () => {
      const result = pipe.transform('Test');
      const emissions = await lastValueFrom(result.pipe(toArray()));
      expect(emissions).toEqual(['Test']);
    });
  });

  describe('performance', () => {
    it('should handle rapid successive transforms', async () => {
      const values = await Promise.all(Array.from({ length: 100 }, (_, i) => firstValueFrom(pipe.transform(`Value ${i}`))));

      expect(values).toHaveLength(100);
      expect(values[0]).toBe('Value 0');
      expect(values[99]).toBe('Value 99');
    });

    it('should handle multiple signal transforms', async () => {
      const signals = Array.from({ length: 50 }, (_, i) => createSignal(`Signal ${i}`));
      const values = await Promise.all(signals.map((s) => firstValueFrom(pipe.transform(s))));

      expect(values).toHaveLength(50);
      expect(values[0]).toBe('Signal 0');
      expect(values[49]).toBe('Signal 49');
    });
  });

  describe('Angular pipe behavior', () => {
    it('should implement PipeTransform', () => {
      expect(typeof pipe.transform).toBe('function');
    });

    it('should return observable from transform', () => {
      const result = pipe.transform('test');
      expect(typeof result.subscribe).toBe('function');
    });
  });
});
