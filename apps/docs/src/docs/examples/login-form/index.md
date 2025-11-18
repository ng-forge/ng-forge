Simple login form demonstrating authentication UI with email and password fields.

## Live Demo

{{ NgDocActions.demo("LoginFormDemoComponent", { tabs: [] }) }}

## Overview

A minimal login form showing:

- Email input with validation
- Password input (masked)
- Remember me checkbox
- Submit button
- Clean, focused UI

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, FormConfig, ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-login-form',
  imports: [DynamicForm],
  template: `
    <div class="login-container">
      <h2>Sign In</h2>
      <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event)" />
    </div>
  `,
})
export class LoginFormComponent {
  formValue = signal({});

  config = {
    // Define common validation messages at the form level
    defaultValidationMessages: {
      required: 'This field is required',
      minLength: 'Must be at least {{requiredLength}} characters',
    },
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Sign In',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        required: true,
        email: true,
        // Only specify custom message for 'email' - 'required' uses default
        validationMessages: {
          email: 'Please enter a valid email address',
        },
        props: {
          type: 'email',
          placeholder: 'your@email.com',
          hint: 'Enter the email associated with your account',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        minLength: 8,
        // Override default 'required' message with custom one
        validationMessages: {
          required: 'Password is required',
        },
        // 'minLength' will use default with interpolated {{requiredLength}}
        props: {
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      {
        key: 'remember',
        type: 'checkbox',
        label: 'Remember me for 30 days',
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Sign In',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    console.log('Login attempt:', { email: value.email });
    // In a real app:
    // - Call authentication API
    // - Store tokens
    // - Navigate to dashboard
    // - Handle errors
  }
}
```

## Key Features

### Email Validation

Built-in email format validation:

```typescript
{
  key: 'email',
  email: true,  // Validates email format
  validationMessages: {
    email: 'Please enter a valid email',
  },
}
```

### Password Security

Minimum length requirement and masked input:

```typescript
{
  key: 'password',
  minLength: 8,
  props: {
    type: 'password',  // Masks input
    autocomplete: 'current-password',
  },
}
```

### Remember Me Option

Simple checkbox for persistent login:

```typescript
{
  key: 'remember',
  type: 'checkbox',
  label: 'Remember me',
}
```

## Common Enhancements

### Add "Forgot Password" Link

```typescript
{
  type: 'text',
  key: 'forgotLink',
  label: '<a href="/forgot-password">Forgot your password?</a>',
}
```

### Social Login Buttons

```typescript
{
  type: 'row',
  key: 'socialRow',
  fields: [
    { type: 'button', key: 'google', label: 'Google', col: 6 },
    { type: 'button', key: 'github', label: 'GitHub', col: 6 },
  ],
}
```

### Add Sign Up Link

```typescript
{
  type: 'text',
  key: 'signupText',
  label: "Don't have an account? <a href='/signup'>Sign up</a>",
}
```

## Use Cases

- User authentication
- Admin panels
- Member portals
- Dashboard access
- Protected areas

## Related Examples

- **[User Registration](../user-registration/)** - Account creation
- **[Contact Form](../contact-form/)** - Basic form with validation
- **[Password Reset](../password-reset/)** - Forgot password flow

## Related Documentation

- **[Validation](../../core/validation/)** - Form validation guide
- **[Field Types](../../core/field-types/)** - Input, checkbox, button
- **[Material Integration](../../ui-libs-integrations/material/)** - Material Design styling
