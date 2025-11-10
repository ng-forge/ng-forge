# User Registration Form

Complete example of a user registration form with validation, conditional logic, and proper type safety.

## Live Demo

{{ NgDocActions.demo("UserRegistrationDemoComponent") }}

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
import { Component, signal } from '@angular/core';
import { FormConfig, DynamicFormComponent, InferFormValue } from '@ng-forge/dynamic-form';

const registrationConfig = {
  fields: [
    // Step 1: Account Information
    {
      type: 'page',
      key: 'accountPage',
      title: 'Account Information',
      fields: [
        {
          type: 'text',
          key: 'accountText',
          label: 'Create your account',
          props: { class: 'text-lg font-semibold' },
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
              errorMessage: 'Passwords do not match',
            },
          ],
          validationMessages: {
            required: 'Please confirm your password',
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
      title: 'Profile Information',
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
              errorMessage: 'Company name is required for business accounts',
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
              errorMessage: 'Industry is required for business accounts',
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
              col: 6,
            },
            {
              type: 'next',
              key: 'nextToPreferences',
              label: 'Continue',
              col: 6,
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
      title: 'Preferences & Terms',
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
              col: 6,
            },
            {
              type: 'submit',
              key: 'submitRegistration',
              label: 'Create Account',
              col: 6,
              props: { color: 'primary' },
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

type RegistrationValue = InferFormValue<typeof registrationConfig.fields>;

@Component({
  selector: 'app-user-registration',
  imports: [DynamicFormComponent],
  template: `
    <div class="registration-container">
      <h1>Create Your Account</h1>

      <df-dynamic-form [config]="config" [(value)]="formValue" (formSubmit)="onSubmit($event)" />

      @let message = submitMessage(); @if (message) {
      <div class="success-message">
        {{ message }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .registration-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
      }

      h1 {
        margin-bottom: 2rem;
        text-align: center;
      }

      .success-message {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #4caf50;
        color: white;
        border-radius: 4px;
        text-align: center;
      }
    `,
  ],
})
export class UserRegistrationComponent {
  config = registrationConfig;

  formValue = signal<RegistrationValue>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    accountType: 'personal',
    interests: [],
    newsletter: false,
    notifications: true,
    terms: false,
    privacy: false,
  });

  submitMessage = signal<string>('');

  onSubmit(value: RegistrationValue) {
    console.log('Registration submitted:', value);

    // In a real application, you would:
    // 1. Send data to API
    // 2. Handle errors
    // 3. Navigate to success page

    this.submitMessage.set(`Welcome, ${value.firstName}! Your account has been created successfully.`);
  }
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
    errorMessage: 'Passwords do not match',
  }],
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
- **[Multi-Step Wizard](../wizard/)** - Page field navigation patterns
- **[Validation](../../core/validation/basics/)** - Validation guide
- **[Conditional Logic](../../core/conditional-logic/basics/)** - Dynamic field behavior
- **[Material Fields](../../ui-libs-integrations/reference/material/overview-setup/)** - Material Design field types
