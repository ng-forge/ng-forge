---
title: Utility
slug: schema-fields/field-types/utility
---

Non-input fields for displaying content and passing hidden data.

## text

Renders static text content inside the form layout. Useful for instructions, section headings, or inline notes.

```typescript
{
  key: 'notice',
  type: 'text',
  props: {
    content: 'Your data is encrypted and never shared.',
    tag: 'p',          // HTML tag: 'p' | 'span' | 'h1'–'h6' (default: 'p')
    className: 'hint', // optional CSS class
  }
}
```

**Core Props:**

- `content`: The text string to display
- `tag`: HTML element to render (`'p'` | `'span'` | `'h1'`–`'h6'`)

## hidden

Carries a fixed value through the form without rendering any UI. Useful for metadata like user IDs or source identifiers.

```typescript
{
  key: 'userId',
  type: 'hidden',
  value: '42',
}
```

**Core Properties:**

- `value`: The value to include in the form result (required)

> Hidden fields always appear in the submitted form value regardless of visibility or conditional logic.
