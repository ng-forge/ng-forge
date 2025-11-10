import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { createResolvedErrorsSignal } from './create-resolved-errors-signal';
import { ValidationMessages } from '../models/validation-types';
import { form } from '@angular/forms/signals';

describe('createResolvedErrorsSignal', () => {
  describe('default validation messages', () => {
    it('should use field-level validation message when available', () => {
      TestBed.runInInjectionContext(() => {
        // Create a form with a field
        const testForm = form<{ email: string }>({ email: '' });
        const formInstance = testForm();
        const childrenMap = formInstance.structure.childrenMap();
        const formField = childrenMap.get('email');
        const emailField = formField.fieldProxy;

        // Set error on the field
        emailField().errors.set([{ kind: 'required', message: 'Built-in required error' }]);
        emailField().touched.set(true);

        const fieldMessages = signal<ValidationMessages>({
          required: 'Field-level: Email is required',
        });

        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          emailField,
          fieldMessages,
          defaultMessages
        );

        // Field-level message should take precedence
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Field-level: Email is required' },
        ]);
      });
    });

    it('should fall back to default validation message when field-level is not provided', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ email: string }>({ email: '' });
        const emailField = testForm().structure.childrenMap().get('email').fieldProxy;

        emailField().errors.set([{ kind: 'required', message: 'Built-in required error' }]);
        emailField().touched.set(true);

        const fieldMessages = signal<ValidationMessages>({});

        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          emailField,
          fieldMessages,
          defaultMessages
        );

        // Should use default message as fallback
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Default: This field is required' },
        ]);
      });
    });

    it('should fall back to built-in message when neither field-level nor default is provided', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ email: string }>({ email: '' });
        const emailField = testForm().structure.childrenMap().get('email').fieldProxy;

        emailField().errors.set([{ kind: 'required', message: 'Built-in required error' }]);
        emailField().touched.set(true);

        const fieldMessages = signal<ValidationMessages>({});
        const defaultMessages = signal<ValidationMessages>({});

        const resolvedErrors = createResolvedErrorsSignal(
          emailField,
          fieldMessages,
          defaultMessages
        );

        // Should use built-in error message
        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Built-in required error' },
        ]);
      });
    });

    it('should handle multiple validation errors with mixed sources', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ password: string }>({ password: 'ab' });
        const passwordField = testForm().structure.childrenMap().get('password').fieldProxy;

        passwordField().errors.set([
          { kind: 'required', message: 'Built-in required' },
          { kind: 'minLength', message: 'Built-in minLength', requiredLength: 8, actualLength: 2 },
          { kind: 'pattern', message: 'Built-in pattern' },
        ]);
        passwordField().touched.set(true);

        // Field-level only has 'minLength'
        const fieldMessages = signal<ValidationMessages>({
          minLength: 'Field-level: Password must be at least {{requiredLength}} characters',
        });

        // Default has 'required' and 'pattern'
        const defaultMessages = signal<ValidationMessages>({
          required: 'Default: This field is required',
          pattern: 'Default: Invalid format',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          passwordField,
          fieldMessages,
          defaultMessages
        );

        expect(resolvedErrors()).toEqual([
          { kind: 'required', message: 'Default: This field is required' },
          { kind: 'minLength', message: 'Field-level: Password must be at least 8 characters' },
          { kind: 'pattern', message: 'Default: Invalid format' },
        ]);
      });
    });

    it('should interpolate parameters in default messages', () => {
      TestBed.runInInjectionContext(() => {
        const testForm = form<{ age: number }>({ age: 5 });
        const ageField = testForm().structure.childrenMap().get('age').fieldProxy;

        ageField().errors.set([
          { kind: 'min', message: 'Built-in min', min: 18, actual: 5 },
        ]);
        ageField().touched.set(true);

        const fieldMessages = signal<ValidationMessages>({});

        const defaultMessages = signal<ValidationMessages>({
          min: 'Default: Minimum value is {{min}}',
        });

        const resolvedErrors = createResolvedErrorsSignal(
          ageField,
          fieldMessages,
          defaultMessages
        );

        expect(resolvedErrors()).toEqual([
          { kind: 'min', message: 'Default: Minimum value is 18' },
        ]);
      });
    });
  });
});
