---
description: "Implement the 'same as billing' checkout pattern by hiding the shipping address fields with a checkbox-driven condition."
---

Checkout form demonstrating the common "same as billing" pattern for shipping addresses.

## Live Demo

<docs-live-example scenario="examples/shipping-billing-address"></docs-live-example>

## Overview

This example shows how to toggle a set of fields based on a checkbox. When "Shipping same as billing" is checked, every shipping address field is hidden.

**Key patterns demonstrated:**

- Each shipping field hidden and required based on the same checkbox condition
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
    defaultValidationMessages: {
      required: 'This field is required',
    },
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
        key: 'shippingStreet',
        type: 'input',
        value: '',
        label: 'Street Address',
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
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'sameAsBilling',
              operator: 'notEquals',
              value: true,
            },
          },
        ],
      },
      {
        key: 'shippingCity',
        type: 'input',
        value: '',
        label: 'City',
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
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'sameAsBilling',
              operator: 'notEquals',
              value: true,
            },
          },
        ],
      },
      {
        key: 'shippingState',
        type: 'input',
        value: '',
        label: 'State/Province',
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
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'sameAsBilling',
              operator: 'notEquals',
              value: true,
            },
          },
        ],
      },
      {
        key: 'shippingZipCode',
        type: 'input',
        value: '',
        label: 'ZIP/Postal Code',
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
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'sameAsBilling',
              operator: 'notEquals',
              value: true,
            },
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

### Per-Field Visibility

Each shipping field carries the same pair of rules: hidden when the checkbox is checked, required when it is not:

```typescript
{
  key: 'shippingStreet',
  type: 'input',
  value: '',
  label: 'Street Address',
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
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'sameAsBilling',
        operator: 'notEquals',
        value: true,
      },
    },
  ],
}
```

Because the shipping fields are flat (not nested in a group), the form value keeps them at the top level: `shippingStreet`, `shippingCity`, `shippingState`, and `shippingZipCode` sit alongside `billingAddress` and `sameAsBilling`. As an alternative, you can wrap the four fields in a `group` with a single `hidden` rule, which nests them under the group key in the form value.

### Section Titles

The section title is also hidden along with the shipping fields:

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

- **[Conditional Logic](/dynamic-behavior/conditional-logic)** - Full conditional logic guide
- **[Form Groups](/prebuilt/form-groups)** - Working with groups
- **[Checkbox Fields](/field-types/selection)** - Field types reference
