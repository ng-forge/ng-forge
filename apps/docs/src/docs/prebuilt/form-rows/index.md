Organize fields into horizontal rows for compact layouts. Rows display fields side-by-side.

## Basic Row

```typescript
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', value: '' },
    { key: 'lastName', type: 'input', label: 'Last Name', value: '' },
  ],
}
```

Rows flatten their children - they don't add nesting to form values.

## Column Sizing

Control field widths within rows using the `col` property:

```typescript
{
  type: 'row',
  fields: [
    { key: 'city', type: 'input', label: 'City', value: '', col: 6 },
    { key: 'state', type: 'select', label: 'State', value: '', col: 3 },
    { key: 'zip', type: 'input', label: 'ZIP', value: '', col: 3 },
  ],
}
```

The `col` property uses a 12-column grid system (like Bootstrap). In this example:

- `city` takes 6/12 (50%) width
- `state` takes 3/12 (25%) width
- `zip` takes 3/12 (25%) width

## Responsive Behavior

Rows automatically stack on small screens, making forms mobile-friendly without additional configuration.
