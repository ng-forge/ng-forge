# Select

Dropdown selection field with Material Design styling. Supports both single and multi-select modes.

## Live Demo

{{ NgDocActions.demo("SelectIframeDemoComponent") }}

## Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      value: '',
      label: 'Country',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'select'` | Field type |
| `value` | `T \| T[]` | Initial value (single or array for multi-select) |
| `options` | `FieldOption<T>[]` | Available options |
| `label` | `string` | Field label |
| `placeholder` | `string` | Placeholder text when no selection |
| `required` | `boolean` | Makes field required |
| `disabled` | `boolean` | Disables the field |
| `readonly` | `boolean` | Makes field read-only |
| `hidden` | `boolean` | Hides the field |

## Props (Material-Specific)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appearance` | `'fill' \| 'outline'` | `'outline'` | Visual style |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `hint` | `string` | - | Help text below field |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'` | Error/hint sizing |

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

### Single Select

```typescript
{
  key: 'priority',
  type: 'select',
  value: '',
  label: 'Priority',
  required: true,
  options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ],
  props: {
    appearance: 'outline',
    hint: 'Select issue priority',
  },
}
```

### Multi-Select

```typescript
{
  key: 'skills',
  type: 'select',
  value: [],
  label: 'Skills',
  required: true,
  options: [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
  ],
  props: {
    multiple: true,
    appearance: 'outline',
    hint: 'Select all that apply',
  },
}
```

### With Placeholder

```typescript
{
  key: 'department',
  type: 'select',
  value: '',
  label: 'Department',
  placeholder: 'Choose a department',
  options: [
    { value: 'eng', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'Human Resources' },
  ],
  props: {
    appearance: 'fill',
  },
}
```

### With Disabled Options

```typescript
{
  key: 'plan',
  type: 'select',
  value: '',
  label: 'Subscription Plan',
  required: true,
  options: [
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic - $10/mo' },
    { value: 'pro', label: 'Pro - $30/mo' },
    { value: 'enterprise', label: 'Enterprise - Contact Sales', disabled: true },
  ],
  props: {
    hint: 'Select your subscription plan',
  },
}
```

### Numeric Values

```typescript
{
  key: 'quantity',
  type: 'select',
  value: 1,
  label: 'Quantity',
  required: true,
  options: [
    { value: 1, label: '1 item' },
    { value: 2, label: '2 items' },
    { value: 5, label: '5 items' },
    { value: 10, label: '10 items' },
    { value: 25, label: '25 items' },
  ],
}
```

### Object Values (Complex Types)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

{
  key: 'assignee',
  type: 'select',
  value: null,
  label: 'Assign To',
  options: [
    {
      value: { id: 1, name: 'John Doe', email: 'john@example.com' },
      label: 'John Doe',
    },
    {
      value: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      label: 'Jane Smith',
    },
  ] as FieldOption<User>[],
  props: {
    hint: 'Select team member',
  },
}
```

## Validation

### Required Field

```typescript
{
  key: 'status',
  type: 'select',
  value: '',
  label: 'Status',
  required: true,
  options: [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ],
  validationMessages: {
    required: 'Please select a status',
  },
}
```

### Multi-Select with Minimum

```typescript
{
  key: 'interests',
  type: 'select',
  value: [],
  label: 'Interests',
  required: true,
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'reading', label: 'Reading' },
    { value: 'travel', label: 'Travel' },
  ],
  validators: [{
    type: 'minArrayLength',
    value: 2,
    errorMessage: 'Please select at least 2 interests',
  }],
  props: {
    multiple: true,
    hint: 'Select at least 2',
  },
}
```

## Conditional Logic

### Dependent Dropdowns

```typescript
const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      value: '',
      label: 'Country',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ],
    },
    {
      key: 'state',
      type: 'select',
      value: '',
      label: 'State/Province',
      required: true,
      options: [
        { value: 'ca', label: 'California' },
        { value: 'ny', label: 'New York' },
        { value: 'on', label: 'Ontario' },
        { value: 'bc', label: 'British Columbia' },
      ],
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'country',
          operator: 'equals',
          value: '',
        },
      }],
      props: {
        hint: 'Select country first',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Show Field Based on Selection

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
      key: 'category',
      type: 'select',
      value: '',
      label: 'Category',
      required: true,
      placeholder: 'Select a category',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'home', label: 'Home & Garden' },
      ],
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'tags',
      type: 'select',
      value: [],
      label: 'Tags',
      options: [
        { value: 'new', label: 'New Arrival' },
        { value: 'sale', label: 'On Sale' },
        { value: 'featured', label: 'Featured' },
        { value: 'popular', label: 'Popular' },
      ],
      props: {
        multiple: true,
        appearance: 'outline',
        hint: 'Select all that apply',
      },
    },
    {
      key: 'condition',
      type: 'select',
      value: 'new',
      label: 'Condition',
      required: true,
      options: [
        { value: 'new', label: 'New' },
        { value: 'like-new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
      ],
      props: {
        appearance: 'outline',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Listing',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-product-form',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class ProductFormComponent {
  config = config;
  formValue = signal({ category: '', tags: [], condition: 'new' });

  onSubmit(value: typeof this.formValue) {
    console.log('Product listing created:', value());
  }
}
```

## Type Inference

Select fields with `value: ''` infer as `string | undefined`:

```typescript
const config = {
  fields: [
    { key: 'status', type: 'select', value: '', options: [] },
  ],
} as const satisfies FormConfig;

// Type: { status?: string }
```

Multi-select fields with `value: []` infer as `string[] | undefined`:

```typescript
const config = {
  fields: [
    { key: 'skills', type: 'select', value: [], options: [], props: { multiple: true } },
  ],
} as const satisfies FormConfig;

// Type: { skills?: string[] }
```

## Related

- **[Radio](../../selection/radio/)** - Radio button alternative
- **[Multi-Checkbox](../../selection/multi-checkbox/)** - Checkbox alternative for multi-select
- **[Conditional Logic](../../../../../../core/conditional-logic/basics/)** - Dynamic field behavior
- **[Type Safety](../../../../../../core/type-safety/basics/)** - Type inference details
