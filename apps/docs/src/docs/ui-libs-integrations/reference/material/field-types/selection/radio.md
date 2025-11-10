# Radio

Radio button group for selecting a single option from multiple choices with Material Design styling.

## Live Demo

{{ NgDocActions.demo("RadioIframeDemoComponent") }}

## Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'size',
      type: 'radio',
      value: '',
      label: 'Select Size',
      required: true,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'radio'` | Field type |
| `value` | `T` | Initial selected value |
| `options` | `FieldOption<T>[]` | Available options |
| `label` | `string` | Field label |
| `required` | `boolean` | Makes field required |
| `disabled` | `boolean` | Disables all radio buttons |
| `readonly` | `boolean` | Makes field read-only |
| `hidden` | `boolean` | Hides the field |

## Props (Material-Specific)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |
| `labelPosition` | `'before' \| 'after'` | `'after'` | Position of option labels |

## Options Format

Options use the `FieldOption` interface:

```typescript
interface FieldOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}
```

## Examples

### Basic Radio Group

```typescript
{
  key: 'priority',
  type: 'radio',
  value: '',
  label: 'Priority Level',
  required: true,
  options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ],
  props: {
    color: 'primary',
  },
}
```

### With Accent Color

```typescript
{
  key: 'theme',
  type: 'radio',
  value: 'light',
  label: 'Theme Preference',
  options: [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'auto', label: 'Auto (System)' },
  ],
  props: {
    color: 'accent',
    labelPosition: 'after',
  },
}
```

### Label Position Before

```typescript
{
  key: 'alignment',
  type: 'radio',
  value: 'left',
  label: 'Text Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  props: {
    labelPosition: 'before',
  },
}
```

### With Disabled Options

```typescript
{
  key: 'plan',
  type: 'radio',
  value: 'free',
  label: 'Subscription Plan',
  required: true,
  options: [
    { value: 'free', label: 'Free - $0/month' },
    { value: 'basic', label: 'Basic - $10/month' },
    { value: 'pro', label: 'Pro - $30/month' },
    { value: 'enterprise', label: 'Enterprise - Contact Sales', disabled: true },
  ],
  props: {
    color: 'primary',
  },
}
```

### Numeric Values

```typescript
{
  key: 'rating',
  type: 'radio',
  value: null,
  label: 'Rate Your Experience',
  required: true,
  options: [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' },
  ],
}
```

### Boolean Choices

```typescript
{
  key: 'newsletter',
  type: 'radio',
  value: null,
  label: 'Subscribe to Newsletter?',
  required: true,
  options: [
    { value: true, label: 'Yes, keep me updated' },
    { value: false, label: 'No, thanks' },
  ],
}
```

## Validation

### Required Field

```typescript
{
  key: 'gender',
  type: 'radio',
  value: '',
  label: 'Gender',
  required: true,
  options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  validationMessages: {
    required: 'Please select your gender',
  },
}
```

### Custom Validation

```typescript
{
  key: 'confirmation',
  type: 'radio',
  value: '',
  label: 'Do you confirm this action?',
  required: true,
  options: [
    { value: 'yes', label: 'Yes, I confirm' },
    { value: 'no', label: 'No, cancel' },
  ],
  validators: [{
    type: 'custom',
    validator: (value) => value === 'yes' ? null : { mustConfirm: true },
    errorMessage: 'You must confirm to proceed',
  }],
}
```

## Conditional Logic

### Show Field Based on Radio Selection

```typescript
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      value: '',
      label: 'Account Type',
      required: true,
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' },
      ],
    },
    {
      key: 'companyName',
      type: 'input',
      value: '',
      label: 'Company Name',
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
        errorMessage: 'Company name is required for business accounts',
      }],
      props: {
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Conditional Required Validation

```typescript
const config = {
  fields: [
    {
      key: 'hasAllergies',
      type: 'radio',
      value: '',
      label: 'Do you have any food allergies?',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      key: 'allergyDetails',
      type: 'textarea',
      value: '',
      label: 'Please describe your allergies',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'hasAllergies',
          operator: 'notEquals',
          value: 'yes',
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'hasAllergies',
          operator: 'equals',
          value: 'yes',
        },
        errorMessage: 'Please provide allergy details',
      }],
      props: {
        rows: 4,
      },
    },
  ],
} as const satisfies FormConfig;
```

## Complete Example

```typescript
import { Component, signal } from '@angular/core';
import { FormConfig, DynamicFormComponent } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'shippingMethod',
      type: 'radio',
      value: 'standard',
      label: 'Shipping Method',
      required: true,
      options: [
        { value: 'standard', label: 'Standard (5-7 business days) - Free' },
        { value: 'express', label: 'Express (2-3 business days) - $15' },
        { value: 'overnight', label: 'Overnight - $35' },
      ],
      props: {
        color: 'primary',
      },
    },
    {
      key: 'giftWrap',
      type: 'radio',
      value: 'no',
      label: 'Gift Wrap',
      options: [
        { value: 'no', label: 'No gift wrap' },
        { value: 'standard', label: 'Standard gift wrap - $5' },
        { value: 'premium', label: 'Premium gift wrap - $10' },
      ],
      props: {
        color: 'accent',
      },
    },
    {
      key: 'giftMessage',
      type: 'textarea',
      value: '',
      label: 'Gift Message',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'giftWrap',
          operator: 'equals',
          value: 'no',
        },
      }],
      props: {
        appearance: 'outline',
        rows: 3,
        hint: 'Maximum 200 characters',
      },
      maxLength: 200,
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Continue to Payment',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-shipping-form',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class ShippingFormComponent {
  config = config;
  formValue = signal({ shippingMethod: 'standard', giftWrap: 'no', giftMessage: '' });

  onSubmit(value: typeof this.formValue) {
    console.log('Shipping preferences:', value());
    // Calculate total cost based on selections
    const costs = {
      shipping: {
        standard: 0,
        express: 15,
        overnight: 35,
      },
      giftWrap: {
        no: 0,
        standard: 5,
        premium: 10,
      },
    };

    const formData = value();
    const total = costs.shipping[formData.shippingMethod] + costs.giftWrap[formData.giftWrap];
    console.log('Additional cost:', total);
  }
}
```

## Type Inference

Radio fields infer the union type of option values:

```typescript
const config = {
  fields: [
    {
      key: 'status',
      type: 'radio',
      value: 'pending',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ] as const,
    },
  ],
} as const satisfies FormConfig;

// Type: { status: 'pending' | 'approved' | 'rejected' }
```

## Accessibility

Radio groups include:
- Proper ARIA role and attributes
- Keyboard navigation (arrow keys, tab)
- Screen reader announcements
- Focus management
- Label associations

## Related

- **[Select](/ui-integrations/material/selection/select)** - Dropdown alternative for many options
- **[Checkbox](/ui-integrations/material/selection/checkbox)** - For boolean choices
- **[Multi-Checkbox](/ui-integrations/material/selection/multi-checkbox)** - For multiple selections
- **[Conditional Logic](/core-concepts/conditional-logic/basics)** - Dynamic field behavior
