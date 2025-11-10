# Selection Fields

Selection fields enable users to choose from predefined options using various Material Design controls. These fields support single and multiple selections with comprehensive validation and accessibility features.

---

## Select

Dropdown selection field with Material Design styling. Supports both single and multi-select modes.

### Live Demo

{{ NgDocActions.demo("SelectIframeDemoComponent") }}

### Basic Usage

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

### Field Properties

| Property      | Type               | Description                                      |
| ------------- | ------------------ | ------------------------------------------------ |
| `key`         | `string`           | Unique field identifier                          |
| `type`        | `'select'`         | Field type                                       |
| `value`       | `T \| T[]`         | Initial value (single or array for multi-select) |
| `options`     | `FieldOption<T>[]` | Available options                                |
| `label`       | `string`           | Field label                                      |
| `placeholder` | `string`           | Placeholder text when no selection               |
| `required`    | `boolean`          | Makes field required                             |
| `disabled`    | `boolean`          | Disables the field                               |
| `readonly`    | `boolean`          | Makes field read-only                            |
| `hidden`      | `boolean`          | Hides the field                                  |

### Props (Material-Specific)

| Prop              | Type                   | Default     | Description           |
| ----------------- | ---------------------- | ----------- | --------------------- |
| `appearance`      | `'fill' \| 'outline'`  | `'outline'` | Visual style          |
| `multiple`        | `boolean`              | `false`     | Enable multi-select   |
| `hint`            | `string`               | -           | Help text below field |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'`   | Error/hint sizing     |

### Options Format

Options use the `FieldOption` interface:

```typescript
interface FieldOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}
```

### Examples

#### Single Select

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

#### Multi-Select

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

---

## Radio

Radio button group for selecting a single option from multiple choices with Material Design styling.

### Live Demo

{{ NgDocActions.demo("RadioIframeDemoComponent") }}

### Basic Usage

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

### Field Properties

| Property   | Type               | Description                |
| ---------- | ------------------ | -------------------------- |
| `key`      | `string`           | Unique field identifier    |
| `type`     | `'radio'`          | Field type                 |
| `value`    | `T`                | Initial selected value     |
| `options`  | `FieldOption<T>[]` | Available options          |
| `label`    | `string`           | Field label                |
| `required` | `boolean`          | Makes field required       |
| `disabled` | `boolean`          | Disables all radio buttons |
| `readonly` | `boolean`          | Makes field read-only      |
| `hidden`   | `boolean`          | Hides the field            |

### Props (Material-Specific)

| Prop            | Type                              | Default     | Description               |
| --------------- | --------------------------------- | ----------- | ------------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color      |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of option labels |

### Examples

#### Basic Radio Group

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

---

## Checkbox

Boolean checkbox control with Material Design styling for single true/false selections.

### Live Demo

{{ NgDocActions.demo("CheckboxIframeDemoComponent") }}

### Basic Usage

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

### Field Properties

| Property   | Type         | Description                            |
| ---------- | ------------ | -------------------------------------- |
| `key`      | `string`     | Unique field identifier                |
| `type`     | `'checkbox'` | Field type                             |
| `checked`  | `boolean`    | Initial checked state                  |
| `label`    | `string`     | Checkbox label                         |
| `required` | `boolean`    | Makes field required (must be checked) |
| `disabled` | `boolean`    | Disables the checkbox                  |
| `readonly` | `boolean`    | Makes field read-only                  |
| `hidden`   | `boolean`    | Hides the field                        |

### Props (Material-Specific)

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

### Examples

#### Terms and Conditions

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

---

## Multi-Checkbox

Multiple checkbox selection field with Material Design styling for choosing multiple options.

### Live Demo

{{ NgDocActions.demo("MultiCheckboxIframeDemoComponent") }}

### Basic Usage

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

### Field Properties

| Property   | Type               | Description                                         |
| ---------- | ------------------ | --------------------------------------------------- |
| `key`      | `string`           | Unique field identifier                             |
| `type`     | `'multi-checkbox'` | Field type                                          |
| `value`    | `T[]`              | Initial selected values (array)                     |
| `options`  | `FieldOption<T>[]` | Available options                                   |
| `label`    | `string`           | Field label                                         |
| `required` | `boolean`          | Makes field required (at least one must be checked) |
| `disabled` | `boolean`          | Disables all checkboxes                             |
| `readonly` | `boolean`          | Makes field read-only                               |
| `hidden`   | `boolean`          | Hides the field                                     |

### Props (Material-Specific)

| Prop            | Type                              | Default     | Description               |
| --------------- | --------------------------------- | ----------- | ------------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color      |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of option labels |

### Examples

#### Basic Multi-Checkbox

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

#### Minimum Selection Count

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

---

## Related

- [Text Input Fields](../text-inputs) - Input and textarea fields
- [Interactive Fields](../interactive-fields) - Toggle, slider, datepicker
- [Validation](../../../../../core/validation/) - Form validation guide
- [Conditional Logic](../../../../../core/conditional-logic/) - Dynamic field behavior
