import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DynamicTextPipe } from './dynamic-text.pipe';
import { signal, WritableSignal } from '@angular/core';
import { of, Subject } from 'rxjs';

describe('DynamicTextPipe', () => {
  let pipe: DynamicTextPipe;

  // Helper to create signals within injection context
  function createSignal<T>(value: T): WritableSignal<T> {
    return TestBed.runInInjectionContext(() => signal(value));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new DynamicTextPipe();
  });

  describe('static strings', () => {
    it('should return static string as observable', async () => {
      const result = pipe.transform('Hello World');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Hello World');
    });

    it('should handle empty string', async () => {
      const result = pipe.transform('');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('');
    });

    it('should handle string with special characters', async () => {
      const result = pipe.transform('Hello\nWorld\t!');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Hello\nWorld\t!');
    });

    it('should handle unicode characters', async () => {
      const result = pipe.transform('Hello 世界 🌍');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Hello 世界 🌍');
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const result = pipe.transform(longString);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe(longString);
    });
  });

  describe('undefined handling', () => {
    it('should return empty string for undefined', async () => {
      const result = pipe.transform(undefined);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('');
    });

    it('should return empty string for null', async () => {
      const result = pipe.transform(null as unknown as undefined);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('');
    });
  });

  describe('observables', () => {
    it('should pass through observable', async () => {
      const observable = of('Observable Value');
      const result = pipe.transform(observable);

      expect(result).toBe(observable);

      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Observable Value');
    });

    it('should handle observable with multiple emissions', async () => {
      const subject = new Subject<string>();
      const result = pipe.transform(subject);

      const emissions: string[] = [];
      result.subscribe((value) => emissions.push(value));

      subject.next('First');
      subject.next('Second');
      subject.next('Third');
      subject.complete();

      expect(emissions).toEqual(['First', 'Second', 'Third']);
    });

    it('should handle observable that emits empty string', async () => {
      const observable = of('');
      const result = pipe.transform(observable);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('');
    });

    it('should handle cold observable', async () => {
      const observable = of('Cold Observable');
      const result = pipe.transform(observable);

      // Subscribe twice to verify it's a cold observable
      const value1 = await new Promise((resolve) => {
        result.subscribe(resolve);
      });
      const value2 = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value1).toBe('Cold Observable');
      expect(value2).toBe('Cold Observable');
    });

    it('should handle observable of any string type', async () => {
      const observable = of('test', 'another', 'value');
      const result = pipe.transform(observable);

      const emissions: string[] = [];
      result.subscribe((value) => emissions.push(value));

      expect(emissions).toEqual(['test', 'another', 'value']);
    });
  });

  describe('signals', () => {
    it('should convert signal to observable', async () => {
      const textSignal = createSignal('Signal Value');
      const result = pipe.transform(textSignal);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Signal Value');
    });

    it('should read current signal value', async () => {
      const textSignal = createSignal('Initial');
      textSignal.set('Updated');

      const result = pipe.transform(textSignal);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Updated');
    });

    it('should handle signal with empty string', async () => {
      const textSignal = createSignal('');
      const result = pipe.transform(textSignal);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('');
    });

    it('should create new observable from signal value', async () => {
      const textSignal = createSignal('Test');
      const result1 = pipe.transform(textSignal);
      const result2 = pipe.transform(textSignal);

      // Should create new observables each time
      expect(result1).not.toBe(result2);

      const value1 = await new Promise((resolve) => {
        result1.subscribe(resolve);
      });
      const value2 = await new Promise((resolve) => {
        result2.subscribe(resolve);
      });

      expect(value1).toBe('Test');
      expect(value2).toBe('Test');
    });

    it('should handle signal updates between transforms', async () => {
      const textSignal = createSignal('First');
      const result1 = pipe.transform(textSignal);

      textSignal.set('Second');
      const result2 = pipe.transform(textSignal);

      const value1 = await new Promise((resolve) => {
        result1.subscribe(resolve);
      });
      const value2 = await new Promise((resolve) => {
        result2.subscribe(resolve);
      });

      expect(value1).toBe('First');
      expect(value2).toBe('Second');
    });

    it('should handle readonly signal', async () => {
      const writableSignal = createSignal('Readonly Test');
      const readonlySignal = writableSignal.asReadonly();

      const result = pipe.transform(readonlySignal);
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('Readonly Test');
    });
  });

  describe('type handling', () => {
    it('should emit observable once for static string', async () => {
      const result = pipe.transform('Static');

      let emissionCount = 0;
      result.subscribe(() => emissionCount++);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emissionCount).toBe(1);
    });

    it('should emit observable once for signal', async () => {
      const textSignal = createSignal('Test');
      const result = pipe.transform(textSignal);

      let emissionCount = 0;
      result.subscribe(() => emissionCount++);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emissionCount).toBe(1);
    });

    it('should distinguish between string and observable', () => {
      const stringResult = pipe.transform('string');
      const observableResult = pipe.transform(of('observable'));

      // Both should be observables, but different instances for string
      expect(stringResult).toBeDefined();
      expect(observableResult).toBeDefined();
      expect(stringResult).not.toBe(observableResult);
    });

    it('should distinguish between string and signal', async () => {
      const stringResult = pipe.transform('string');
      const signalResult = pipe.transform(createSignal('signal'));

      const stringValue = await new Promise((resolve) => {
        stringResult.subscribe(resolve);
      });
      const signalValue = await new Promise((resolve) => {
        signalResult.subscribe(resolve);
      });

      expect(stringValue).toBe('string');
      expect(signalValue).toBe('signal');
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only string', async () => {
      const result = pipe.transform('   ');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('   ');
    });

    it('should handle newline-only string', async () => {
      const result = pipe.transform('\n');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('\n');
    });

    it('should handle string with null character', async () => {
      const result = pipe.transform('test\0value');
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('test\0value');
    });

    it('should return observable for all input types', () => {
      const results = [
        pipe.transform('string'),
        pipe.transform(of('observable')),
        pipe.transform(createSignal('signal')),
        pipe.transform(undefined),
      ];

      results.forEach((result) => {
        expect(result.subscribe).toBeDefined();
        expect(typeof result.subscribe).toBe('function');
      });
    });

    it('should complete observable for static values', async () => {
      const result = pipe.transform('Test');

      let completed = false;
      result.subscribe({
        complete: () => {
          completed = true;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(completed).toBe(true);
    });

    it('should complete observable for signal values', async () => {
      const result = pipe.transform(createSignal('Test'));

      let completed = false;
      result.subscribe({
        complete: () => {
          completed = true;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(completed).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle rapid successive transforms', async () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(pipe.transform(`Value ${i}`));
      }

      const values = await Promise.all(
        results.map(
          (result) =>
            new Promise((resolve) => {
              result.subscribe(resolve);
            }),
        ),
      );

      expect(values).toHaveLength(100);
      expect(values[0]).toBe('Value 0');
      expect(values[99]).toBe('Value 99');
    });

    it('should handle multiple signal transforms', async () => {
      const signals = Array.from({ length: 50 }, (_, i) => createSignal(`Signal ${i}`));
      const results = signals.map((s) => pipe.transform(s));

      const values = await Promise.all(
        results.map(
          (result) =>
            new Promise((resolve) => {
              result.subscribe(resolve);
            }),
        ),
      );

      expect(values).toHaveLength(50);
      expect(values[0]).toBe('Signal 0');
      expect(values[49]).toBe('Signal 49');
    });
  });

  describe('Angular pipe behavior', () => {
    it('should implement PipeTransform', () => {
      expect(pipe.transform).toBeDefined();
      expect(typeof pipe.transform).toBe('function');
    });

    it('should have transform method with correct signature', () => {
      const result = pipe.transform('test');

      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });
  });
});
