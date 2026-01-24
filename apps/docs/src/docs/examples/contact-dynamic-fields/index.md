[← Back to Quick Start](/examples)

Contact form demonstrating dynamic field visibility based on preferred contact method selection.

## Live Demo

<iframe src="http://localhost:4201/#/examples/contact-dynamic-fields" class="example-frame" title="Contact Dynamic Fields Demo"></iframe>

## Overview

This example shows how to dynamically show or hide form fields based on user selection. When the user chooses their preferred contact method, only the relevant input field is displayed.

**Key patterns demonstrated:**

- Field hidden when contact method doesn't match
- Field becomes required when contact method matches
- Clean user experience - only relevant fields shown

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
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

## How It Works

### Conditional Visibility

Each contact field uses the `logic` array to control visibility:

```typescript
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
];
```

When `contactMethod !== 'email'`, the email field is hidden.

### Conditional Required

The same `logic` array also makes fields required when visible:

```typescript
logic: [
  {
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'contactMethod',
      operator: 'equals',
      value: 'email',
    },
  },
];
```

This ensures that visible contact fields are required.

## Use Cases

- Contact forms with multiple contact options
- Preference forms
- Survey forms with branching logic
- Customer support request forms

## Related Documentation

- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Full conditional logic guide
- **[Validation](../../validation/basics/)** - Form validation
- **[Contact Form](../contact-form/)** - Basic contact form example
