# Input

Text input field with Material Design styling and HTML5 type support.

## Live Demo

{{ NgDocActions.demo("InputIframeDemoComponent") }}

## Basic Usage

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

## Field Properties

These properties are set at the field level (not in `props`):

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique field identifier (required) |
| `type` | `'input'` | Field type (required) |
| `value` | `string \| number` | Initial value |
| `label` | `string` | Field label |
| `placeholder` | `string` | Placeholder text |
| `required` | `boolean` | Mark field as required |
| `disabled` | `boolean` | Disable the field |
| `readonly` | `boolean` | Make field read-only |

### Validation Properties

| Property | Type | Description |
|----------|------|-------------|
| `email` | `boolean` | Email format validation |
| `minLength` | `number` | Minimum character length |
| `maxLength` | `number` | Maximum character length |
| `min` | `number` | Minimum value (for number inputs) |
| `max` | `number` | Maximum value (for number inputs) |
| `pattern` | `string \| RegExp` | RegEx pattern validation |

## Props (UI-Specific)

These properties go inside the `props` object:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` | HTML input type |
| `appearance` | `'fill' \| 'outline'` | `'fill'` | Material form field style |
| `hint` | `string` | - | Helper text below input |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'` | Error/hint spacing |

## Examples

### Email Input with Validation

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

### Password Input

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

### Number Input with Range

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

### Phone Number

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

### Read-Only Field

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

## Validation Messages

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

## Conditional Logic

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

## Accessibility

Material input fields include:
- Proper label association
- ARIA attributes for validation states
- Screen reader support for errors
- Keyboard navigation

## Related

- [Textarea](./textarea) - Multi-line text input
- [Validation](../../../../../../core/validation/) - Form validation guide
- [Type Safety](../../../../../../core/type-safety/) - TypeScript integration
