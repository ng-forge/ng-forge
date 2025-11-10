# Checkbox

Boolean checkbox control with Material Design styling for single true/false selections.

## Live Demo

{{ NgDocActions.demo("CheckboxIframeDemoComponent") }}

## Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'terms',
      type: 'checkbox',
      checked: false,
      label: 'I accept the terms and conditions',
      required: true,
    },
  ],
} as const satisfies FormConfig;
```

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'checkbox'` | Field type |
| `checked` | `boolean` | Initial checked state |
| `label` | `string` | Checkbox label |
| `required` | `boolean` | Makes field required (must be checked) |
| `disabled` | `boolean` | Disables the checkbox |
| `readonly` | `boolean` | Makes field read-only |
| `hidden` | `boolean` | Hides the field |

## Props (Material-Specific)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |
| `labelPosition` | `'before' \| 'after'` | `'after'` | Position of label text |

## Examples

### Terms and Conditions

```typescript
{
  key: 'acceptTerms',
  type: 'checkbox',
  checked: false,
  label: 'I have read and agree to the Terms of Service',
  required: true,
  validationMessages: {
    required: 'You must accept the terms to continue',
  },
  props: {
    color: 'primary',
  },
}
```

### Newsletter Subscription

```typescript
{
  key: 'newsletter',
  type: 'checkbox',
  checked: true,
  label: 'Subscribe to our newsletter',
  props: {
    color: 'accent',
    labelPosition: 'after',
  },
}
```

### Label Before Checkbox

```typescript
{
  key: 'enableNotifications',
  type: 'checkbox',
  checked: false,
  label: 'Enable email notifications',
  props: {
    labelPosition: 'before',
  },
}
```

### Disabled Checkbox

```typescript
{
  key: 'verified',
  type: 'checkbox',
  checked: true,
  label: 'Email verified',
  disabled: true,
  props: {
    color: 'accent',
  },
}
```

### Warning Color

```typescript
{
  key: 'deleteConfirmation',
  type: 'checkbox',
  checked: false,
  label: 'I understand this action cannot be undone',
  required: true,
  props: {
    color: 'warn',
  },
}
```

## Validation

### Required Checkbox

```typescript
{
  key: 'agreeToPolicy',
  type: 'checkbox',
  checked: false,
  label: 'I agree to the Privacy Policy',
  required: true,
  validationMessages: {
    required: 'Please accept our privacy policy',
  },
}
```

### Custom Validation

```typescript
{
  key: 'consent',
  type: 'checkbox',
  checked: false,
  label: 'I consent to data processing',
  validators: [{
    type: 'custom',
    validator: (value) => value === true ? null : { mustConsent: true },
    errorMessage: 'Consent is required to proceed',
  }],
}
```

## Conditional Logic

### Show Field When Checked

```typescript
const config = {
  fields: [
    {
      key: 'hasPromoCode',
      type: 'checkbox',
      checked: false,
      label: 'I have a promo code',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'promoCode',
      type: 'input',
      value: '',
      label: 'Promo Code',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'hasPromoCode',
          operator: 'equals',
          value: false,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'hasPromoCode',
          operator: 'equals',
          value: true,
        },
        errorMessage: 'Please enter your promo code',
      }],
      props: {
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Enable Field When Checked

```typescript
const config = {
  fields: [
    {
      key: 'customAmount',
      type: 'checkbox',
      checked: false,
      label: 'Enter custom donation amount',
    },
    {
      key: 'amount',
      type: 'input',
      value: 50,
      label: 'Donation Amount',
      logic: [{
        type: 'disabled',
        condition: {
          type: 'fieldValue',
          fieldPath: 'customAmount',
          operator: 'equals',
          value: false,
        },
      }],
      props: {
        type: 'number',
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Multiple Dependent Fields

```typescript
const config = {
  fields: [
    {
      key: 'billingSameAsShipping',
      type: 'checkbox',
      checked: true,
      label: 'Billing address same as shipping',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'billingAddress',
      type: 'input',
      value: '',
      label: 'Billing Address',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'billingSameAsShipping',
          operator: 'equals',
          value: true,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'billingSameAsShipping',
          operator: 'equals',
          value: false,
        },
      }],
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'billingCity',
      type: 'input',
      value: '',
      label: 'Billing City',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'billingSameAsShipping',
          operator: 'equals',
          value: true,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'billingSameAsShipping',
          operator: 'equals',
          value: false,
        },
      }],
      props: {
        appearance: 'outline',
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
      key: 'name',
      type: 'input',
      value: '',
      label: 'Full Name',
      required: true,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      required: true,
      email: true,
      props: {
        type: 'email',
        appearance: 'outline',
      },
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      checked: true,
      label: 'Subscribe to our newsletter for updates and offers',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'notifications',
      type: 'checkbox',
      checked: false,
      label: 'Receive email notifications about new features',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'acceptTerms',
      type: 'checkbox',
      checked: false,
      label: 'I have read and agree to the Terms of Service and Privacy Policy',
      required: true,
      validationMessages: {
        required: 'You must accept the terms to create an account',
      },
      props: {
        color: 'primary',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-registration-form',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class RegistrationFormComponent {
  config = config;
  formValue = signal({
    name: '',
    email: '',
    newsletter: true,
    notifications: false,
    acceptTerms: false,
  });

  onSubmit(value: typeof this.formValue) {
    console.log('Registration submitted:', value());
    // Process registration with preferences
    const formData = value();
    if (formData.newsletter) {
      console.log('User subscribed to newsletter');
    }
    if (formData.notifications) {
      console.log('User opted in to notifications');
    }
  }
}
```

## Type Inference

Checkbox fields infer as `boolean | undefined`:

```typescript
const config = {
  fields: [
    { key: 'terms', type: 'checkbox', checked: false },
  ],
} as const satisfies FormConfig;

// Type: { terms?: boolean }
```

When `required: true`, the field infers as `boolean`:

```typescript
const config = {
  fields: [
    { key: 'terms', type: 'checkbox', checked: false, required: true },
  ],
} as const satisfies FormConfig;

// Type: { terms: boolean }
```

## Accessibility

Checkbox fields include:
- Proper ARIA attributes and roles
- Keyboard navigation (Space to toggle)
- Screen reader support
- Focus management
- Label associations
- Error announcements

## Related

- **[Multi-Checkbox](/ui-integrations/material/selection/multi-checkbox)** - For selecting multiple options
- **[Toggle](/ui-integrations/material/interactive/toggle)** - Slide toggle alternative
- **[Radio](/ui-integrations/material/selection/radio)** - For single selection from multiple options
- **[Validation](/core-concepts/validation/basics)** - Form validation guide
