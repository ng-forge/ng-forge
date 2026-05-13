---
title: Utility
slug: field-types/utility
description: 'Text display and hidden field types for ng-forge dynamic forms. Render static content, section headings, and pass hidden values through the form.'
---

Non-input fields for displaying content and passing hidden data.

## text

Renders static text content inside the form layout. Useful for instructions, section headings, or inline notes. The text content comes from the field-level `label` (which goes through the `dynamicText` pipe, so it supports i18n strings, signals, or observables).

```typescript
{
  key: 'notice',
  type: 'text',
  label: 'Your data is encrypted and never shared.',
  className: 'hint',     // optional CSS class on the rendered element
  props: {
    elementType: 'p',    // HTML element: 'p' | 'span' | 'h1'–'h6' (default: 'p')
  }
}
```

**Core Properties:**

- `label`: The text to render (DynamicText — string, signal, or observable)
- `className`: Optional CSS class applied to the rendered element

**Props:**

- `elementType`: Which HTML element to render (`'p'` | `'span'` | `'h1'` – `'h6'`)

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
