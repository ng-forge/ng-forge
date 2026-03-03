Non-input fields for display, form submission, and hidden data.

## text

Display-only content — renders as an HTML element, not a form control.

```typescript
{
  key: 'instructions',
  type: 'text',
  label: 'Please fill out all required fields',
  props: {
    elementType: 'p',  // 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'
  },
}
```

**Core Props:**

- `elementType`: HTML element to render (`'p'` | `'h1'` – `'h6'` | `'span'`)

**Note:** Text fields display the `label` content and have no `value`.

## hidden

Hidden field — carries a value through the form without rendering any UI.

```typescript
{
  key: 'userId',
  type: 'hidden',
  value: '123',
}
```

The `value` property is **required** for hidden fields. The field does not render any visible element.

## submit

Form submission button.

```typescript
{
  key: 'submit',
  type: 'submit',
  label: 'Save Changes',
  props: {
    color: 'primary',  // UI-integration specific
  },
}
```

## Props vs Meta

When configuring fields there are two distinct ways to customize behavior.

### Props (Component Properties)

`props` are **UI library-specific configuration** passed to the field component.

```typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  props: {
    appearance: 'outline',  // Material-specific
    filter: true,           // PrimeNG-specific
    showClear: true,
  },
}
```

### Meta (Native Element Attributes)

`meta` contains **native HTML attributes** applied to the underlying DOM element.

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  meta: {
    autocomplete: 'email',
    inputmode: 'email',
    'data-testid': 'registration-email',
    'aria-describedby': 'email-help',
  },
}
```

| Use Case                              | `props` | `meta` |
| ------------------------------------- | ------- | ------ |
| UI appearance (size, variant)         | ✅      | ❌     |
| Component behavior (multiple, filter) | ✅      | ❌     |
| Browser autofill (`autocomplete`)     | ❌      | ✅     |
| Testing IDs (`data-testid`)           | ❌      | ✅     |
| Accessibility (`aria-*`)              | ❌      | ✅     |
