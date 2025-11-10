# Textarea

Multi-line text input field with Material Design styling.

## Live Demo

{{ NgDocActions.demo("TextareaIframeDemoComponent") }}

## Basic Usage

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

## Field Properties

Properties that affect behavior and validation:

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier |
| `type` | `'textarea'` | Field type |
| `value` | `string` | Initial value |
| `label` | `string` | Field label |
| `placeholder` | `string` | Placeholder text |
| `required` | `boolean` | Makes field required |
| `disabled` | `boolean` | Disables the field |
| `readonly` | `boolean` | Makes field read-only |
| `hidden` | `boolean` | Hides the field |
| `minLength` | `number` | Minimum character count |
| `maxLength` | `number` | Maximum character count |
| `pattern` | `string \| RegExp` | Validation pattern |

## Props (Material-Specific)

UI-specific properties for Material Design:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appearance` | `'fill' \| 'outline'` | `'outline'` | Visual style |
| `rows` | `number` | `4` | Number of visible rows |
| `cols` | `number` | - | Number of visible columns |
| `resize` | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | Resize behavior |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'` | Error/hint sizing |
| `hint` | `string` | - | Help text below field |

## Examples

### Basic Textarea

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

### With Character Limit

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

### Fixed Height (No Resize)

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

### Outlined Appearance

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

### Read-Only

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

## Validation

### Required Field

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

### Length Validation

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

### Pattern Validation

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

## Conditional Logic

### Show Only When Needed

```typescript
const config = {
  fields: [
    {
      key: 'needsDetails',
      type: 'checkbox',
      value: false,
      label: 'Provide additional details',
    },
    {
      key: 'details',
      type: 'textarea',
      value: '',
      label: 'Additional Details',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'needsDetails',
          operator: 'equals',
          value: false,
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'needsDetails',
          operator: 'equals',
          value: true,
        },
        errorMessage: 'Please provide additional details',
      }],
      props: {
        rows: 8,
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
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class ArticleFormComponent {
  config = config;
  formValue = signal({ title: '', content: '', excerpt: '' });

  onSubmit(value: typeof this.formValue) {
    console.log('Article submitted:', value());
  }
}
```

## Related

- **[Input](../../text-input/input/)** - Single-line text input
- **[Validation](../../../../../../core/validation/basics/)** - Form validation guide
- **[Conditional Logic](../../../../../../core/conditional-logic/basics/)** - Dynamic field behavior
