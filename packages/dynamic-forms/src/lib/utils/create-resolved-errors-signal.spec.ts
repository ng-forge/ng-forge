import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import type { FieldTree, SchemaPath } from '@angular/forms/signals';
import { form, schema } from '@angular/forms/signals';
import { createResolvedErrorsSignal } from '@ng-forge/dynamic-forms/integration';
import { ValidationMessages } from '../models/validation-types';
import { applyValidator } from '../core/validation/validator-factory';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { FormStateManager } from '../state/form-state-manager';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { ConsoleLogger } from '../providers/features/logger/console-logger';

describe('createResolvedErrorsSignal', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        // Provide ConsoleLogger to enable logging in tests
        { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      ],
    });
    injector = TestBed.inject(Injector);
  });

  describe('default validation messages', () => {
    it('should use field-level validation message when available', () => {
      runInInjectionContext(injector, () => {
        // Create a form with required validation
        const initialValue = signal({ email: '' });
        const testForm = form(
          initialValue,
          schema<{ email: string }>((path) => {
            applyValidator({ type: 'required' }, path.email as SchemaPath<string>);
          }),
        );

        const emailField = signal((testForm as unknown as Record<string, FieldTree<string>>)['email']);

        const fieldMessages = signal<ValidationMessages>({
          required: 'Field-level: Email is required',
        });

        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(emailField, fieldMessages, defaultMessages);

        // Flush any pending effects to ensure signals are evaluated
        TestBed.flushEffects();

        // Field-level message should take precedence
        expect(resolvedErrors()).toEqual([{ kind: 'required', message: 'Field-level: Email is required' }]);
      });
    });

    it('should fall back to default validation message when field-level is not provided', () => {
      runInInjectionContext(injector, () => {
        const initialValue = signal({ email: '' });
        const testForm = form(
          initialValue,
          schema<{ email: string }>((path) => {
            applyValidator({ type: 'required' }, path.email as SchemaPath<string>);
          }),
        );

        const emailField = signal((testForm as unknown as Record<string, FieldTree<string>>)['email']);

        const fieldMessages = signal<ValidationMessages>({});

        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(emailField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        // Should use default message as fallback
        expect(resolvedErrors()).toEqual([{ kind: 'required', message: 'Default: This field is required' }]);
      });
    });

    it('should not show error and log warning when neither field-level nor default is provided', () => {
      runInInjectionContext(injector, () => {
        const initialValue = signal({ email: '' });
        const testForm = form(
          initialValue,
          schema<{ email: string }>((path) => {
            applyValidator({ type: 'required' }, path.email as SchemaPath<string>);
          }),
        );

        const emailField = signal((testForm as unknown as Record<string, FieldTree<string>>)['email']);

        const fieldMessages = signal<ValidationMessages>({});
        const defaultMessages = signal<ValidationMessages>({});

        // Spy on console.warn to verify warning is logged
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const resolvedErrors = createResolvedErrorsSignal(emailField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        // Should not show any errors (filtered out)
        expect(resolvedErrors().length).toBe(0);

        // Should log a warning
        expect(warnSpy).toHaveBeenCalledWith(
          '[Dynamic Forms]',
          expect.stringContaining('No validation message found for error kind "required"'),
        );

        warnSpy.mockRestore();
      });
    });

    it('should handle multiple validation errors with mixed sources', () => {
      runInInjectionContext(injector, () => {
        const initialValue = signal({ password: '' });
        const testForm = form(
          initialValue,
          schema<{ password: string }>((path) => {
            applyValidator({ type: 'required' }, path.password as SchemaPath<string>);
            applyValidator({ type: 'minLength', value: 8 }, path.password as SchemaPath<string>);
            applyValidator({ type: 'pattern', value: '^[a-zA-Z0-9]+$' }, path.password as SchemaPath<string>);
          }),
        );

        const passwordField = signal((testForm as unknown as Record<string, FieldTree<string>>)['password']);

        // Field-level only has 'minLength'
        const fieldMessages = signal<ValidationMessages>({
          minLength: 'Field-level: Password must be at least {{requiredLength}} characters',
        });

        // Default has 'required' and 'pattern'
        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
          pattern: 'Default: Invalid format',
        });

        const resolvedErrors = createResolvedErrorsSignal(passwordField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        const errors = resolvedErrors();
        // Angular signal forms may short-circuit after first validation failure
        expect(errors.length).toBeGreaterThan(0);

        // Verify that we're using the correct fallback for the required error
        const requiredError = errors.find((e) => e.kind === 'required');
        expect(requiredError).toBeDefined();
        expect(requiredError?.message).toBe('Default: This field is required');
      });
    });

    it('should interpolate parameters in default messages', () => {
      runInInjectionContext(injector, () => {
        const initialValue = signal({ age: 5 });
        const testForm = form(
          initialValue,
          schema<{ age: number }>((path) => {
            applyValidator({ type: 'min', value: 18 }, path.age as SchemaPath<number>);
          }),
        );

        const ageField = signal((testForm as unknown as Record<string, FieldTree<number>>)['age']);

        const fieldMessages = signal<ValidationMessages>({});

        const defaultMessages = signal<ValidationMessages>({
          min: 'Default: Minimum value is {{min}}',
        });

        const resolvedErrors = createResolvedErrorsSignal(ageField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'min', message: 'Default: Minimum value is 18' }]);
      });
    });
  });
});
