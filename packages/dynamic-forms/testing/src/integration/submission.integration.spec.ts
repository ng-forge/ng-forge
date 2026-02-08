import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, submit, FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';
import { firstValueFrom, isObservable, of, Subject, throwError, timer } from 'rxjs';
import { delay, map } from 'rxjs/operators';

/**
 * Type representing the structure of field validation errors returned by errors().
 * Errors may have kind/message at top level or nested in an 'error' property.
 */
interface FieldValidationError {
  kind?: string;
  message?: string;
  error?: {
    kind?: string;
    message?: string;
  };
}

describe('Form Submission Integration', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('Native submit() Integration', () => {
    it('should set submitting to true during submission', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Initially not submitting
        expect(formInstance().submitting()).toBe(false);

        // Create a delayed action to observe submitting state
        let submittingDuringAction = false;
        const action = async (f: FieldTree<{ email: string }>) => {
          submittingDuringAction = f().submitting();
          await new Promise((resolve) => setTimeout(resolve, 10));
          return undefined;
        };

        await submit(formInstance, action);

        // submitting should have been true during the action
        expect(submittingDuringAction).toBe(true);
        // After completion, submitting should be false
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should apply server errors to form fields', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ username: 'testuser', email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Initially no errors
        expect(formInstance.username().errors()).toEqual([]);

        // Submit with server error
        await submit(formInstance, async (f) => {
          return [
            {
              field: f.username,
              error: { kind: 'server', message: 'Username taken' },
            },
          ];
        });

        // Server error should be applied
        // The errors() method returns the field's errors directly
        const errors = formInstance.username().errors() as FieldValidationError[];
        // Check that there's at least one error with the expected kind and message
        expect(errors.length).toBeGreaterThan(0);
        const hasServerError = errors.some(
          (e: FieldValidationError) =>
            (e.kind === 'server' && e.message === 'Username taken') ||
            (e.error?.kind === 'server' && e.error?.message === 'Username taken'),
        );
        expect(hasServerError).toBe(true);
      });
    });

    it('should handle successful submission without errors', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Submit successfully
        await submit(formInstance, async () => {
          return undefined; // No errors
        });

        // Form should still be valid with no errors
        expect(formInstance().valid()).toBe(true);
        expect(formInstance().submitting()).toBe(false);
      });
    });
  });

  describe('Observable-based Submission', () => {
    it('should handle Observable action that returns undefined (success)', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Wrap the Observable action like the dynamic-form component does
        const observableAction = () => timer(10).pipe(map(() => undefined));
        const wrappedAction = async () => {
          const result = observableAction();
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        await submit(formInstance, wrappedAction);

        expect(formInstance().valid()).toBe(true);
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle Observable action that returns any value (treated as success)', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Simulates returning an HTTP response body directly
        const observableAction = () => of({ id: 123, status: 'created' });
        const wrappedAction = async () => {
          const result = observableAction();
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing edge case with invalid return type
        await submit(formInstance, wrappedAction as any);

        // Non-TreeValidationResult returns are treated as success
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle Observable action that returns server errors', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ username: 'testuser' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const observableAction = (f: typeof formInstance) =>
          of([
            {
              field: f.username,
              error: { kind: 'server', message: 'Username taken' },
            },
          ] as TreeValidationResult);

        const wrappedAction = async (f: typeof formInstance) => {
          const result = observableAction(f);
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        await submit(formInstance, wrappedAction);

        const errors = formInstance.username().errors() as FieldValidationError[];
        expect(errors.length).toBeGreaterThan(0);
        const hasServerError = errors.some(
          (e: FieldValidationError) =>
            (e.kind === 'server' && e.message === 'Username taken') ||
            (e.error?.kind === 'server' && e.error?.message === 'Username taken'),
        );
        expect(hasServerError).toBe(true);
      });
    });

    it('should set submitting to true during Observable submission', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        let submittingDuringAction = false;
        const observableAction = (f: typeof formInstance) =>
          timer(10).pipe(
            map(() => {
              submittingDuringAction = f().submitting();
              return undefined;
            }),
          );

        const wrappedAction = async (f: typeof formInstance) => {
          const result = observableAction(f);
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        await submit(formInstance, wrappedAction);

        expect(submittingDuringAction).toBe(true);
        expect(formInstance().submitting()).toBe(false);
      });
    });
  });

  describe('Submission Edge Cases', () => {
    it('should reset submitting state after action throws an exception', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        expect(formInstance().submitting()).toBe(false);

        // Action that throws an exception
        const failingAction = async () => {
          throw new Error('Simulated server error');
        };

        // Submit should throw but submitting should be cleaned up
        await expect(submit(formInstance, failingAction)).rejects.toThrow('Simulated server error');

        // After exception, submitting should be reset to false
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle Observable error emission gracefully', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        expect(formInstance().submitting()).toBe(false);

        // Observable that emits an error
        const errorObservable = () => throwError(() => new Error('Network error'));
        const wrappedAction = async () => {
          const result = errorObservable();
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        // Submit should throw but submitting should be cleaned up
        await expect(submit(formInstance, wrappedAction)).rejects.toThrow('Network error');

        // After error, submitting should be reset to false
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle submission action returning null as success', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Submit with action returning null (treated as success)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing edge case with null return
        await submit(formInstance, async () => null as any);

        // Should complete without errors
        expect(formInstance().submitting()).toBe(false);
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle delayed Observable with delayed response', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        let submittingBeforeDelay = false;
        let submittingDuringDelay = false;

        const delayedObservable = () =>
          of(undefined).pipe(
            map(() => {
              submittingBeforeDelay = formInstance().submitting();
              return undefined;
            }),
            delay(50),
            map(() => {
              submittingDuringDelay = formInstance().submitting();
              return undefined;
            }),
          );

        const wrappedAction = async () => {
          const result = delayedObservable();
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        await submit(formInstance, wrappedAction);

        // Submitting should have been true during the entire Observable chain
        expect(submittingBeforeDelay).toBe(true);
        expect(submittingDuringDelay).toBe(true);
        // After completion, submitting should be false
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle synchronous exception in action', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Action that throws synchronously before returning Promise
        const syncThrowingAction = () => {
          throw new Error('Sync error before async');
        };

        // The submit should propagate the error
        await expect(submit(formInstance, syncThrowingAction)).rejects.toThrow('Sync error before async');

        // Form should not be stuck in submitting state
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle action that throws after returning Promise', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        // Action that returns a rejected Promise
        const asyncThrowingAction = async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('Async error in action');
        };

        // The submit should propagate the error
        await expect(submit(formInstance, asyncThrowingAction)).rejects.toThrow('Async error in action');

        // Form should not be stuck in submitting state
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle multiple rapid submissions (switchMap behavior)', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        let callCount = 0;
        const completedCalls: number[] = [];

        // Slow action that takes 100ms
        const slowAction = async () => {
          const myCallNumber = ++callCount;
          await new Promise((resolve) => setTimeout(resolve, 100));
          completedCalls.push(myCallNumber);
          return undefined;
        };

        // Fire multiple submissions rapidly
        const submission1 = submit(formInstance, slowAction);
        const submission2 = submit(formInstance, slowAction);
        const submission3 = submit(formInstance, slowAction);

        // Wait for all to complete
        await Promise.all([submission1, submission2, submission3]);

        // All three should have been called (no built-in debouncing)
        expect(callCount).toBe(3);
        expect(completedCalls).toEqual([1, 2, 3]);

        // Form should not be in submitting state
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle undefined form value during submission', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        let capturedValue: unknown = null;

        // Action that captures the form value
        const captureAction = async (f: typeof formInstance) => {
          capturedValue = f().value();
          return undefined;
        };

        await submit(formInstance, captureAction);

        // Empty string should be preserved, not converted to undefined
        expect(capturedValue).toEqual({ email: '' });
      });
    });
  });

  describe('Observable Edge Cases', () => {
    it('should handle Observable that emits multiple values (only first is used)', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const emissions: number[] = [];
        const subject = new Subject<undefined>();

        // Observable that emits multiple times
        const multiEmitObservable = () =>
          subject.pipe(
            map(() => {
              emissions.push(emissions.length + 1);
              return undefined;
            }),
          );

        const wrappedAction = async () => {
          const result = multiEmitObservable();
          if (isObservable(result)) {
            // Start the subscription
            const promise = firstValueFrom(result);
            // Emit multiple values
            subject.next(undefined);
            subject.next(undefined);
            subject.next(undefined);
            return promise;
          }
          return result;
        };

        await submit(formInstance, wrappedAction);

        // Only first emission should be captured due to firstValueFrom
        expect(emissions).toEqual([1]);
      });
    });
  });
});
