import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { createResolvedErrorsSignal } from './create-resolved-errors-signal';
import { ValidationMessages } from '../models/validation-types';
import { FieldTree, form } from '@angular/forms/signals';

describe('createResolvedErrorsSignal', () => {
  describe('form-level validation messages', () => {
    it('should use field-level validation message when available', () => {
      TestBed.runInInjectionContext(() => {
        // Create a form with a required field that has an error
        const testForm = form<{ email: string }>({ email: '' });
        const emailField = testForm.structure.childrenMap().get('email')!;

        // Mark as touched and add error
        emailField().touched.set(true);
        emailField().errors.set([{ kind: 'required', message: 'Default required error' }]);

        const fieldMessages = signal<ValidationMessages>({
          required: 'Field-level: Email is required',
        });

        const formMessages = signal<ValidationMessages>({
          required: 'Form-level: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          signal(emailField as FieldTree<string>),
          fieldMessages,
          formMessages
        );

        // Field-level message should take precedence
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Field-level: Email is required' },
        ]);
      });
    });

    it('should fall back to form-level validation message when field-level is not provided', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ email: string }>({ email: '' });
        const emailField = testForm.structure.childrenMap().get('email')!;

        emailField().touched.set(true);
        emailField().errors.set([{ kind: 'required', message: 'Default required error' }]);

        const fieldMessages = signal<ValidationMessages>({});

        const formMessages = signal<ValidationMessages>({
          required: 'Form-level: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          signal(emailField as FieldTree<string>),
          fieldMessages,
          formMessages
        );

        // Should use form-level message as fallback
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Form-level: This field is required' },
        ]);
      });
    });

    it('should fall back to default message when neither field-level nor form-level is provided', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ email: string }>({ email: '' });
        const emailField = testForm.structure.childrenMap().get('email')!;

        emailField().touched.set(true);
        emailField().errors.set([{ kind: 'required', message: 'Default required error' }]);

        const fieldMessages = signal<ValidationMessages>({});
        const formMessages = signal<ValidationMessages>({});

        const resolvedErrors = createResolvedErrorsSignal(
          signal(emailField as FieldTree<string>),
          fieldMessages,
          formMessages
        );

        // Should use default error message
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Default required error' },
        ]);
      });
    });

    it('should handle multiple validation errors with mixed sources', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ password: string }>({ password: 'ab' });
        const passwordField = testForm.structure.childrenMap().get('password')!;

        passwordField().touched.set(true);
        passwordField().errors.set([
          { kind: 'required', message: 'Default required' },
          { kind: 'minLength', message: 'Default minLength', requiredLength: 8, actualLength: 2 },
          { kind: 'pattern', message: 'Default pattern' },
        ]);

        // Field-level only has 'minLength'
        const fieldMessages = signal<ValidationMessages>({
          minLength: 'Field-level: Password must be at least {{requiredLength}} characters',
        });

        // Form-level has 'required' and 'pattern'
        const formMessages = signal<ValidationMessages>({
          required: 'Form-level: This field is required',
          pattern: 'Form-level: Invalid format',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          signal(passwordField as FieldTree<string>),
          fieldMessages,
          formMessages
        );

        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Form-level: This field is required' },
          { kind: 'minLength', message: 'Field-level: Password must be at least 8 characters' },
          { kind: 'pattern', message: 'Form-level: Invalid format' },
        ]);
      });
    });

    it('should interpolate parameters in form-level messages', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ age: number }>({ age: 5 });
        const ageField = testForm.structure.childrenMap().get('age')!;

        ageField().touched.set(true);
        ageField().errors.set([
          { kind: 'min', message: 'Default min', min: 18, actual: 5 },
        ]);

        const fieldMessages = signal<ValidationMessages>({});

        const formMessages = signal<ValidationMessages>({
          min: 'Form-level: Minimum value is {{min}}',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          signal(ageField as FieldTree<number>),
          fieldMessages,
          formMessages
        );

        expect(resolvedErrors()).toEqual([
          { kind: 'min', message: 'Form-level: Minimum value is 18' },
        ]);
      });
    });
  });
});
