# Text Input Fields

Text input fields provide user-friendly text entry with Material Design styling. These fields support both single-line and multi-line text input with comprehensive validation and HTML5 type support.

---

## Input

Text input field with Material Design styling and HTML5 type support.

### Live Demo

{{ NgDocActions.demo("InputIframeDemoComponent") }}

### Basic Usage

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  value: '',
  required: true,
  email: true,
  props: {
    type: 'email',
    appearance: 'outline',
    placeholder: 'Enter your email',
  },
}
```

### Field Properties

These properties are set at the field level (not in `props`):

| Property      | Type               | Description                        |
| ------------- | ------------------ | ---------------------------------- |
| `key`         | `string`           | Unique field identifier (required) |
| `type`        | `'input'`          | Field type (required)              |
| `value`       | `string \| number` | Initial value                      |
| `label`       | `string`           | Field label                        |
| `placeholder` | `string`           | Placeholder text                   |
| `required`    | `boolean`          | Mark field as required             |
| `disabled`    | `boolean`          | Disable the field                  |
| `readonly`    | `boolean`          | Make field read-only               |

#### Validation Properties

| Property    | Type               | Description                       |
| ----------- | ------------------ | --------------------------------- |
| `email`     | `boolean`          | Email format validation           |
| `minLength` | `number`           | Minimum character length          |
| `maxLength` | `number`           | Maximum character length          |
| `min`       | `number`           | Minimum value (for number inputs) |
| `max`       | `number`           | Maximum value (for number inputs) |
| `pattern`   | `string \| RegExp` | RegEx pattern validation          |

### Props (UI-Specific)

These properties go inside the `props` object:

| Prop              | Type                                                            | Default   | Description               |
| ----------------- | --------------------------------------------------------------- | --------- | ------------------------- |
| `type`            | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'`  | HTML input type           |
| `appearance`      | `'fill' \| 'outline'`                                           | `'fill'`  | Material form field style |
| `hint`            | `string`                                                        | -         | Helper text below input   |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                                          | `'fixed'` | Error/hint spacing        |

### Examples

#### Email Input with Validation

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  value: '',
  required: true,
  email: true,
  props: {
    type: 'email',
    appearance: 'outline',
    placeholder: 'user@example.com',
    hint: 'We will never share your email',
  },
}
```

#### Password Input

```typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  value: '',
  required: true,
  minLength: 8,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  props: {
    type: 'password',
    appearance: 'outline',
    hint: 'At least 8 characters with uppercase, lowercase, and number',
  },
}
```

#### Number Input with Range

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  value: null,
  required: true,
  min: 18,
  max: 120,
  props: {
    type: 'number',
    appearance: 'outline',
    placeholder: '18',
  },
}
```

#### Phone Number

```typescript
{
  key: 'phone',
  type: 'input',
  label: 'Phone Number',
  value: '',
  pattern: '^\\+?[1-9]\\d{1,14}$',
  props: {
    type: 'tel',
    appearance: 'outline',
    placeholder: '+1 (555) 000-0000',
    hint: 'E.164 format preferred',
  },
}
```

#### Read-Only Field

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  value: 'john_doe',
  readonly: true,
  props: {
    appearance: 'outline',
    hint: 'Username cannot be changed',
  },
}
```

### Validation Messages

Customize error messages for better UX:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  value: '',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email address is required',
    email: 'Please enter a valid email address',
  },
  props: {
    type: 'email',
    appearance: 'outline',
  },
}
```

### Conditional Logic

Show/hide or enable/disable based on other fields:

```typescript
{
  key: 'workEmail',
  type: 'input',
  label: 'Work Email',
  value: '',
  email: true,
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
  props: {
    type: 'email',
    appearance: 'outline',
  },
}
```

### Accessibility

Material input fields include:

- Proper label association
- ARIA attributes for validation states
- Screen reader support for errors
- Keyboard navigation

---

## Textarea

Multi-line text input field with Material Design styling.

### Live Demo

{{ NgDocActions.demo("TextareaIframeDemoComponent") }}

### Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'bio',
      type: 'textarea',
      value: '',
      label: 'Biography',
      placeholder: 'Tell us about yourself',
      required: true,
    },
  ],
} as const satisfies FormConfig;
```

### Field Properties

Properties that affect behavior and validation:

| Property      | Type               | Description             |
| ------------- | ------------------ | ----------------------- |
| `key`         | `string`           | Unique field identifier |
| `type`        | `'textarea'`       | Field type              |
| `value`       | `string`           | Initial value           |
| `label`       | `string`           | Field label             |
| `placeholder` | `string`           | Placeholder text        |
| `required`    | `boolean`          | Makes field required    |
| `disabled`    | `boolean`          | Disables the field      |
| `readonly`    | `boolean`          | Makes field read-only   |
| `hidden`      | `boolean`          | Hides the field         |
| `minLength`   | `number`           | Minimum character count |
| `maxLength`   | `number`           | Maximum character count |
| `pattern`     | `string \| RegExp` | Validation pattern      |

### Props (Material-Specific)

UI-specific properties for Material Design:

| Prop              | Type                                             | Default      | Description               |
| ----------------- | ------------------------------------------------ | ------------ | ------------------------- |
| `appearance`      | `'fill' \| 'outline'`                            | `'outline'`  | Visual style              |
| `rows`            | `number`                                         | `4`          | Number of visible rows    |
| `cols`            | `number`                                         | -            | Number of visible columns |
| `resize`          | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | Resize behavior           |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                           | `'fixed'`    | Error/hint sizing         |
| `hint`            | `string`                                         | -            | Help text below field     |

### Examples

#### Basic Textarea

```typescript
{
  key: 'description',
  type: 'textarea',
  value: '',
  label: 'Description',
  placeholder: 'Enter a description',
  props: {
    rows: 6,
  },
}
```

#### With Character Limit

```typescript
{
  key: 'comment',
  type: 'textarea',
  value: '',
  label: 'Comment',
  required: true,
  maxLength: 500,
  props: {
    hint: 'Maximum 500 characters',
    rows: 8,
  },
}
```

#### Fixed Height (No Resize)

```typescript
{
  key: 'notes',
  type: 'textarea',
  value: '',
  label: 'Notes',
  props: {
    rows: 5,
    resize: 'none',
    appearance: 'fill',
  },
}
```

#### Outlined Appearance

```typescript
{
  key: 'feedback',
  type: 'textarea',
  value: '',
  label: 'Feedback',
  placeholder: 'Share your thoughts',
  props: {
    appearance: 'outline',
    rows: 10,
    resize: 'vertical',
    hint: 'We appreciate your feedback',
  },
}
```

#### Read-Only

```typescript
{
  key: 'terms',
  type: 'textarea',
  value: 'Terms and conditions text here...',
  label: 'Terms and Conditions',
  readonly: true,
  props: {
    rows: 12,
    resize: 'none',
    appearance: 'outline',
  },
}
```

### Validation

#### Required Field

```typescript
{
  key: 'message',
  type: 'textarea',
  value: '',
  label: 'Message',
  required: true,
  props: {
    hint: 'This field is required',
  },
}
```

#### Length Validation

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  required: true,
  minLength: 50,
  maxLength: 500,
  validationMessages: {
    required: 'Biography is required',
    minLength: 'Biography must be at least 50 characters',
    maxLength: 'Biography cannot exceed 500 characters',
  },
  props: {
    rows: 10,
    hint: 'Between 50 and 500 characters',
  },
}
```

#### Pattern Validation

```typescript
{
  key: 'markdown',
  type: 'textarea',
  value: '',
  label: 'Markdown Content',
  pattern: '^[\\s\\S]*$', // Allow any character including newlines
  props: {
    rows: 15,
    resize: 'both',
  },
}
```

### Conditional Logic

#### Show Only When Needed

```typescript
const config = {
  fields: [
    {
      key: 'needsDetails',
      type: 'checkbox',
      checked: false,
      label: 'Provide additional details',
    },
    {
      key: 'details',
      type: 'textarea',
      value: '',
      label: 'Additional Details',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'needsDetails',
            operator: 'equals',
            value: false,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'needsDetails',
            operator: 'equals',
            value: true,
          },
          errorMessage: 'Please provide additional details',
        },
      ],
      props: {
        rows: 8,
      },
    },
  ],
} as const satisfies FormConfig;
```

### Complete Example

```typescript
import { Component, signal } from '@angular/core';
import { FormConfig, DynamicFormComponent } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'title',
      type: 'input',
      value: '',
      label: 'Title',
      required: true,
      maxLength: 100,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'content',
      type: 'textarea',
      value: '',
      label: 'Content',
      required: true,
      minLength: 50,
      maxLength: 2000,
      props: {
        appearance: 'outline',
        rows: 12,
        resize: 'vertical',
        hint: 'Write your article content (50-2000 characters)',
      },
    },
    {
      key: 'excerpt',
      type: 'textarea',
      value: '',
      label: 'Excerpt',
      maxLength: 200,
      props: {
        appearance: 'outline',
        rows: 4,
        resize: 'vertical',
        hint: 'Optional short summary',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Publish Article',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-article-form',
  imports: [DynamicFormComponent],
  template: ` <df-dynamic-form [config]="config" [(value)]="formValue" (formSubmit)="onSubmit($event)" /> `,
})
export class ArticleFormComponent {
  config = config;
  formValue = signal({ title: '', content: '', excerpt: '' });

  onSubmit(value: typeof this.formValue) {
    console.log('Article submitted:', value());
  }
}
```

---

## Related

- [Selection Fields](../selection-fields) - Select, radio, checkbox options
- [Interactive Fields](../interactive-fields) - Toggle, slider, datepicker
- [Validation](../../../../../core/validation/) - Form validation guide
- [Type Safety](../../../../../core/type-safety/) - TypeScript integration
