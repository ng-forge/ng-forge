---
description: 'Build a multi-step registration form with password strength validation, conditional business fields, and type-safe submission.'
---

Complete example of a user registration form with validation, conditional logic, and proper type safety.

## Live Demo

<docs-live-example scenario="examples/user-registration"></docs-live-example>

## Overview

This example demonstrates:

- Multi-step form with validation
- Password strength validation
- Conditional fields (business account)
- Terms and conditions acceptance
- Type-safe form submission
- Material Design integration

## Complete Implementation

```typescript
import { Component } from '@angular/core';
import { FormConfig, DynamicForm } from '@ng-forge/dynamic-forms';

const registrationConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    // Step 1: Account Information
    {
      type: 'page',
      key: 'accountPage',
      fields: [
        {
          type: 'text',
          key: 'accountText',
          label: 'Create your account',
          props: { elementType: 'h3' },
        },
        {
          key: 'username',
          type: 'input',
          value: '',
          label: 'Username',
          required: true,
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$',
          validationMessages: {
            required: 'Username is required',
            minLength: 'Username must be at least 3 characters',
            maxLength: 'Username cannot exceed 20 characters',
            pattern: 'Username can only contain letters, numbers, and underscores',
          },
          props: {
            hint: '3-20 characters, letters, numbers, and underscores only',
          },
        },
        {
          key: 'email',
          type: 'input',
          value: '',
          label: 'Email Address',
          required: true,
          email: true,
          validationMessages: {
            required: 'Email is required',
            email: 'Please enter a valid email address',
          },
          props: {
            type: 'email',
            hint: "We'll send a verification email",
          },
        },
        {
          key: 'password',
          type: 'input',
          value: '',
          label: 'Password',
          required: true,
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
          validationMessages: {
            required: 'Password is required',
            minLength: 'Password must be at least 8 characters',
            pattern: 'Password must include uppercase, lowercase, number, and special character',
          },
          props: {
            type: 'password',
            hint: 'At least 8 characters with uppercase, lowercase, number, and special character',
          },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          value: '',
          label: 'Confirm Password',
          required: true,
          validators: [
            {
              type: 'custom',
              expression: 'fieldValue === formValue.password',
              kind: 'passwordMismatch',
            },
          ],
          validationMessages: {
            required: 'Please confirm your password',
            passwordMismatch: 'Passwords do not match',
          },
          props: {
            type: 'password',
          },
        },
        {
          type: 'next',
          key: 'nextToProfile',
          label: 'Continue to Profile',
        },
      ],
    },

    // Step 2: Profile Information
    {
      type: 'page',
      key: 'profilePage',
      fields: [
        {
          type: 'row',
          key: 'nameRow',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              value: '',
              label: 'First Name',
              required: true,
              col: 6,
            },
            {
              key: 'lastName',
              type: 'input',
              value: '',
              label: 'Last Name',
              required: true,
              col: 6,
            },
          ],
        },
        {
          key: 'accountType',
          type: 'radio',
          value: 'personal',
          label: 'Account Type',
          required: true,
          options: [
            { value: 'personal', label: 'Personal Account' },
            { value: 'business', label: 'Business Account' },
          ],
        },
        {
          key: 'companyName',
          type: 'input',
          value: '',
          label: 'Company Name',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'business',
              },
            },
            {
              type: 'required',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
          ],
        },
        {
          key: 'industry',
          type: 'select',
          value: '',
          label: 'Industry',
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'finance', label: 'Finance' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'retail', label: 'Retail' },
            { value: 'education', label: 'Education' },
            { value: 'other', label: 'Other' },
          ],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'business',
              },
            },
            {
              type: 'required',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
          ],
          placeholder: 'Select your industry',
        },
        {
          type: 'row',
          key: 'navigationRow',
          fields: [
            {
              type: 'previous',
              key: 'backToAccount',
              label: 'Back',
            },
            {
              type: 'next',
              key: 'nextToPreferences',
              label: 'Continue',
            },
          ],
        },
      ],
    },

    // Step 3: Preferences & Terms
    {
      type: 'page',
      key: 'preferencesPage',
      fields: [
        {
          key: 'interests',
          type: 'multi-checkbox',
          value: [],
          label: 'Interests',
          options: [
            { value: 'tech', label: 'Technology & Innovation' },
            { value: 'business', label: 'Business & Entrepreneurship' },
            { value: 'design', label: 'Design & Creativity' },
            { value: 'marketing', label: 'Marketing & Sales' },
            { value: 'development', label: 'Software Development' },
          ],
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          value: false,
          label: 'Subscribe to newsletter',
        },
        {
          key: 'notifications',
          type: 'toggle',
          value: true,
          label: 'Enable email notifications',
        },
        {
          key: 'terms',
          type: 'checkbox',
          value: false,
          label: 'I accept the terms and conditions',
          required: true,
          validationMessages: {
            required: 'You must accept the terms and conditions',
          },
        },
        {
          key: 'privacy',
          type: 'checkbox',
          value: false,
          label: 'I have read and accept the privacy policy',
          required: true,
          validationMessages: {
            required: 'You must accept the privacy policy',
          },
        },
        {
          type: 'row',
          key: 'finalNavigationRow',
          fields: [
            {
              type: 'previous',
              key: 'backToProfile',
              label: 'Back',
            },
            {
              type: 'submit',
              key: 'submitRegistration',
              label: 'Create Account',
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-user-registration',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class UserRegistrationComponent {
  config = registrationConfig;
}
```

## Key Features

### Multi-Step Form

The form uses page fields to create a wizard-style registration process:

1. **Account Information** - Username, email, password
2. **Profile Information** - Name, account type, plus company name and industry shown conditionally for business accounts
3. **Preferences & Terms** - Interests, notifications, agreements

Navigation buttons (`next`, `previous`, `submit`) control flow between pages.

### Password Validation

Strong password requirements with pattern validation:

```typescript
{
  key: 'password',
  type: 'input',
  value: '',
  required: true,
  minLength: 8,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
  // ...
}
```

Password confirmation with cross-field validation:

```typescript
{
  key: 'confirmPassword',
  validators: [{
    type: 'custom',
    expression: 'fieldValue === formValue.password',
    kind: 'passwordMismatch',
  }],
  validationMessages: {
    passwordMismatch: 'Passwords do not match',
  },
}
```

### Conditional Business Fields

Company name and industry appear only for business accounts:

```typescript
{
  key: 'companyName',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }, {
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

### Type Safety

Full type inference for form values:

```typescript
type RegistrationValue = InferFormValue<typeof registrationConfig.fields>;

// TypeScript knows the exact structure:
// {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   firstName: string;
//   lastName: string;
//   accountType: string;
//   companyName?: string;      // Conditional
//   industry?: string;          // Conditional
//   interests?: string[];
//   newsletter?: boolean;
//   notifications?: boolean;
//   terms: boolean;
//   privacy: boolean;
// }
```

## Variations

### Single Page Registration

For simpler forms, remove page fields:

```typescript
const simpleRegistrationConfig = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true, email: true },
    { key: 'password', type: 'input', value: '', required: true, minLength: 8 },
    { key: 'terms', type: 'checkbox', value: false, required: true },
    { type: 'submit', key: 'submit', label: 'Sign Up' },
  ],
} as const satisfies FormConfig;
```

### Social Login Integration

Add social login buttons before the form:

```typescript
{
  type: 'row',
  key: 'socialRow',
  fields: [
    { type: 'button', key: 'google', label: 'Sign up with Google', col: 6 },
    { type: 'button', key: 'github', label: 'Sign up with GitHub', col: 6 },
  ],
}
```

## Related

- **[Login Form](/examples/login-form)** - Simple authentication form
- **[Paginated Form](/examples/paginated-form)** - Page field navigation patterns
- **[Validation](/validation/basics)** - Validation guide
- **[Conditional Logic](/dynamic-behavior/conditional-logic)** - Dynamic field behavior
- **[Material Integration](/configuration)** - Material Design styling
