import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema, submit, FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';
import { FormConfig, SubmissionConfig } from '../../models';

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
    it('should define a valid submission config with action', () => {
      const submissionConfig: SubmissionConfig<{ email: string }> = {
        action: async (form) => {
          const value = form().value();
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 10));
          return undefined; // No errors
        },
      };

      expect(submissionConfig.action).toBeDefined();
      expect(typeof submissionConfig.action).toBe('function');
    });

    it('should allow submission config to return server errors', () => {
      const submissionConfig: SubmissionConfig<{ username: string }> = {
        action: async (form) => {
          const value = form().value();
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

  describe('FormConfig with Submission', () => {
    it('should accept submission configuration in FormConfig', () => {
      const config: FormConfig = {
        fields: [
          { type: 'input', key: 'email', label: 'Email' },
          { type: 'submit', key: 'submit', label: 'Submit' },
        ],
        submission: {
          action: async (form) => {
            return undefined;
          },
        },
      };

      expect(config.submission).toBeDefined();
      expect(config.submission?.action).toBeDefined();
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
});
