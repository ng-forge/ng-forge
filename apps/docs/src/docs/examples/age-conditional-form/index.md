[← Back to Quick Start](/examples)

Registration form demonstrating numeric comparison operators for age-based conditional logic.

## Live Demo

<iframe src="http://localhost:4201/#/examples/age-conditional-form" class="example-frame" title="Age Conditional Form Demo"></iframe>

## Overview

This example shows how to use numeric comparison operators to display different fields based on age ranges. Minors see parental consent fields, while seniors see discount options.

**Key patterns demonstrated:**

- Age-appropriate field display
- Numeric comparisons (greater than, less than)
- Multiple conditional sections based on same field

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-age-conditional-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class AgeConditionalFormComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        value: '',
        label: 'Full Name',
        required: true,
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
        key: 'age',
        type: 'input',
        value: null,
        label: 'Age',
        required: true,
        min: 0,
        max: 120,
        props: {
          type: 'number',
          hint: 'Enter your age to see relevant options',
        },
      },
      {
        key: 'parentalConsent',
        type: 'checkbox',
        value: false,
        label: 'I have parental/guardian consent to register',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'greaterOrEqual',
              value: 18,
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'less',
              value: 18,
            },
          },
        ],
      },
      {
        key: 'parentEmail',
        type: 'input',
        value: '',
        label: 'Parent/Guardian Email',
        email: true,
        props: {
          hint: 'We will send a verification email to your parent/guardian',
        },
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'greaterOrEqual',
              value: 18,
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'less',
              value: 18,
            },
          },
        ],
      },
      {
        key: 'seniorDiscount',
        type: 'checkbox',
        value: false,
        label: 'Apply senior discount (65+)',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'less',
              value: 65,
            },
          },
        ],
      },
      {
        key: 'aarpMember',
        type: 'checkbox',
        value: false,
        label: 'I am an AARP member (additional 5% discount)',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'less',
              value: 65,
            },
          },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Register',
      },
    ],
  } as const satisfies FormConfig;
}
```

## How It Works

### Age-Based Visibility

Fields for minors are hidden when age >= 18:

```typescript
{
  key: 'parentalConsent',
  type: 'checkbox',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'age',
      operator: 'greaterOrEqual',
      value: 18,
    },
  }],
}
```

Fields for seniors are hidden when age < 65:

```typescript
{
  key: 'seniorDiscount',
  type: 'checkbox',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'age',
      operator: 'less',
      value: 65,
    },
  }],
}
```

### Conditional Required for Minors

Parent email is required only for minors:

```typescript
{
  key: 'parentEmail',
  type: 'input',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'greaterOrEqual',
        value: 18,
      },
    },
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'less',
        value: 18,
      },
    },
  ],
}
```

## Comparison Operators

This example uses numeric comparison operators:

| Operator         | Description                |
| ---------------- | -------------------------- |
| `greater`        | Greater than (>)           |
| `less`           | Less than (<)              |
| `greaterOrEqual` | Greater than or equal (>=) |
| `lessOrEqual`    | Less than or equal (<=)    |

## Use Cases

- Age-gated registration
- Tiered pricing forms
- Compliance forms with age requirements
- Membership applications

## Related Documentation

- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Full conditional logic guide
- **[Validation](../../validation/basics/)** - Min/max validation
- **[User Registration](../user-registration/)** - Basic registration example
