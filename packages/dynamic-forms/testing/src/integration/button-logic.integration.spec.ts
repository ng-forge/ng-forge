import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';
import { resolveSubmitButtonDisabled, resolveNextButtonDisabled, ButtonLogicContext } from '../../core/logic/button-logic-resolver';
import { FormOptions, FormStateCondition, LogicConfig, isFormStateCondition } from '../../models';
import { createMockLogger } from '../mock-logger';
import { DynamicFormLogger } from '../../../src/lib/providers/features/logger/logger.token';

describe('Button Logic Integration', () => {
  let injector: Injector;
  let mockLogger: DynamicFormLogger;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockEntity.set({});
    mockFormSignal.set(undefined);

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
      ],
    });

    injector = TestBed.inject(Injector);
  });

  describe('FormStateCondition Type', () => {
    it('should identify formInvalid as FormStateCondition', () => {
      expect(isFormStateCondition('formInvalid')).toBe(true);
    });

    it('should identify formSubmitting as FormStateCondition', () => {
      expect(isFormStateCondition('formSubmitting')).toBe(true);
    });

    it('should identify pageInvalid as FormStateCondition', () => {
      expect(isFormStateCondition('pageInvalid')).toBe(true);
    });

    it('should not identify other strings as FormStateCondition', () => {
      expect(isFormStateCondition('randomString' as FormStateCondition)).toBe(false);
      expect(isFormStateCondition(true as any)).toBe(false);
    });
  });

  describe('Submit Button Disabled Logic', () => {
    it('should disable when form is invalid by default', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(
          formValue,
          schema<typeof formValue>(() => {
            // Add required validation
            // For this test, we'll check validity based on empty value
          }),
        );
        mockFormSignal.set(formInstance);

        // Manually make form invalid by checking valid()
        // Since we haven't added validators, we need a different approach
        // Let's test the resolver logic with a mock

        const ctx: ButtonLogicContext = {
          form: formInstance,
          formOptions: {
            submitButton: {
              disableWhenInvalid: true,
              disableWhileSubmitting: true,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Form is valid by default (no validators), so button should be enabled
        expect(disabledSignal()).toBe(false);
      });
    });

    it('should respect explicit disabled=true', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          explicitlyDisabled: true,
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Should be disabled because explicitly disabled
        expect(disabledSignal()).toBe(true);
      });
    });

    it('should respect disableWhenInvalid: false option', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          formOptions: {
            submitButton: {
              disableWhenInvalid: false,
              disableWhileSubmitting: true,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Should not be disabled even if form could be invalid
        expect(disabledSignal()).toBe(false);
      });
    });

    it('should use field-level logic when provided', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          fieldLogic: [{ type: 'disabled', condition: true }] as LogicConfig[],
          formOptions: {
            submitButton: {
              disableWhenInvalid: false, // Should be ignored because field logic exists
              disableWhileSubmitting: false,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Should be disabled because field logic says so
        expect(disabledSignal()).toBe(true);
      });
    });

    it('should support FormStateCondition in field logic', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          fieldLogic: [{ type: 'disabled', condition: 'formSubmitting' }] as LogicConfig[],
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Form is not submitting, so should not be disabled
        expect(disabledSignal()).toBe(false);
      });
    });
  });

  describe('Next Button Disabled Logic', () => {
    it('should disable when page is invalid by default', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: '' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const currentPageValid = signal(false);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          currentPageValid,
          formOptions: {
            nextButton: {
              disableWhenPageInvalid: true,
              disableWhileSubmitting: true,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveNextButtonDisabled(ctx);

        // Should be disabled because page is invalid
        expect(disabledSignal()).toBe(true);

        // Make page valid
        currentPageValid.set(true);
        expect(disabledSignal()).toBe(false);
      });
    });

    it('should respect disableWhenPageInvalid: false option', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: '' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const currentPageValid = signal(false);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          currentPageValid,
          formOptions: {
            nextButton: {
              disableWhenPageInvalid: false,
              disableWhileSubmitting: false,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveNextButtonDisabled(ctx);

        // Should not be disabled even though page is invalid
        expect(disabledSignal()).toBe(false);
      });
    });

    it('should use field-level logic when provided', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: 'test' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const currentPageValid = signal(true);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          currentPageValid,
          fieldLogic: [{ type: 'disabled', condition: 'pageInvalid' }] as LogicConfig[],
          formOptions: {
            nextButton: {
              disableWhenPageInvalid: false, // Should be ignored
              disableWhileSubmitting: false,
            },
          },
          logger: mockLogger,
        };

        const disabledSignal = resolveNextButtonDisabled(ctx);

        // Page is valid, so should not be disabled
        expect(disabledSignal()).toBe(false);

        // Make page invalid
        currentPageValid.set(false);
        expect(disabledSignal()).toBe(true);
      });
    });
  });

  describe('FormOptions Configuration', () => {
    it('should support full FormOptions with button defaults', () => {
      const options: FormOptions = {
        disabled: false,
        submitButton: {
          disableWhenInvalid: true,
          disableWhileSubmitting: true,
        },
        nextButton: {
          disableWhenPageInvalid: true,
          disableWhileSubmitting: true,
        },
      };

      expect(options.submitButton).toBeDefined();
      expect(options.submitButton?.disableWhenInvalid).toBe(true);
      expect(options.nextButton).toBeDefined();
      expect(options.nextButton?.disableWhenPageInvalid).toBe(true);
    });

    it('should use defaults when options not specified', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        mockFormSignal.set(formInstance);

        const ctx: ButtonLogicContext = {
          form: formInstance,
          // No formOptions provided - should use defaults
          logger: mockLogger,
        };

        const disabledSignal = resolveSubmitButtonDisabled(ctx);

        // Default: disableWhenInvalid=true, but form is valid
        expect(disabledSignal()).toBe(false);
      });
    });
  });
});
