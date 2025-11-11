---
title: Custom Validators
keyword: CustomValidatorsExample
---

A practical example demonstrating custom synchronous validators and cross-field validation using Angular Signal Forms' FieldContext API.

## Live Demo

{{ NgDocActions.demo("CustomValidatorsDemoComponent", { container: false }) }}

## Overview

This example showcases ng-forge's custom validation capabilities:

- **Sync Validators**: Immediate validation using FieldContext API
- **Cross-Field Validation**: Validators that access other field values using `ctx.valueOf()`
- **Built-in Validators**: Standard email format validation
- **Real-World Use Case**: Registration form with username format and password confirmation

## What This Example Demonstrates

### Validator Types

1. **CustomValidator** - Synchronous validation with immediate feedback
2. **Cross-Field Validation** - Using `ctx.valueOf()` to access other field values
3. **Built-in Validators** - Standard validators like `required`, `email`, `minLength`

### Key Features

- **FieldContext API**: Clean, signal-based access to field values and state
- **Public API**: Using `ctx.value()` and `ctx.valueOf()` for validation logic
- **Type Safety**: Fully typed validators
- **Validation Messages**: Configured at field level for flexibility

## Complete Implementation

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, FormConfig, CustomValidator } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'example-custom-validators-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div style="margin-bottom: 2rem;">
      <h2>Custom Validation Demo</h2>
      <p>This example demonstrates custom validators with Angular Signal Forms:</p>
      <ul>
        <li><strong>Sync Validator:</strong> Username format validation (no spaces, min 3 chars)</li>
        <li><strong>Cross-Field Validator:</strong> Password confirmation must match using ctx.valueOf()</li>
        <li><strong>Built-in Validator:</strong> Email format validation</li>
      </ul>
    </div>

    <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event)" />

    @if (submitMessage()) {
    <div style="margin-top: 2rem; padding: 1.5rem; background-color: #4caf50; color: white; border-radius: 4px;">
      {{ submitMessage() }}
    </div>
    }

    <div style="margin-top: 2rem;">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomValidatorsDemoComponent {
  formValue = signal({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  submitMessage = signal<string>('');

  config: FormConfig = {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      usernameFormat: 'Username must be at least 3 characters and contain no spaces',
      passwordMismatch: 'Passwords do not match',
    },
    signalFormsConfig: {
      validators: {
        usernameFormat: this.createUsernameFormatValidator(),
        passwordMatch: this.createPasswordMatchValidator(),
      },
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        props: {
          appearance: 'outline',
          hint: 'Must be at least 3 characters with no spaces',
        },
        validators: [{ type: 'custom', functionName: 'usernameFormat' }],
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
          appearance: 'outline',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        props: {
          type: 'password',
          appearance: 'outline',
        },
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: true,
        props: {
          type: 'password',
          appearance: 'outline',
        },
        validators: [{ type: 'custom', functionName: 'passwordMatch' }],
      },
      {
        type: 'button',
        key: 'submit',
        label: 'Register',
        props: {
          color: 'primary',
          type: 'submit',
        },
      },
    ],
  };

  /**
   * SYNC VALIDATOR: Username format validation
   * Uses FieldContext API to access current value
   */
  private createUsernameFormatValidator(): CustomValidator {
    return (ctx) => {
      const username = ctx.value() as string;

      if (!username) {
        return null; // Let required validator handle empty case
      }

      // Check for spaces
      if (username.includes(' ')) {
        return { kind: 'usernameFormat' };
      }

      // Check minimum length
      if (username.length < 3) {
        return { kind: 'usernameFormat' };
      }

      return null;
    };
  }

  /**
   * CROSS-FIELD VALIDATOR: Password confirmation
   * Uses ctx.valueOf() to access other field values (PUBLIC API)
   */
  private createPasswordMatchValidator(): CustomValidator {
    return (ctx) => {
      const confirmPassword = ctx.value() as string;
      const password = ctx.valueOf('password' as any) as string;

      if (!confirmPassword || !password) {
        return null; // Let required validator handle empty case
      }

      if (password !== confirmPassword) {
        return { kind: 'passwordMismatch' };
      }

      return null;
    };
  }

  onSubmit(value: unknown) {
    console.log('Form submitted:', value);
    this.submitMessage.set('✓ Registration successful! All validators passed.');

    // Clear message after 5 seconds
    setTimeout(() => {
      this.submitMessage.set('');
    }, 5000);
  }
}
```

## Key Validation Patterns

### 1. Sync Validator with FieldContext

```typescript
private createUsernameFormatValidator(): CustomValidator {
  return (ctx) => {
    const username = ctx.value() as string;

    if (username.includes(' ') || username.length < 3) {
      return { kind: 'usernameFormat' };
    }

    return null;
  };
}
```

**What's happening:**

- `ctx.value()` gets the current field value using signals
- Immediate validation with synchronous return
- Returns `null` for valid, error object for invalid
- Error `kind` maps to validation message configured in field

### 2. Cross-Field Validator

```typescript
private createPasswordMatchValidator(): CustomValidator {
  return (ctx) => {
    const confirmPassword = ctx.value() as string;
    const password = ctx.valueOf('password' as any) as string;

    if (password !== confirmPassword) {
      return { kind: 'passwordMismatch' };
    }

    return null;
  };
}
```

**What's happening:**

- `ctx.valueOf(path)` accesses other field values - **this is the PUBLIC API**
- Enables password confirmation and other cross-field validation
- Reactive - automatically re-validates when either field changes
- Type-safe access to form values

## Important Concepts

### FieldContext API

The unified FieldContext API provides:

```typescript
interface FieldContext<TValue> {
  value(): TValue; // Get current field value (signal)
  valueOf(path: string): any; // Get other field's value (PUBLIC API)
  state: FieldState; // Field state (touched, dirty, etc.)
  stateOf(path: string): FieldState; // Other field's state
}
```

### Validator Registration

Validators are registered in the `signalFormsConfig`:

```typescript
config: FormConfig = {
  signalFormsConfig: {
    validators: {
      usernameFormat: this.createUsernameFormatValidator(),
      passwordMatch: this.createPasswordMatchValidator(),
    },
  },
  fields: [
    {
      key: 'username',
      validators: [{ type: 'custom', functionName: 'usernameFormat' }],
    },
  ],
};
```

### Validation Messages

Messages are configured at the field level:

```typescript
{
  key: 'username',
  validators: [{ type: 'custom', functionName: 'usernameFormat' }],
  validationMessages: {
    usernameFormat: 'Username must be at least 3 characters and contain no spaces',
  },
}
```

Or globally for reuse:

```typescript
{
  defaultValidationMessages: {
    usernameFormat: 'Username must be at least 3 characters and contain no spaces',
    passwordMismatch: 'Passwords do not match',
  },
}
```

### Error Objects

Validators return error objects with a `kind` property:

```typescript
// Invalid
return { kind: 'usernameFormat' };

// Valid
return null;

// Multiple errors (advanced)
return [{ kind: 'error1' }, { kind: 'error2' }];
```

## What You Can Learn

This example demonstrates:

1. **Sync Validators**: Immediate validation with FieldContext API
2. **Cross-Field Validation**: Using `valueOf()` to access related fields
3. **Type Safety**: Fully typed validators and form values
4. **Validation Messages**: Flexible message configuration
5. **Real-World Use Case**: Registration form validation
6. **Best Practices**: Separating validation logic from presentation

## Registration Pattern

**Step 1: Create the validator function**

```typescript
private createUsernameFormatValidator(): CustomValidator {
  return (ctx) => {
    const username = ctx.value() as string;
    if (username.includes(' ') || username.length < 3) {
      return { kind: 'usernameFormat' };
    }
    return null;
  };
}
```

**Step 2: Register in signalFormsConfig**

```typescript
signalFormsConfig: {
  validators: {
    usernameFormat: this.createUsernameFormatValidator(),
  },
}
```

**Step 3: Use in field configuration**

```typescript
{
  key: 'username',
  validators: [{ type: 'custom', functionName: 'usernameFormat' }],
  validationMessages: {
    usernameFormat: 'Username must be at least 3 characters and contain no spaces',
  },
}
```

## Common Use Cases

### Email Domain Validation

```typescript
private createEmailDomainValidator(): CustomValidator {
  const blockedDomains = ['tempmail.com', 'throwaway.email'];

  return (ctx) => {
    const email = ctx.value() as string;
    const domain = email.split('@')[1];

    if (blockedDomains.includes(domain)) {
      return { kind: 'blockedDomain' };
    }

    return null;
  };
}
```

### Age Validation

```typescript
private createAgeValidator(): CustomValidator {
  return (ctx) => {
    const birthDate = ctx.value() as Date;
    const age = calculateAge(birthDate);

    if (age < 18) {
      return { kind: 'tooYoung' };
    }

    return null;
  };
}
```

### Conditional Required

```typescript
private createConditionalRequiredValidator(): CustomValidator {
  return (ctx) => {
    const value = ctx.value();
    const employmentStatus = ctx.valueOf('employmentStatus' as any);

    // Company name required if employed
    if (employmentStatus === 'employed' && !value) {
      return { kind: 'required' };
    }

    return null;
  };
}
```

## Related Documentation

- [Validation Basics](../../core/validation/basics) - Core validation concepts
- [Custom Validators](../../core/validation/custom) - Creating custom validators
- [Type Safety](../../core/type-safety/basics) - TypeScript integration
- [FieldContext API](../../core/validation/field-context) - Full API reference

## Try It Yourself

Experiment with the live demo above:

1. **Enter a username with spaces** to see sync validation fail
2. **Enter a short username** (< 3 chars) to see validation error
3. **Enter mismatched passwords** to see cross-field validation
4. **Fix all errors** and submit to see success message
5. **View the form data** JSON output below the form

This example shows how ng-forge makes custom validation simple and declarative!
