# Toggle

Slide toggle switch with Material Design styling for boolean on/off selections.

## Live Demo

{{ NgDocActions.demo("ToggleIframeDemoComponent") }}

## Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'notifications',
      type: 'toggle',
      checked: false,
      label: 'Enable notifications',
    },
  ],
} as const satisfies FormConfig;
```

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'toggle'` | Field type |
| `checked` | `boolean` | Initial toggle state |
| `label` | `string` | Toggle label |
| `required` | `boolean` | Makes field required (must be checked) |
| `disabled` | `boolean` | Disables the toggle |
| `readonly` | `boolean` | Makes field read-only |
| `hidden` | `boolean` | Hides the field |

## Props (Material-Specific)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |
| `labelPosition` | `'before' \| 'after'` | `'after'` | Position of label text |

## Examples

### Basic Toggle

```typescript
{
  key: 'darkMode',
  type: 'toggle',
  checked: false,
  label: 'Enable dark mode',
  props: {
    color: 'primary',
  },
}
```

### With Accent Color

```typescript
{
  key: 'emailNotifications',
  type: 'toggle',
  checked: true,
  label: 'Email notifications',
  props: {
    color: 'accent',
    labelPosition: 'after',
  },
}
```

### Label Position Before

```typescript
{
  key: 'publicProfile',
  type: 'toggle',
  checked: false,
  label: 'Make profile public',
  props: {
    labelPosition: 'before',
  },
}
```

### Disabled Toggle

```typescript
{
  key: 'premiumFeature',
  type: 'toggle',
  checked: false,
  label: 'Premium feature (requires upgrade)',
  disabled: true,
  props: {
    color: 'accent',
  },
}
```

### Warning Color for Critical Setting

```typescript
{
  key: 'deleteAccount',
  type: 'toggle',
  checked: false,
  label: 'Enable account deletion',
  props: {
    color: 'warn',
  },
}
```

### Pre-Enabled Toggle

```typescript
{
  key: 'autoSave',
  type: 'toggle',
  checked: true,
  label: 'Auto-save changes',
  props: {
    color: 'primary',
  },
}
```

## Validation

### Required Toggle

```typescript
{
  key: 'acceptPolicy',
  type: 'toggle',
  checked: false,
  label: 'I agree to the data processing policy',
  required: true,
  validationMessages: {
    required: 'You must accept the policy to continue',
  },
  props: {
    color: 'primary',
  },
}
```

### Custom Validation

```typescript
{
  key: 'twoFactorAuth',
  type: 'toggle',
  checked: false,
  label: 'Enable two-factor authentication',
  validators: [{
    type: 'custom',
    validator: (value) => value === true ? null : { twoFactorRequired: true },
    errorMessage: 'Two-factor authentication is required for this account type',
  }],
}
```

## Conditional Logic

### Show Field When Enabled

```typescript
const config = {
  fields: [
    {
      key: 'customDomain',
      type: 'toggle',
      checked: false,
      label: 'Use custom domain',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'domainName',
      type: 'input',
      value: '',
      label: 'Domain Name',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'customDomain',
          operator: 'equals',
          value: false,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'customDomain',
          operator: 'equals',
          value: true,
        },
        errorMessage: 'Please enter your domain name',
      }],
      props: {
        appearance: 'outline',
        placeholder: 'example.com',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Enable/Disable Related Fields

```typescript
const config = {
  fields: [
    {
      key: 'scheduleBackup',
      type: 'toggle',
      checked: false,
      label: 'Schedule automatic backups',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'backupFrequency',
      type: 'select',
      value: '',
      label: 'Backup Frequency',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
      logic: [{
        type: 'disabled',
        condition: {
          type: 'fieldValue',
          fieldPath: 'scheduleBackup',
          operator: 'equals',
          value: false,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'scheduleBackup',
          operator: 'equals',
          value: true,
        },
      }],
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'backupTime',
      type: 'input',
      value: '',
      label: 'Backup Time',
      logic: [{
        type: 'disabled',
        condition: {
          type: 'fieldValue',
          fieldPath: 'scheduleBackup',
          operator: 'equals',
          value: false,
        },
      }],
      props: {
        type: 'time',
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Multiple Dependent Toggles

```typescript
const config = {
  fields: [
    {
      key: 'marketingEmails',
      type: 'toggle',
      checked: false,
      label: 'Marketing emails',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'productUpdates',
      type: 'toggle',
      checked: false,
      label: 'Product updates',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'newsletter',
      type: 'toggle',
      checked: false,
      label: 'Weekly newsletter',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'frequency',
      type: 'radio',
      value: '',
      label: 'Email Frequency',
      options: [
        { value: 'daily', label: 'Daily digest' },
        { value: 'weekly', label: 'Weekly summary' },
        { value: 'monthly', label: 'Monthly roundup' },
      ],
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => {
            return !formValue.marketingEmails &&
                   !formValue.productUpdates &&
                   !formValue.newsletter;
          },
        },
      }],
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
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      required: true,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'emailNotifications',
      type: 'toggle',
      checked: true,
      label: 'Email notifications',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'pushNotifications',
      type: 'toggle',
      checked: false,
      label: 'Push notifications',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'smsNotifications',
      type: 'toggle',
      checked: false,
      label: 'SMS notifications',
      props: {
        color: 'primary',
      },
    },
    {
      key: 'phoneNumber',
      type: 'input',
      value: '',
      label: 'Phone Number',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'smsNotifications',
          operator: 'equals',
          value: false,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'smsNotifications',
          operator: 'equals',
          value: true,
        },
        errorMessage: 'Phone number is required for SMS notifications',
      }],
      props: {
        type: 'tel',
        appearance: 'outline',
        placeholder: '+1 (555) 000-0000',
      },
    },
    {
      key: 'publicProfile',
      type: 'toggle',
      checked: false,
      label: 'Make my profile public',
      props: {
        color: 'accent',
      },
    },
    {
      key: 'showEmail',
      type: 'toggle',
      checked: false,
      label: 'Show email on public profile',
      logic: [{
        type: 'disabled',
        condition: {
          type: 'fieldValue',
          fieldPath: 'publicProfile',
          operator: 'equals',
          value: false,
        },
      }],
      props: {
        color: 'accent',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Save Settings',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-settings-form',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class SettingsFormComponent {
  config = config;
  formValue = signal({
    username: '',
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    phoneNumber: '',
    publicProfile: false,
    showEmail: false,
  });

  onSubmit(value: typeof this.formValue) {
    const settings = value();
    console.log('Settings saved:', settings);

    // Count enabled notifications
    const notificationCount = [
      settings.emailNotifications,
      settings.pushNotifications,
      settings.smsNotifications,
    ].filter(Boolean).length;

    console.log(`${notificationCount} notification channels enabled`);
  }
}
```

## Type Inference

Toggle fields infer as `boolean | undefined`:

```typescript
const config = {
  fields: [
    { key: 'enabled', type: 'toggle', checked: false },
  ],
} as const satisfies FormConfig;

// Type: { enabled?: boolean }
```

When `required: true`, the field infers as `boolean`:

```typescript
const config = {
  fields: [
    { key: 'enabled', type: 'toggle', checked: false, required: true },
  ],
} as const satisfies FormConfig;

// Type: { enabled: boolean }
```

## Accessibility

Toggle fields include:
- Proper ARIA switch role
- Keyboard navigation (Space/Enter to toggle)
- Screen reader support
- Focus management
- Label associations
- State announcements (on/off)

## Related

- **[Checkbox](/ui-integrations/material/selection/checkbox)** - Checkbox alternative for boolean values
- **[Radio](/ui-integrations/material/selection/radio)** - For single selection from multiple options
- **[Conditional Logic](/core-concepts/conditional-logic/basics)** - Dynamic field behavior
- **[Validation](/core-concepts/validation/basics)** - Form validation guide
