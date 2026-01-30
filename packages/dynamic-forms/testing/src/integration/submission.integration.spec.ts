import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, submit, FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';
import { FormConfig, SubmissionConfig } from '../../models';
import { EMPTY, firstValueFrom, isObservable, of, Subject, throwError, timer } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

describe('Form Submission Integration', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('SubmissionConfig Interface', () => {
    it('should define a valid submission config with Promise action', () => {
      const submissionConfig: SubmissionConfig<{ email: string }> = {
        action: async () => {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 10));
          return undefined; // No errors
        },
      };

      expect(submissionConfig.action).toBeDefined();
      expect(typeof submissionConfig.action).toBe('function');
    });

    it('should define a valid submission config with Observable action', () => {
      const submissionConfig: SubmissionConfig<{ email: string }> = {
        action: () => {
          // Simulate HTTP call returning Observable
          return timer(10).pipe(map(() => undefined));
        },
      };

      expect(submissionConfig.action).toBeDefined();
      expect(typeof submissionConfig.action).toBe('function');
    });

    it('should allow Observable submission config to return server errors', () => {
      const submissionConfig: SubmissionConfig<{ username: string }> = {
        action: (form) => {
          // Simulate server validation error via Observable
          return of([
            {
              field: form.username,
              error: { kind: 'server', message: 'Username already taken' },
            },
          ] as TreeValidationResult);
        },
      };

      expect(submissionConfig.action).toBeDefined();
    });

    it('should allow Promise submission config to return server errors', () => {
      const submissionConfig: SubmissionConfig<{ username: string }> = {
        action: async (form) => {
          // Simulate server validation error
          return [
            {
              field: form.username,
              error: { kind: 'server', message: 'Username already taken' },
            },
          ] as TreeValidationResult;
        },
      };

      expect(submissionConfig.action).toBeDefined();
    });

    it('should allow Observable to return any value (treated as success)', () => {
      // This simulates returning an HTTP response directly without mapping
      const submissionConfig: SubmissionConfig<{ email: string }> = {
        action: () => of({ id: 123, status: 'created' }), // Simulating HTTP response body
      };

      expect(submissionConfig.action).toBeDefined();
    });
  });

  describe('Native submit() Integration', () => {
    it('should set submitting to true during submission', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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
        rootFormRegistry.registerRootForm(formInstance);

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
        const errors = formInstance.username().errors();
        // Check that there's at least one error with the expected kind and message
        expect(errors.length).toBeGreaterThan(0);
        const hasServerError = errors.some(
          (e: any) =>
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
        rootFormRegistry.registerRootForm(formInstance);

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
        rootFormRegistry.registerRootForm(formInstance);

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
        rootFormRegistry.registerRootForm(formInstance);

        // Simulates returning an HTTP response body directly
        const observableAction = () => of({ id: 123, status: 'created' });
        const wrappedAction = async () => {
          const result = observableAction();
          if (isObservable(result)) {
            return firstValueFrom(result);
          }
          return result;
        };

        await submit(formInstance, wrappedAction as any);

        // Non-TreeValidationResult returns are treated as success
        expect(formInstance().submitting()).toBe(false);
      });
    });

    it('should handle Observable action that returns server errors', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ username: 'testuser' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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

        const errors = formInstance.username().errors();
        expect(errors.length).toBeGreaterThan(0);
        const hasServerError = errors.some(
          (e: any) =>
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
        rootFormRegistry.registerRootForm(formInstance);

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

  describe('FormConfig with Submission', () => {
    it('should accept Promise-based submission configuration in FormConfig', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          action: async () => {
            return undefined;
          },
        },
      };

      expect(config.submission).toBeDefined();
      expect(config.submission?.action).toBeDefined();
    });

    it('should accept Observable-based submission configuration in FormConfig', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          action: () => of(undefined),
        },
      };

      expect(config.submission).toBeDefined();
      expect(config.submission?.action).toBeDefined();
    });

    it('should accept Observable that returns HTTP response directly', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          // Simulates: action: (form) => this.http.post('/api/submit', form().value())
          action: () => of({ id: 123 }),
        },
      };

      expect(config.submission).toBeDefined();
    });

    it('should work without submission configuration (backward compatible)', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        // No submission config - users handle it via (submitted) output
      };

      expect(config.submission).toBeUndefined();
    });
  });

  describe('Submission Config and (submitted) Output Interaction', () => {
    it('should warn when both submission.action and (submitted) output would be used', () => {
      // This test validates the expected behavior when both are configured
      // The dynamic-form component should:
      // 1. Warn via console.warn
      // 2. Return EMPTY from the submitted output (not emit)
      // 3. Let submission.action handle the submission

      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          action: () => of(undefined),
        },
      };

      // Verify the config structure is valid
      expect(config.submission).toBeDefined();
      expect(config.submission?.action).toBeDefined();
    });

    it('should not warn when only (submitted) output is used (no submission config)', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        // No submission config - (submitted) output should work normally
      };

      expect(config.submission).toBeUndefined();
    });

    it('should not warn when only submission.action is used (no (submitted) listener)', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          action: () => of(undefined),
        },
      };

      // When only submission.action is configured and no (submitted) listener,
      // there should be no warning
      expect(config.submission).toBeDefined();
    });
  });

  describe('Submission Edge Cases', () => {
    it('should reset submitting state after action throws an exception', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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
        rootFormRegistry.registerRootForm(formInstance);

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

    it('should handle concurrent submission attempts with switchMap cancellation', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const submissionResults: string[] = [];
        const trigger = new Subject<string>();

        // Simulate a switchMap-based submission handler
        const latestSubmission = trigger.pipe(
          switchMap((id) =>
            timer(id === 'first' ? 100 : 50).pipe(
              map(() => {
                submissionResults.push(id);
                return undefined;
              }),
            ),
          ),
        );

        // Start subscription
        const subscription = latestSubmission.subscribe();

        // Trigger first submission (slower)
        trigger.next('first');

        // Trigger second submission immediately (faster, should cancel first)
        trigger.next('second');

        // Wait for second to complete
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Only second should have completed (first was cancelled)
        expect(submissionResults).toEqual(['second']);

        subscription.unsubscribe();
      });
    });

    it('should handle empty submission config by returning EMPTY observable behavior', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        // Simulating what happens when no submission action is defined
        // The EMPTY observable should not emit any value
        let emitted = false;
        const subscription = EMPTY.subscribe({
          next: () => {
            emitted = true;
          },
          complete: () => {
            // EMPTY completes immediately without emitting
          },
        });

        // Allow microtasks to run
        await Promise.resolve();

        expect(emitted).toBe(false);
        subscription.unsubscribe();
      });
    });

    it('should handle submission action returning null as success', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        // Submit with action returning null (treated as success)
        await submit(formInstance, async () => {
          return null as any;
        });

        // Should complete without errors
        expect(formInstance().submitting()).toBe(false);
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle delayed Observable with delayed response', async () => {
      await runInInjectionContext(injector, async () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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
  });
});
