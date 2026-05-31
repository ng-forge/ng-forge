import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { map, pipe, scan } from 'rxjs';
import { derivedFromDeferred } from './derived-from-deferred';
import { delay } from '@ng-forge/utils';

describe('derivedFromDeferred', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  describe('basic functionality', () => {
    it('should return a signal with the initial value', () => {
      runInInjectionContext(injector, () => {
        const source = signal(10);
        const result = derivedFromDeferred(
          source,
          map((x) => x * 2),
          { initialValue: 0, injector },
        );

        // Before any emissions, should have initial value
        expect(result()).toBe(0);
      });
    });

    it('should apply the operator to the source signal value', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(5);
        const result = derivedFromDeferred(
          source,
          map((x) => x * 3),
          { initialValue: 0, injector },
        );

        // Wait for the observable subscription to process
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(15);
      });
    });

    it('should update when source signal changes', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(1);
        const result = derivedFromDeferred(
          source,
          map((x) => x + 100),
          { initialValue: 0, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(101);

        source.set(50);

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(150);
      });
    });

    it('should work with string transformations', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal('hello');
        const result = derivedFromDeferred(
          source,
          map((s) => s.toUpperCase()),
          {
            initialValue: '',
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe('HELLO');
      });
    });

    it('should work with object transformations', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal({ name: 'John', age: 30 });
        const result = derivedFromDeferred(
          source,
          map((obj) => ({ ...obj, age: obj.age + 1 })),
          {
            initialValue: { name: '', age: 0 },
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toEqual({ name: 'John', age: 31 });
      });
    });
  });

  describe('complex operators', () => {
    it('should work with scan operator for accumulating values', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(1);
        const result = derivedFromDeferred(
          source,
          scan((acc, val) => acc + val, 0),
          { initialValue: 0, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        // First value: 0 + 1 = 1
        expect(result()).toBe(1);

        source.set(5);
        TestBed.flushEffects();
        await delay(0);

        // Second value: 1 + 5 = 6
        expect(result()).toBe(6);
      });
    });

    it('should work with chained operators', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(10);
        const result = derivedFromDeferred(
          source,
          (obs$) =>
            obs$.pipe(
              map((x) => x * 2),
              map((x) => x + 5),
            ),
          { initialValue: 0, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        // 10 * 2 = 20, then 20 + 5 = 25
        expect(result()).toBe(25);
      });
    });

    it('should handle filtering operators', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(5);
        const result = derivedFromDeferred(
          source,
          map((x) => (x > 10 ? x : null)),
          { initialValue: null as number | null, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        // 5 is not > 10, so null
        expect(result()).toBe(null);

        source.set(15);
        TestBed.flushEffects();
        await delay(0);

        // 15 > 10, so 15
        expect(result()).toBe(15);
      });
    });
  });

  describe('deferred behavior', () => {
    it('should defer toObservable call until subscription', () => {
      // This test verifies the core purpose of derivedFromDeferred:
      // The observable is created lazily via defer()
      runInInjectionContext(injector, () => {
        const source = signal(42);

        // Creating the derived signal should not throw even if
        // input signals aren't fully initialized yet
        const result = derivedFromDeferred(
          source,
          map((x) => x),
          { initialValue: 0, injector },
        );

        // The signal should be created successfully
        expect(result).toBeDefined();
        expect(typeof result).toBe('function');
      });
    });

    it('should allow creation in field initializer context', () => {
      // This simulates the use case where derivedFromDeferred is used
      // in a class field initializer where input() signals might not
      // be available yet
      runInInjectionContext(injector, () => {
        class TestClass {
          source = signal<number | undefined>(undefined);
          derived = derivedFromDeferred(
            this.source,
            map((x) => (x ?? 0) * 2),
            {
              initialValue: 0,
              injector,
            },
          );
        }

        const instance = new TestClass();

        // Should work even with undefined initial value
        expect(instance.derived()).toBe(0);
      });
    });
  });

  describe('type safety', () => {
    it('should preserve type through transformation', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal({ items: [1, 2, 3] });
        const result = derivedFromDeferred(
          source,
          map((obj) => obj.items.length),
          {
            initialValue: 0,
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        const value: number = result(); // Should be number
        expect(value).toBe(3);
      });
    });

    it('should allow different input and output types', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(42);
        const result = derivedFromDeferred(
          source,
          map((n) => `Value: ${n}`),
          {
            initialValue: '',
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        const value: string = result(); // Should be string
        expect(value).toBe('Value: 42');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle rapid signal updates', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(0);
        const result = derivedFromDeferred(
          source,
          map((x) => x),
          { initialValue: -1, injector },
        );

        // Rapid updates
        for (let i = 1; i <= 10; i++) {
          source.set(i);
        }

        TestBed.flushEffects();
        await delay(0);

        // Should have the final value
        expect(result()).toBe(10);
      });
    });

    it('should work with boolean signals', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal(true);
        const result = derivedFromDeferred(
          source,
          map((b) => !b),
          { initialValue: true, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(false);

        source.set(false);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(true);
      });
    });

    it('should work with array signals', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal([1, 2, 3]);
        const result = derivedFromDeferred(
          source,
          map((arr) => arr.reduce((a, b) => a + b, 0)),
          {
            initialValue: 0,
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(6);

        source.set([10, 20, 30]);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(60);
      });
    });

    it('should handle null values in source', async () => {
      await runInInjectionContext(injector, async () => {
        const source = signal<string | null>(null);
        const result = derivedFromDeferred(
          source,
          map((s) => s?.length ?? 0),
          {
            initialValue: -1,
            injector,
          },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(0);

        source.set('hello');
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(5);
      });
    });
  });

  describe('array of signals', () => {
    it('should combine multiple signals into a tuple', async () => {
      await runInInjectionContext(injector, async () => {
        const signalA = signal(10);
        const signalB = signal(20);

        const result = derivedFromDeferred([signalA, signalB], pipe(map(([a, b]) => a + b)), { initialValue: 0, injector });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(30);
      });
    });

    it('should update when any source signal changes', async () => {
      await runInInjectionContext(injector, async () => {
        const signalA = signal(5);
        const signalB = signal(10);

        const result = derivedFromDeferred([signalA, signalB], pipe(map(([a, b]) => a * b)), { initialValue: 0, injector });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(50);

        signalA.set(3);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(30);

        signalB.set(4);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(12);
      });
    });

    it('should work with three or more signals', async () => {
      await runInInjectionContext(injector, async () => {
        const signalA = signal(1);
        const signalB = signal(2);
        const signalC = signal(3);

        const result = derivedFromDeferred([signalA, signalB, signalC], pipe(map(([a, b, c]) => a + b + c)), { initialValue: 0, injector });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(6);
      });
    });

    it('should work with signals of different types', async () => {
      await runInInjectionContext(injector, async () => {
        const nameSignal = signal('John');
        const ageSignal = signal(30);

        const result = derivedFromDeferred([nameSignal, ageSignal], pipe(map(([name, age]) => `${name} is ${age} years old`)), {
          initialValue: '',
          injector,
        });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe('John is 30 years old');
      });
    });
  });

  describe('object of signals', () => {
    it('should combine signals into an object', async () => {
      await runInInjectionContext(injector, async () => {
        const x = signal(10);
        const y = signal(20);

        const result = derivedFromDeferred({ x, y }, pipe(map((obj) => obj.x + obj.y)), { initialValue: 0, injector });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(30);
      });
    });

    it('should update when any source signal changes', async () => {
      await runInInjectionContext(injector, async () => {
        const width = signal(100);
        const height = signal(50);

        const result = derivedFromDeferred({ width, height }, pipe(map(({ width, height }) => width * height)), {
          initialValue: 0,
          injector,
        });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(5000);

        width.set(200);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toBe(10000);
      });
    });

    it('should preserve object keys in transformation', async () => {
      await runInInjectionContext(injector, async () => {
        const firstName = signal('John');
        const lastName = signal('Doe');

        const result = derivedFromDeferred(
          { firstName, lastName },
          pipe(map(({ firstName, lastName }) => ({ fullName: `${firstName} ${lastName}` }))),
          { initialValue: { fullName: '' }, injector },
        );

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toEqual({ fullName: 'John Doe' });
      });
    });

    it('should work with complex object transformations', async () => {
      await runInInjectionContext(injector, async () => {
        const items = signal([1, 2, 3]);
        const multiplier = signal(2);

        const result = derivedFromDeferred({ items, multiplier }, pipe(map(({ items, multiplier }) => items.map((i) => i * multiplier))), {
          initialValue: [] as number[],
          injector,
        });

        TestBed.flushEffects();
        await delay(0);

        expect(result()).toEqual([2, 4, 6]);

        multiplier.set(10);
        TestBed.flushEffects();
        await delay(0);

        expect(result()).toEqual([10, 20, 30]);
      });
    });
  });
});
