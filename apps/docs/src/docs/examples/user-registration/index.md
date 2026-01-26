[← Back to Quick Start](/examples)

Complete example of a user registration form with validation, conditional logic, and proper type safety.

## Live Demo

<iframe src="http://localhost:4201/#/examples/user-registration" class="example-frame" title="User Registration Demo"></iframe>

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
            appearance: 'outline',
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
            appearance: 'outline',
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
            appearance: 'outline',
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
            appearance: 'outline',
          },
        },
        {
          type: 'next',
          key: 'nextToProfile',
          label: 'Continue to Profile',
          props: { color: 'primary' },
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
              props: { appearance: 'outline' },
            },
            {
              key: 'lastName',
              type: 'input',
              value: '',
              label: 'Last Name',
              required: true,
              col: 6,
              props: { appearance: 'outline' },
            },
          ],
        },
        {
          key: 'dateOfBirth',
          type: 'datepicker',
          value: null,
          label: 'Date of Birth',
          required: true,
          maxDate: new Date(new Date().getFullYear() - 13, 0, 1),
          validationMessages: {
            required: 'Date of birth is required',
            maxDate: 'You must be at least 13 years old',
          },
          props: {
            appearance: 'outline',
            hint: 'You must be at least 13 years old',
          },
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
          props: { color: 'primary' },
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
          props: { appearance: 'outline' },
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
          props: {
            appearance: 'outline',
            placeholder: 'Select your industry',
          },
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
              props: { color: 'primary' },
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
          props: { color: 'primary' },
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          value: false,
          label: 'Subscribe to newsletter',
          props: { color: 'primary' },
        },
        {
          key: 'notifications',
          type: 'toggle',
          value: true,
          label: 'Enable email notifications',
          props: { color: 'primary' },
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
          props: { color: 'primary' },
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
          props: { color: 'primary' },
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
              props: { color: 'primary' },
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
2. **Profile Information** - Name, DOB, account type
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

### Age Verification

Uses datepicker `maxDate` to ensure users are at least 13 years old:

```typescript
{
  key: 'dateOfBirth',
  type: 'datepicker',
  maxDate: new Date(new Date().getFullYear() - 13, 0, 1),
  validationMessages: {
    maxDate: 'You must be at least 13 years old',
  },
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
//   dateOfBirth: Date | null;
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

- **[Login Form](../login-form/)** - Simple authentication form
- **[Paginated Form](../paginated-form/)** - Page field navigation patterns
- **[Validation](../../validation/basics/)** - Validation guide
- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Dynamic field behavior
- **[Material Integration](../../ui-libs-integrations/material/)** - Material Design styling
