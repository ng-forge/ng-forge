import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import type { FieldTree, SchemaPath, ValidationError } from '@angular/forms/signals';
import { form, schema, validate, requiredError } from '@angular/forms/signals';
import { of } from 'rxjs';
import { createResolvedErrorsSignal } from '@ng-forge/dynamic-forms/integration';
import { ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import { applyValidator } from '@ng-forge/dynamic-forms/internal';
import { FieldContextRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../state/form-state-manager';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
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

    it('should let a configured field-level message win over a validator-provided message', () => {
      // GAP 3(a): precedence field-level > validator-provided error.message.
      // The validator attaches its own human-readable message via
      // requiredError({ message }); the field-level config must still win.
      runInInjectionContext(injector, () => {
        const initialValue = signal({ email: '' });
        const testForm = form(
          initialValue,
          schema<{ email: string }>((path) => {
            validate(path.email as SchemaPath<string>, () => requiredError({ message: 'Validator: required from validator' }));
          }),
        );

        const emailField = signal((testForm as unknown as Record<string, FieldTree<string>>)['email']);

        const fieldMessages = signal<ValidationMessages>({
          required: 'Field-level: Email is required',
        });
        const defaultMessages = signal<ValidationMessages>({});

        const resolvedErrors = createResolvedErrorsSignal(emailField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'required', message: 'Field-level: Email is required' }]);
      });
    });

    it('should fall back to the validator-provided message when no field-level or default message exists', () => {
      // GAP 3: lowest configured layer — error.message from the validator is
      // used when neither field-level nor default messages are provided.
      runInInjectionContext(injector, () => {
        const initialValue = signal({ email: '' });
        const testForm = form(
          initialValue,
          schema<{ email: string }>((path) => {
            validate(path.email as SchemaPath<string>, () => requiredError({ message: 'Validator: required from validator' }));
          }),
        );

        const emailField = signal((testForm as unknown as Record<string, FieldTree<string>>)['email']);

        const fieldMessages = signal<ValidationMessages>({});
        const defaultMessages = signal<ValidationMessages>({});

        const resolvedErrors = createResolvedErrorsSignal(emailField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'required', message: 'Validator: required from validator' }]);
      });
    });
  });

  describe('function messages', () => {
    /** Form with a single maxLength(5)-violating field, returning its FieldTree signal */
    function createMaxLengthField() {
      const initialValue = signal({ username: 'exceeds five' });
      const testForm = form(
        initialValue,
        schema<{ username: string }>((path) => {
          applyValidator({ type: 'maxLength', value: 5 }, path.username as SchemaPath<string>);
        }),
      );
      return signal((testForm as unknown as Record<string, FieldTree<string>>)['username']);
    }

    it('should pass the validation error to the function and resolve its returned string', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        let receivedError: ValidationError | undefined;
        const fieldMessages = signal<ValidationMessages>({
          maxLength: (error) => {
            receivedError = error;
            const { maxLength } = error as ValidationError & { maxLength: number };
            return `Must be at most ${maxLength} characters`;
          },
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, signal<ValidationMessages>({}));

        TestBed.flushEffects();

        expect(receivedError?.kind).toBe('maxLength');
        expect((receivedError as (ValidationError & { maxLength?: number }) | undefined)?.maxLength).toBe(5);
        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Must be at most 5 characters' }]);
      });
    });

    it('should resolve a function returning an Observable<string> (i18n case)', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        const fieldMessages = signal<ValidationMessages>({
          maxLength: (error) => {
            const { maxLength } = error as ValidationError & { maxLength: number };
            return of(`Translated: at most ${maxLength} characters`);
          },
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, signal<ValidationMessages>({}));

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Translated: at most 5 characters' }]);
      });
    });

    it('should resolve a function returning a Signal<string>', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        const fieldMessages = signal<ValidationMessages>({
          maxLength: (error) => {
            const { maxLength } = error as ValidationError & { maxLength: number };
            return signal(`Signal: at most ${maxLength} characters`);
          },
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, signal<ValidationMessages>({}));

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Signal: at most 5 characters' }]);
      });
    });

    it('should let a field-level function win over a default-level function', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        const fieldMessages = signal<ValidationMessages>({
          maxLength: () => 'Field-level function message',
        });
        const defaultMessages = signal<ValidationMessages>({
          maxLength: () => 'Default-level function message',
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, defaultMessages);

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Field-level function message' }]);
      });
    });

    it('should keep plain DynamicText messages working unchanged alongside functions', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        const fieldMessages = signal<ValidationMessages>({
          maxLength: 'Plain: too long ({{requiredLength}} max)',
          required: () => 'Unrelated function message',
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, signal<ValidationMessages>({}));

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Plain: too long (5 max)' }]);
      });
    });

    it('should interpolate {{param}} placeholders left in a function-returned string', () => {
      runInInjectionContext(injector, () => {
        const usernameField = createMaxLengthField();

        const fieldMessages = signal<ValidationMessages>({
          maxLength: () => 'Function: at most {{requiredLength}} characters',
        });

        const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, signal<ValidationMessages>({}));

        TestBed.flushEffects();

        expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Function: at most 5 characters' }]);
      });
    });
  });
});
