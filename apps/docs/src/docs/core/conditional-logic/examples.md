---
title: Examples
route: examples
keyword: ConditionalLogicExamplesPage
---

Real-world examples demonstrating conditional logic patterns for common form scenarios.

## Example Categories

### Basic Examples

Simple conditional patterns for everyday forms.

- **Contact Form with Dynamic Fields** - Show email or phone fields based on contact method selection
- **Business Account Form** - Display business-specific fields for business account types

### Intermediate Examples

More complex conditional scenarios.

- **Shipping Same-as-Billing** - Toggle shipping address fields based on checkbox
- **Age-Based Conditional Form** - Show/hide fields based on age ranges

### Advanced Examples

Complex multi-condition logic.

- **Complex Multi-Condition Form** - Multiple intersecting conditions

## Contact Form with Dynamic Fields

Show different contact fields based on preferred contact method.

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" [(value)]="formValue" />`,
})
export class ContactFormComponent {
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
        key: 'contactMethod',
        type: 'select',
        value: '',
        label: 'Preferred Contact Method',
        required: true,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'mail', label: 'Postal Mail' },
        ],
      },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        email: true,
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'email',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'email',
            },
          },
        ],
      },
      {
        key: 'phone',
        type: 'input',
        value: '',
        label: 'Phone Number',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'phone',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'phone',
            },
          },
        ],
        props: { type: 'tel' },
      },
      {
        key: 'address',
        type: 'textarea',
        value: '',
        label: 'Mailing Address',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'mail',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'mail',
            },
          },
        ],
        props: { rows: 3 },
      },
      {
        key: 'message',
        type: 'textarea',
        value: '',
        label: 'Message',
        required: true,
        minLength: 10,
        props: { rows: 4 },
      },
    ],
  } as const satisfies FormConfig;
}
```

**Key patterns:**

- Field hidden when contact method doesn't match
- Field becomes required when contact method matches
- Clean user experience - only relevant fields shown

## Business Account Form

Show business-specific fields only for business account types.

```typescript
const config = {
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
  ],
} as const satisfies FormConfig;
```

**Key patterns:**

- Personal name field hidden for business accounts
- Business fields (company name, tax ID) hidden for personal accounts
- Required validation tied to visibility

## Shipping Same-as-Billing

Toggle shipping address visibility based on "same as billing" checkbox.

```typescript
const config = {
  fields: [
    {
      key: 'billingAddress',
      type: 'group',
      label: 'Billing Address',
      fields: [
        { key: 'street', type: 'input', value: '', label: 'Street', required: true },
        { key: 'city', type: 'input', value: '', label: 'City', required: true },
        { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code', required: true },
      ],
    },
    {
      key: 'sameAsBilling',
      type: 'checkbox',
      value: false,
      label: 'Shipping address is same as billing address',
    },
    {
      key: 'shippingAddress',
      type: 'group',
      label: 'Shipping Address',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
      ],
      fields: [
        { key: 'street', type: 'input', value: '', label: 'Street', required: true },
        { key: 'city', type: 'input', value: '', label: 'City', required: true },
        { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code', required: true },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Key patterns:**

- Entire group hidden/shown with single condition
- Checkbox controls form complexity
- Reduces user effort when addresses are the same

## Age-Based Conditional Form

Show different fields based on age ranges.

```typescript
const config = {
  fields: [
    {
      key: 'age',
      type: 'input',
      value: null,
      label: 'Age',
      required: true,
      min: 0,
      max: 120,
      props: { type: 'number' },
    },
    {
      key: 'parentalConsent',
      type: 'checkbox',
      value: false,
      label: 'I have parental consent',
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
      ],
    },
    {
      key: 'parentEmail',
      type: 'input',
      value: '',
      label: 'Parent/Guardian Email',
      email: true,
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
  ],
} as const satisfies FormConfig;
```

**Key patterns:**

- Age-appropriate field display
- Numeric comparisons (greater than, less than)
- Multiple conditional sections based on same field

## Complex Multi-Condition Form

Enterprise features shown only for specific account configurations.

```typescript
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'select',
      value: '',
      label: 'Account Type',
      required: true,
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
        { value: 'enterprise', label: 'Enterprise' },
      ],
    },
    {
      key: 'teamSize',
      type: 'input',
      value: null,
      label: 'Team Size',
      min: 1,
      props: { type: 'number' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'free',
          },
        },
      ],
    },
    {
      key: 'ssoEnabled',
      type: 'toggle',
      value: false,
      label: 'Enable SSO (Single Sign-On)',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'enterprise',
              },
              {
                type: 'fieldValue',
                fieldPath: 'teamSize',
                operator: 'less',
                value: 10,
              },
            ],
          },
        },
      ],
    },
    {
      key: 'customBranding',
      type: 'toggle',
      value: false,
      label: 'Enable Custom Branding',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'in',
            value: ['free', 'pro'],
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Key patterns:**

- AND/OR logic for complex conditions
- Multiple fields affecting each other
- Enterprise feature gating

## Common Patterns

### Show/Hide Field Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
];
```

### Conditional Required Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
  {
    type: 'required',
    condition: {
      /* when to require */
    },
  },
];
```

### Multiple Conditions Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      type: 'and', // or 'or'
      conditions: [
        {
          /* condition 1 */
        },
        {
          /* condition 2 */
        },
      ],
    },
  },
];
```

## Related

- **[Conditional Logic Basics](../basics/)** - Getting started
- **[Conditional Expressions](../expressions/)** - All operators
- **[Validation](../../validation/)** - Conditional validation
- **[Type Safety](../../type-safety/)** - TypeScript integration
