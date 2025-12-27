/**
 * Exhaustive type tests for ValidationMessages type.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText } from './types/dynamic-text';
import type { ValidationMessages } from './validation-types';

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

    expectTypeOf(messages['customValidator']).toMatchTypeOf<DynamicText | undefined>();
    expectTypeOf(messages['anotherValidator']).toMatchTypeOf<DynamicText | undefined>();
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
  it('required should be DynamicText', () => {
    expectTypeOf<ValidationMessages['required']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('email should be DynamicText', () => {
    expectTypeOf<ValidationMessages['email']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('min should be DynamicText', () => {
    expectTypeOf<ValidationMessages['min']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('max should be DynamicText', () => {
    expectTypeOf<ValidationMessages['max']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('minLength should be DynamicText', () => {
    expectTypeOf<ValidationMessages['minLength']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('maxLength should be DynamicText', () => {
    expectTypeOf<ValidationMessages['maxLength']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('pattern should be DynamicText', () => {
    expectTypeOf<ValidationMessages['pattern']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('index signature should be DynamicText', () => {
    type IndexSignature = ValidationMessages[string];
    expectTypeOf<IndexSignature>().toEqualTypeOf<DynamicText | undefined>();
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
