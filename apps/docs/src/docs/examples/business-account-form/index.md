[← Back to Quick Start](/examples)

Account registration form that shows different fields based on whether the user selects personal or business account type.

## Live Demo

<iframe src="http://localhost:4201/#/examples/business-account-form" class="example-frame" title="Business Account Form Demo"></iframe>

## Overview

This example demonstrates how to conditionally show business-specific fields only when the user selects a business account type.

**Key patterns demonstrated:**

- Personal name field hidden for business accounts
- Business fields (company name, tax ID) hidden for personal accounts
- Required validation tied to visibility

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-business-account-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class BusinessAccountFormComponent {
  formValue = signal({});

  config = {
    fields: [
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
        key: 'name',
        type: 'input',
        value: '',
        label: 'Full Name',
        required: true,
        logic: [
          {
            type: 'hidden',
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
        key: 'taxId',
        type: 'input',
        value: '',
        label: 'Tax ID',
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
        key: 'numberOfEmployees',
        type: 'input',
        value: null,
        label: 'Number of Employees',
        props: { type: 'number' },
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
        ],
      },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        required: true,
        email: true,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
      },
    ],
  } as const satisfies FormConfig;
}
```

## How It Works

### Account Type Toggle

The form uses radio buttons to switch between personal and business accounts:

```typescript
{
  key: 'accountType',
  type: 'radio',
  value: 'personal',
  options: [
    { value: 'personal', label: 'Personal Account' },
    { value: 'business', label: 'Business Account' },
  ],
}
```

### Personal vs Business Fields

Personal fields are hidden when business is selected:

```typescript
{
  key: 'name',
  type: 'input',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

Business fields are hidden when personal is selected:

```typescript
{
  key: 'companyName',
  type: 'input',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }],
}
```

## Use Cases

- User registration with account types
- Subscription forms with tiers
- Customer onboarding flows
- Multi-tenant application signup

## Related Documentation

- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Full conditional logic guide
- **[User Registration](../user-registration/)** - Basic registration example
- **[Radio Buttons](../../schema-fields/field-types/)** - Field types reference
