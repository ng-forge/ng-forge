/**
 * Exhaustive type tests for ValidationMessages type.
 */
import { expectTypeOf } from 'vitest';
import { of, type Observable } from 'rxjs';
import { signal, type Signal } from '@angular/core';
import type { DynamicText } from './types/dynamic-text';
import type { ValidationError, ValidationMessage, ValidationMessageResolver, ValidationMessages } from './validation-types';

// ============================================================================
// ValidationMessages - Whitelist Test
// ============================================================================

describe('ValidationMessages - Exhaustive Whitelist', () => {
  it('should have built-in validation message keys', () => {
    type ExpectedKeys = 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';

    const messages: ValidationMessages = {
      required: 'This field is required',
      email: 'Invalid email',
      min: 'Value too small',
      max: 'Value too large',
      minLength: 'Too short',
      maxLength: 'Too long',
      pattern: 'Invalid pattern',
    };

    // Verify that the interface accepts these assignments
    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept index signature for custom validation messages', () => {
    const messages: ValidationMessages = {
      customValidator: 'Custom error message',
      anotherValidator: 'Another error message',
    };

    expectTypeOf(messages['customValidator']).toMatchTypeOf<ValidationMessage | undefined>();
    expectTypeOf(messages['anotherValidator']).toMatchTypeOf<ValidationMessage | undefined>();
  });

  it('should have all properties as optional', () => {
    const messages: ValidationMessages = {};
    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });
});

// ============================================================================
// ValidationMessages - Property Types
// ============================================================================

describe('ValidationMessages - Property Types', () => {
  it('required should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['required']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('email should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['email']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('min should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['min']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('max should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['max']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('minLength should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['minLength']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('maxLength should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['maxLength']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('pattern should be ValidationMessage', () => {
    expectTypeOf<ValidationMessages['pattern']>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('index signature should be ValidationMessage', () => {
    type IndexSignature = ValidationMessages[string];
    expectTypeOf<IndexSignature>().toEqualTypeOf<ValidationMessage | undefined>();
  });

  it('ValidationMessage should be DynamicText or a message resolver', () => {
    expectTypeOf<ValidationMessage>().toEqualTypeOf<DynamicText | ValidationMessageResolver>();
  });
});

// ============================================================================
// ValidationMessages - Usage Examples
// ============================================================================

describe('ValidationMessages - Usage Examples', () => {
  it('should accept static string messages', () => {
    const messages = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: 'Minimum length is 3 characters',
      maxLength: 'Maximum length is 50 characters',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages.required).toEqualTypeOf<'This field is required'>();
    expectTypeOf(messages.email).toEqualTypeOf<'Please enter a valid email address'>();
  });

  it('should accept translation keys', () => {
    const messages = {
      required: 'validation.required',
      email: 'validation.email.invalid',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages.required).toEqualTypeOf<'validation.required'>();
  });

  it('should accept custom validator messages', () => {
    const messages = {
      passwordStrength: 'Password is too weak',
      passwordMismatch: 'Passwords do not match',
      uniqueEmail: 'Email already exists',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages.passwordStrength).toEqualTypeOf<'Password is too weak'>();
    expectTypeOf(messages.passwordMismatch).toEqualTypeOf<'Passwords do not match'>();
  });

  it('should accept messages with interpolation placeholders', () => {
    const messages = {
      min: 'Value must be at least {{min}}',
      max: 'Value must be at most {{max}}',
      minLength: 'Must be at least {{requiredLength}} characters',
      maxLength: 'Must be at most {{requiredLength}} characters',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages.min).toEqualTypeOf<'Value must be at least {{min}}'>();
  });

  it('should accept mixed built-in and custom messages', () => {
    const messages = {
      required: 'This field is required',
      email: 'Invalid email format',
      passwordStrength: 'Password must contain uppercase, lowercase, and numbers',
      confirmPassword: 'Passwords must match',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept empty messages object', () => {
    const messages = {} as const satisfies ValidationMessages;
    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept partial messages', () => {
    const messages = {
      required: 'Required',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept all built-in messages', () => {
    const messages = {
      required: 'Field is required',
      email: 'Invalid email',
      min: 'Too small',
      max: 'Too large',
      minLength: 'Too short',
      maxLength: 'Too long',
      pattern: 'Invalid format',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });
});

// ============================================================================
// ValidationMessages - DynamicText Compatibility
// ============================================================================

describe('ValidationMessages - DynamicText Compatibility', () => {
  it('should accept DynamicText values', () => {
    const messages: ValidationMessages = {
      required: 'validation.required' as DynamicText,
      email: 'validation.email' as DynamicText,
    };

    // Verify that the interface accepts DynamicText assignments
    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should work with different DynamicText types', () => {
    const staticMessage: ValidationMessages = {
      required: 'Required field',
    };

    const translationKey: ValidationMessages = {
      required: 'form.validation.required',
    };

    expectTypeOf(staticMessage).toMatchTypeOf<ValidationMessages>();
    expectTypeOf(translationKey).toMatchTypeOf<ValidationMessages>();
  });
});

// ============================================================================
// ValidationMessages - Complex Scenarios
// ============================================================================

describe('ValidationMessages - Complex Scenarios', () => {
  it('should accept messages for complex validation scenarios', () => {
    const messages = {
      // Built-in validators
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: 'Password must be at least 8 characters',
      maxLength: 'Password cannot exceed 100 characters',
      pattern: 'Password must contain letters and numbers',

      // Custom validators
      passwordStrength: 'Password must contain uppercase, lowercase, numbers, and symbols',
      passwordMismatch: 'Passwords do not match',
      uniqueEmail: 'This email is already registered',
      ageRestriction: 'You must be at least 18 years old',

      // Domain-specific validators
      creditCard: 'Invalid credit card number',
      phoneNumber: 'Invalid phone number format',
      zipCode: 'Invalid ZIP code',
      url: 'Invalid URL format',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept messages with nested object notation keys', () => {
    const messages = {
      'address.zipCode': 'Invalid ZIP code',
      'contact.email': 'Invalid email address',
    } as const satisfies ValidationMessages;

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept function messages for every built-in and custom key', () => {
    const messages: ValidationMessages = {
      required: (error: ValidationError) => `Missing: ${error.kind}`,
      email: (error) => `Invalid: ${error.kind}`,
      min: (error) => `Too small: ${error.kind}`,
      max: (error) => `Too large: ${error.kind}`,
      minLength: (error) => `Too short: ${error.kind}`,
      maxLength: (error) => `Too long: ${error.kind}`,
      pattern: (error) => `Bad format: ${error.kind}`,
      customValidator: (error) => `Custom: ${error.kind}`,
    };

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept function messages returning Observable or Signal', () => {
    const messages: ValidationMessages = {
      maxLength: (error: ValidationError): Observable<string> => of(error.kind),
      minLength: (error: ValidationError): Signal<string> => signal(error.kind),
    };

    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
    expectTypeOf<ValidationMessageResolver>().parameter(0).toEqualTypeOf<ValidationError>();
    expectTypeOf<ValidationMessageResolver>().returns.toEqualTypeOf<DynamicText>();
  });

  it('should reject wrong function signatures', () => {
    const wrongReturn: ValidationMessages = {
      // @ts-expect-error — message functions must return DynamicText, not number
      required: (error: ValidationError) => error.kind.length,
    };

    const wrongParam: ValidationMessages = {
      // @ts-expect-error — message functions receive a ValidationError, not a string
      required: (kind: string) => kind,
    };

    expectTypeOf(wrongReturn).toMatchTypeOf<ValidationMessages>();
    expectTypeOf(wrongParam).toMatchTypeOf<ValidationMessages>();
  });

  it('should support conditional message selection', () => {
    const getMessages = (locale: string): ValidationMessages => {
      if (locale === 'en') {
        return {
          required: 'This field is required',
          email: 'Invalid email address',
        };
      }
      return {
        required: 'Ce champ est requis',
        email: 'Adresse e-mail invalide',
      };
    };

    const messages = getMessages('en');
    expectTypeOf(messages).toMatchTypeOf<ValidationMessages>();
  });
});
