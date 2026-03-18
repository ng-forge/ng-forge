---
title: Text Inputs
slug: field-types/text-inputs
---

Text-based input fields for collecting typed data from users.

## input

Text-based input with HTML5 type support.

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
  email: true,
  props: {
    type: 'email',              // 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    placeholder: 'user@example.com',
  }
}
```

**Core Props:**

- `type`: HTML input type (`'text'` | `'email'` | `'password'` | `'number'` | `'tel'` | `'url'`)
- `placeholder`: Input placeholder text

### Adapter Props

<docs-adapter-props field="input"></docs-adapter-props>

<docs-live-example scenario="examples/input" hideForCustom="true"></docs-live-example>

## textarea

Multi-line text input.

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  maxLength: 500,
  props: {
    placeholder: 'Tell us about yourself',
    rows: 4,
  }
}
```

**Core Props:**

- `placeholder`: Placeholder text
- `rows`: Number of visible text rows

### Adapter Props

<docs-adapter-props field="textarea"></docs-adapter-props>

<docs-live-example scenario="examples/textarea" hideForCustom="true"></docs-live-example>
