[← Back to Quick Start](/examples)

Checkout form demonstrating the common "same as billing" pattern for shipping addresses.

## Live Demo

<iframe src="http://localhost:4201/#/examples/shipping-billing-address" class="example-frame" title="Shipping Billing Address Demo"></iframe>

## Overview

This example shows how to toggle an entire group of fields based on a checkbox. When "Shipping same as billing" is checked, the shipping address fields are hidden.

**Key patterns demonstrated:**

- Entire group hidden/shown with single condition
- Checkbox controls form complexity
- Reduces user effort when addresses are the same

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-shipping-billing-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class ShippingBillingFormComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'billingTitle',
        type: 'text',
        label: 'Billing Address',
        props: { elementType: 'h4' },
      },
      {
        key: 'billingAddress',
        type: 'group',
        fields: [
          {
            key: 'street',
            type: 'input',
            value: '',
            label: 'Street Address',
            required: true,
          },
          {
            key: 'city',
            type: 'input',
            value: '',
            label: 'City',
            required: true,
          },
          {
            key: 'state',
            type: 'input',
            value: '',
            label: 'State/Province',
            required: true,
          },
          {
            key: 'zipCode',
            type: 'input',
            value: '',
            label: 'ZIP/Postal Code',
            required: true,
          },
        ],
      },
      {
        key: 'sameAsBilling',
        type: 'checkbox',
        value: false,
        label: 'Shipping address is same as billing address',
      },
      {
        key: 'shippingTitle',
        type: 'text',
        label: 'Shipping Address',
        props: { elementType: 'h4' },
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
      },
      {
        key: 'shippingAddress',
        type: 'group',
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
          {
            key: 'street',
            type: 'input',
            value: '',
            label: 'Street Address',
            required: true,
          },
          {
            key: 'city',
            type: 'input',
            value: '',
            label: 'City',
            required: true,
          },
          {
            key: 'state',
            type: 'input',
            value: '',
            label: 'State/Province',
            required: true,
          },
          {
            key: 'zipCode',
            type: 'input',
            value: '',
            label: 'ZIP/Postal Code',
            required: true,
          },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Continue to Payment',
      },
    ],
  } as const satisfies FormConfig;
}
```

## How It Works

### Checkbox Toggle

A simple checkbox controls whether shipping fields are visible:

```typescript
{
  key: 'sameAsBilling',
  type: 'checkbox',
  value: false,
  label: 'Shipping address is same as billing address',
}
```

### Group Visibility

The entire shipping address group is hidden when the checkbox is checked:

```typescript
{
  key: 'shippingAddress',
  type: 'group',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'sameAsBilling',
      operator: 'equals',
      value: true,
    },
  }],
  fields: [
    // All shipping fields...
  ],
}
```

### Section Titles

The section title is also hidden along with the group:

```typescript
{
  key: 'shippingTitle',
  type: 'text',
  label: 'Shipping Address',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'sameAsBilling',
      operator: 'equals',
      value: true,
    },
  }],
}
```

## Use Cases

- E-commerce checkout flows
- Order forms
- Account billing setup
- Subscription management

## Related Documentation

- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Full conditional logic guide
- **[Form Groups](../../prebuilt/form-groups/)** - Working with groups
- **[Checkbox Fields](../../schema-fields/field-types/)** - Field types reference
