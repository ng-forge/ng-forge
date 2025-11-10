# Multi-Checkbox

Multiple checkbox selection field with Material Design styling for choosing multiple options.

## Live Demo

{{ NgDocActions.demo("MultiCheckboxIframeDemoComponent") }}

## Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'interests',
      type: 'multi-checkbox',
      value: [],
      label: 'Select Your Interests',
      required: true,
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading' },
        { value: 'travel', label: 'Travel' },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'multi-checkbox'` | Field type |
| `value` | `T[]` | Initial selected values (array) |
| `options` | `FieldOption<T>[]` | Available options |
| `label` | `string` | Field label |
| `required` | `boolean` | Makes field required (at least one must be checked) |
| `disabled` | `boolean` | Disables all checkboxes |
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

### Basic Multi-Checkbox

```typescript
{
  key: 'skills',
  type: 'multi-checkbox',
  value: [],
  label: 'Technical Skills',
  required: true,
  options: [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
  ],
  props: {
    color: 'primary',
  },
}
```

### With Pre-Selected Values

```typescript
{
  key: 'notifications',
  type: 'multi-checkbox',
  value: ['email', 'sms'],
  label: 'Notification Preferences',
  options: [
    { value: 'email', label: 'Email notifications' },
    { value: 'sms', label: 'SMS notifications' },
    { value: 'push', label: 'Push notifications' },
    { value: 'inApp', label: 'In-app notifications' },
  ],
  props: {
    color: 'accent',
  },
}
```

### With Accent Color

```typescript
{
  key: 'features',
  type: 'multi-checkbox',
  value: [],
  label: 'Select Features',
  options: [
    { value: 'analytics', label: 'Analytics Dashboard' },
    { value: 'api', label: 'API Access' },
    { value: 'support', label: 'Priority Support' },
    { value: 'custom', label: 'Custom Branding' },
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
  key: 'permissions',
  type: 'multi-checkbox',
  value: ['read'],
  label: 'User Permissions',
  options: [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin', label: 'Admin' },
  ],
  props: {
    labelPosition: 'before',
  },
}
```

### With Disabled Options

```typescript
{
  key: 'subscription',
  type: 'multi-checkbox',
  value: [],
  label: 'Add-On Services',
  options: [
    { value: 'backup', label: 'Daily Backups - $5/month' },
    { value: 'ssl', label: 'SSL Certificate - $10/month' },
    { value: 'cdn', label: 'CDN - $15/month' },
    { value: 'enterprise', label: 'Enterprise Support - Contact Sales', disabled: true },
  ],
  props: {
    color: 'primary',
  },
}
```

### Numeric Values

```typescript
{
  key: 'sizes',
  type: 'multi-checkbox',
  value: [],
  label: 'Available Sizes',
  options: [
    { value: 1, label: 'Extra Small (XS)' },
    { value: 2, label: 'Small (S)' },
    { value: 3, label: 'Medium (M)' },
    { value: 4, label: 'Large (L)' },
    { value: 5, label: 'Extra Large (XL)' },
  ],
}
```

## Validation

### Required Field (At Least One)

```typescript
{
  key: 'languages',
  type: 'multi-checkbox',
  value: [],
  label: 'Programming Languages',
  required: true,
  options: [
    { value: 'js', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
  ],
  validationMessages: {
    required: 'Please select at least one language',
  },
}
```

### Minimum Selection Count

```typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  value: [],
  label: 'Interests',
  required: true,
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art' },
    { value: 'technology', label: 'Technology' },
    { value: 'travel', label: 'Travel' },
  ],
  validators: [{
    type: 'minArrayLength',
    value: 2,
    errorMessage: 'Please select at least 2 interests',
  }],
}
```

### Maximum Selection Count

```typescript
{
  key: 'topChoices',
  type: 'multi-checkbox',
  value: [],
  label: 'Select Your Top 3 Preferences',
  required: true,
  options: [
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'data', label: 'Data Science' },
  ],
  validators: [{
    type: 'maxArrayLength',
    value: 3,
    errorMessage: 'You can select up to 3 preferences',
  }],
}
```

### Range Validation

```typescript
{
  key: 'days',
  type: 'multi-checkbox',
  value: [],
  label: 'Available Days',
  options: [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' },
  ],
  validators: [
    {
      type: 'minArrayLength',
      value: 2,
      errorMessage: 'Select at least 2 days',
    },
    {
      type: 'maxArrayLength',
      value: 5,
      errorMessage: 'Select no more than 5 days',
    },
  ],
}
```

## Conditional Logic

### Show Field Based on Selection Count

```typescript
const config = {
  fields: [
    {
      key: 'hobbies',
      type: 'multi-checkbox',
      value: [],
      label: 'Hobbies',
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading' },
        { value: 'gaming', label: 'Gaming' },
      ],
    },
    {
      key: 'hobbyDetails',
      type: 'textarea',
      value: '',
      label: 'Tell us more about your hobbies',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => {
            const hobbies = formValue.hobbies || [];
            return hobbies.length === 0;
          },
        },
      }],
      props: {
        rows: 4,
      },
    },
  ],
} as const satisfies FormConfig;
```

### Require Field If Specific Option Selected

```typescript
const config = {
  fields: [
    {
      key: 'dietaryRestrictions',
      type: 'multi-checkbox',
      value: [],
      label: 'Dietary Restrictions',
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'glutenFree', label: 'Gluten Free' },
        { value: 'other', label: 'Other (please specify)' },
      ],
    },
    {
      key: 'otherRestrictions',
      type: 'input',
      value: '',
      label: 'Please specify other restrictions',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => {
            const restrictions = formValue.dietaryRestrictions || [];
            return !restrictions.includes('other');
          },
        },
      }, {
        type: 'required',
        condition: {
          type: 'custom',
          validator: (_, formValue) => {
            const restrictions = formValue.dietaryRestrictions || [];
            return restrictions.includes('other');
          },
        },
        errorMessage: 'Please specify your dietary restrictions',
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
      key: 'skills',
      type: 'multi-checkbox',
      value: [],
      label: 'Technical Skills',
      required: true,
      options: [
        { value: 'html', label: 'HTML/CSS' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'node', label: 'Node.js' },
        { value: 'python', label: 'Python' },
      ],
      validators: [{
        type: 'minArrayLength',
        value: 3,
        errorMessage: 'Please select at least 3 skills',
      }],
      props: {
        color: 'primary',
      },
    },
    {
      key: 'yearsExperience',
      type: 'select',
      value: '',
      label: 'Years of Experience',
      required: true,
      options: [
        { value: '0-1', label: '0-1 years' },
        { value: '1-3', label: '1-3 years' },
        { value: '3-5', label: '3-5 years' },
        { value: '5-10', label: '5-10 years' },
        { value: '10+', label: '10+ years' },
      ],
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'availability',
      type: 'multi-checkbox',
      value: [],
      label: 'Available Days',
      options: [
        { value: 'mon', label: 'Monday' },
        { value: 'tue', label: 'Tuesday' },
        { value: 'wed', label: 'Wednesday' },
        { value: 'thu', label: 'Thursday' },
        { value: 'fri', label: 'Friday' },
      ],
      validators: [{
        type: 'minArrayLength',
        value: 2,
        errorMessage: 'Please select at least 2 days',
      }],
      props: {
        color: 'accent',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Submit Application',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-developer-application',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class DeveloperApplicationComponent {
  config = config;
  formValue = signal({
    name: '',
    skills: [],
    yearsExperience: '',
    availability: [],
  });

  onSubmit(value: typeof this.formValue) {
    const formData = value();
    console.log('Application submitted:', formData);
    console.log(`Selected ${formData.skills.length} skills:`, formData.skills);
    console.log(`Available ${formData.availability.length} days:`, formData.availability);
  }
}
```

## Type Inference

Multi-checkbox fields infer as `T[] | undefined` where T is the option value type:

```typescript
const config = {
  fields: [
    {
      key: 'tags',
      type: 'multi-checkbox',
      value: [],
      options: [
        { value: 'new', label: 'New' },
        { value: 'featured', label: 'Featured' },
      ] as const,
    },
  ],
} as const satisfies FormConfig;

// Type: { tags?: ('new' | 'featured')[] }
```

## Accessibility

Multi-checkbox fields include:
- Proper ARIA attributes and roles
- Keyboard navigation (Tab, Space)
- Screen reader support for group and individual checkboxes
- Focus management
- Label associations
- Error announcements

## Related

- **[Select](/ui-integrations/material/selection/select)** - Dropdown multi-select alternative
- **[Checkbox](/ui-integrations/material/selection/checkbox)** - For single boolean choice
- **[Radio](/ui-integrations/material/selection/radio)** - For single selection from multiple options
- **[Validation](/core-concepts/validation/basics)** - Form validation guide
