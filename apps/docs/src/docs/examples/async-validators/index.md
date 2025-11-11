---
title: Async & HTTP Validators
keyword: AsyncValidatorsExample
---

A comprehensive example demonstrating asynchronous and HTTP-based validation using Angular's resource API and the new unified validation system.

## Live Demo

{{ NgDocActions.demo("AsyncValidatorsDemoComponent", { container: false }) }}

## Overview

This example showcases ng-forge's advanced validation capabilities:

- **Sync Validators**: Immediate validation using FieldContext API
- **Async Validators**: Resource-based validation with loading states
- **HTTP Validators**: Optimized HTTP validation with automatic cancellation
- **Cross-Field Validation**: Validators that access other field values
- **Real-World Scenarios**: Username availability, email domain checking, password matching

## What This Example Demonstrates

### Validator Types

1. **CustomValidator** - Synchronous validation with immediate feedback
2. **AsyncCustomValidator** - Resource-based async validation with params/factory pattern
3. **HttpCustomValidator** - HTTP-specific validation with request/response handling
4. **Cross-Field Validation** - Using `ctx.valueOf()` to access other field values

### Key Features

- **FieldContext API**: Clean, signal-based access to field values and state
- **Simulated Delays**: Demonstrates async behavior with 1-second delays
- **Visual Feedback**: Loading states and validation messages
- **Inverted Logic**: HTTP validators use onSuccess for validation (not data fetching)

## Complete Implementation

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { resource } from '@angular/core';
import { DynamicForm, FormConfig, CustomValidator, AsyncCustomValidator, HttpCustomValidator } from '@ng-forge/dynamic-form';

@Component({
  selector: 'example-async-validators-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2>Async & HTTP Validation Demo</h2>
        <p>This example demonstrates custom validators with Angular Signal Forms:</p>
        <ul>
          <li><strong>Sync Validator:</strong> Username format validation</li>
          <li><strong>Async Validator:</strong> Username availability check (1s delay)</li>
          <li><strong>HTTP Validator:</strong> Email domain validation</li>
          <li><strong>Cross-Field:</strong> Password confirmation</li>
        </ul>
        <p><em>Try usernames: "john", "jane", "admin" (these are taken)</em></p>
      </div>

      <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event)" />

      @if (submitResult()) {
      <div style="margin-top: 2rem; padding: 1rem; background: #e8f5e9; border-radius: 4px;">
        <h3>Form Submitted Successfully!</h3>
        <pre>{{ submitResult() | json }}</pre>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidatorsDemoComponent {
  formValue = signal({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  submitResult = signal<any>(null);

  // Simulated data
  private takenUsernames = ['john', 'jane', 'admin', 'root', 'test'];
  private invalidDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];

  config: FormConfig = {
    signalFormsConfig: {
      validators: {
        usernameFormat: this.createUsernameFormatValidator(),
        passwordMatch: this.createPasswordMatchValidator(),
      },
      asyncValidators: {
        checkUsernameAvailability: this.createUsernameAvailabilityValidator(),
      },
      httpValidators: {
        checkEmailDomain: this.createEmailDomainValidator(),
      },
    },
    fields: [
      {
        type: 'input',
        key: 'username',
        label: 'Username',
        value: '',
        required: true,
        validators: [
          {
            type: 'custom',
            name: 'usernameFormat',
          },
        ],
        asyncValidators: [
          {
            type: 'customAsync',
            name: 'checkUsernameAvailability',
          },
        ],
        validationMessages: {
          required: 'Username is required',
          usernameFormat: 'Username must be at least 3 characters and contain no spaces',
          usernameTaken: 'This username is already taken',
        },
        props: {
          appearance: 'outline',
          hint: 'At least 3 characters, no spaces. Try: john, jane, admin (taken)',
        },
      },
      {
        type: 'input',
        key: 'email',
        label: 'Email',
        value: '',
        required: true,
        email: true,
        httpValidators: [
          {
            type: 'customHttp',
            name: 'checkEmailDomain',
          },
        ],
        validationMessages: {
          required: 'Email is required',
          email: 'Must be a valid email address',
          invalidEmailDomain: 'This email domain is not allowed',
        },
        props: {
          type: 'email',
          appearance: 'outline',
          hint: 'Invalid domains: tempmail.com, throwaway.email',
        },
      },
      {
        type: 'input',
        key: 'password',
        label: 'Password',
        value: '',
        required: true,
        minLength: 8,
        validationMessages: {
          required: 'Password is required',
          minLength: 'Password must be at least 8 characters',
        },
        props: {
          type: 'password',
          appearance: 'outline',
        },
      },
      {
        type: 'input',
        key: 'confirmPassword',
        label: 'Confirm Password',
        value: '',
        required: true,
        validators: [
          {
            type: 'custom',
            name: 'passwordMatch',
          },
        ],
        validationMessages: {
          required: 'Please confirm your password',
          passwordMismatch: 'Passwords do not match',
        },
        props: {
          type: 'password',
          appearance: 'outline',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Register',
        props: {
          color: 'primary',
        },
      },
    ],
  };

  // SYNC VALIDATOR: Username format validation
  private createUsernameFormatValidator(): CustomValidator<string> {
    return (ctx) => {
      const username = ctx.value();

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

  // CROSS-FIELD VALIDATOR: Password confirmation
  private createPasswordMatchValidator(): CustomValidator<string> {
    return (ctx) => {
      const confirmPassword = ctx.value();
      const password = ctx.valueOf('password' as any); // Access other field using PUBLIC API

      if (password !== confirmPassword) {
        return { kind: 'passwordMismatch' };
      }

      return null;
    };
  }

  // ASYNC VALIDATOR: Username availability check
  private createUsernameAvailabilityValidator(): AsyncCustomValidator<string> {
    return {
      // Extract params from field context
      params: (ctx) => ({ username: ctx.value() }),

      // Create a resource with the params
      factory: (params) =>
        resource({
          request: () => params(),
          loader: ({ request }) => {
            // Simulate API call with 1 second delay
            return new Promise<{ available: boolean }>((resolve) => {
              setTimeout(() => {
                const available = !this.takenUsernames.includes(request.username.toLowerCase());
                resolve({ available });
              }, 1000);
            });
          },
        }),

      // Map successful response to validation error (or null if valid)
      onSuccess: (result) => {
        return result.available ? null : { kind: 'usernameTaken' };
      },
    };
  }

  // HTTP VALIDATOR: Email domain validation
  private createEmailDomainValidator(): HttpCustomValidator<string, { valid: boolean }> {
    return {
      // Build HTTP request from field context
      request: (ctx) => {
        const email = ctx.value();
        const domain = email.split('@')[1];

        return {
          url: '/api/validate-domain',
          method: 'POST',
          body: { domain },
        };
      },

      // NOTE: This is inverted logic - onSuccess checks if response indicates INVALID
      // We're not fetching data, we're validating!
      onSuccess: (response, ctx) => {
        const email = ctx.value();
        const domain = email.split('@')[1];

        // Simulate domain validation (normally response would tell us)
        const valid = domain && !this.invalidDomains.includes(domain);

        // Return error if invalid, null if valid
        return valid ? null : { kind: 'invalidEmailDomain' };
      },
    };
  }

  onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    this.submitResult.set(formValue);
  }
}
```

## Key Validation Patterns

### 1. Sync Validator with FieldContext

```typescript
private createUsernameFormatValidator(): CustomValidator<string> {
  return (ctx) => {
    const username = ctx.value();

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

### 2. Cross-Field Validator

```typescript
private createPasswordMatchValidator(): CustomValidator<string> {
  return (ctx) => {
    const confirmPassword = ctx.value();
    const password = ctx.valueOf('password' as any); // PUBLIC API!

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

### 3. Async Validator with Resource API

```typescript
private createUsernameAvailabilityValidator(): AsyncCustomValidator<string> {
  return {
    params: (ctx) => ({ username: ctx.value() }),

    factory: (params) => resource({
      request: () => params(),
      loader: ({ request }) => {
        return checkUsernameAPI(request.username);
      },
    }),

    onSuccess: (result) => {
      return result.available ? null : { kind: 'usernameTaken' };
    },
  };
}
```

**What's happening:**

- `params` extracts what you need from FieldContext
- `factory` creates an Angular resource (automatic loading states!)
- `onSuccess` maps the response to validation result
- Resource automatically handles re-fetching when params change

### 4. HTTP Validator

```typescript
private createEmailDomainValidator(): HttpCustomValidator<string, { valid: boolean }> {
  return {
    request: (ctx) => ({
      url: '/api/validate-domain',
      method: 'POST',
      body: { domain: ctx.value().split('@')[1] },
    }),

    onSuccess: (response, ctx) => {
      return response.valid ? null : { kind: 'invalidEmailDomain' };
    },
  };
}
```

**What's happening:**

- `request` builds the HTTP request from FieldContext
- Framework automatically cancels in-flight requests when field changes
- `onSuccess` maps response to validation error (inverted logic!)
- Optimized for HTTP with automatic debouncing and cancellation

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

### Inverted Logic in HTTP Validators

HTTP validators use **inverted logic**:

```typescript
// ❌ DON'T think of it as data fetching
onSuccess: (response) => response.data;

// ✅ DO think of it as validation checking
onSuccess: (response) => (response.valid ? null : { kind: 'error' });
```

**Why?** Validators return errors, not data. A successful HTTP call should check the response and return an error object if invalid, or `null` if valid.

### Automatic Loading States

Async validators automatically provide loading states through the resource API:

```typescript
// The framework tracks loading automatically
const usernameField = form.get('username');
console.log(usernameField.status); // 'PENDING' during async validation
```

### Request Cancellation

HTTP validators automatically cancel in-flight requests:

```typescript
// User types "j" -> request starts
// User types "jo" -> previous request canceled, new request starts
// User types "john" -> previous request canceled, new request starts
// Only the final "john" request completes
```

This prevents race conditions and improves performance.

## What You Can Learn

This example demonstrates:

1. **All Three Validator Types**: Sync, async, and HTTP validators
2. **FieldContext API**: Clean signal-based field access
3. **Cross-Field Validation**: Using `valueOf()` to access related fields
4. **Resource Pattern**: Async validation with Angular's resource API
5. **HTTP Optimization**: Automatic cancellation and debouncing
6. **Real-World Scenarios**: Username checking, domain validation, password matching
7. **Visual Feedback**: Loading states and error messages
8. **Type Safety**: Fully typed validators with generics

## Registration Pattern

Validators are registered in the `signalFormsConfig`:

```typescript
config: FormConfig = {
  signalFormsConfig: {
    validators: {
      usernameFormat: this.createUsernameFormatValidator(),
      passwordMatch: this.createPasswordMatchValidator(),
    },
    asyncValidators: {
      checkUsernameAvailability: this.createUsernameAvailabilityValidator(),
    },
    httpValidators: {
      checkEmailDomain: this.createEmailDomainValidator(),
    },
  },
  fields: [
    {
      type: 'input',
      key: 'username',
      validators: [{ type: 'custom', name: 'usernameFormat' }],
      asyncValidators: [{ type: 'customAsync', name: 'checkUsernameAvailability' }],
    },
  ],
};
```

## Related Documentation

- [Validation Basics](../../core/validation/basics) - Core validation concepts
- [Custom Validators](../../core/validation/custom) - Creating custom validators
- [Async Validation](../../core/validation/async) - Async validation guide
- [Type Safety](../../core/type-safety/basics) - TypeScript integration

## Try It Yourself

Experiment with the live demo above:

1. **Enter a short username** (< 3 chars) to see sync validation
2. **Try "john", "jane", or "admin"** to see async validation failure
3. **Enter unique username** to see async validation success with 1s delay
4. **Use invalid email domain** like tempmail.com to see HTTP validation
5. **Enter mismatched passwords** to see cross-field validation
6. **Watch loading states** during async validation

This example shows how ng-forge makes complex validation patterns simple and declarative!
