# Form Rows

Organize fields into horizontal rows for compact layouts.

## Basic Row

Display multiple fields side-by-side:

```typescript
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name' },
    { key: 'lastName', type: 'input', label: 'Last Name' },
  ],
}
```

## Responsive Rows

Rows automatically stack on small screens.

## Custom Widths

Control field widths within rows:

```typescript
{
  type: 'row',
  fields: [
    { key: 'city', type: 'input', label: 'City', width: '60%' },
    { key: 'state', type: 'select', label: 'State', width: '20%' },
    { key: 'zip', type: 'input', label: 'ZIP', width: '20%' },
  ],
}
```

## Nested Rows

Combine rows with other field types:

```typescript
{
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'street', type: 'input', label: 'Street Address' },
      ],
    },
    {
      type: 'row',
      fields: [
        { key: 'city', type: 'input', label: 'City' },
        { key: 'state', type: 'select', label: 'State' },
        { key: 'zip', type: 'input', label: 'ZIP' },
      ],
    },
  ],
}
```

_More examples coming soon_
