---
title: Button Fields
description: Configure submit, button, next, and previous action fields for form submission, custom click handlers, and multi-step page navigation.
---

Action fields for form submission and multi-step navigation.

## submit

Renders a submit button that triggers form submission.

```typescript
{
  key: 'submit',
  type: 'submit',
  label: 'Create Account',
  props: {
    color: 'primary',     // adapter-specific
    disabled: false,
  }
}
```

**Core Props:**

- `label`: Button text (also set via top-level `label`)
- `disabled`: Whether the button is disabled

## button

Generic action button for custom event handling.

```typescript
{
  key: 'resetBtn',
  type: 'button',
  label: 'Reset',
  props: {
    onClick: (context) => context.form.reset(),
  }
}
```

**Core Props:**

- `label`: Button text
- `onClick`: Callback invoked when the button is clicked, receives the form context

## next

Advances to the next page in a multi-step form. Only valid inside a `page` container.

```typescript
{
  key: 'nextBtn',
  type: 'next',
  label: 'Continue',
}
```

> This field type only makes sense inside a [Form Pages](/prebuilt/form-pages) container. It is ignored at the root level.

## previous

Navigates back to the previous page in a multi-step form. Only valid inside a `page` container.

```typescript
{
  key: 'prevBtn',
  type: 'previous',
  label: 'Back',
}
```

> This field type only makes sense inside a [Form Pages](/prebuilt/form-pages) container. It is ignored at the root level.
