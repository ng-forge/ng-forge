Container fields that structure and nest other fields.

## group

Nested object — groups fields under a shared key.

```typescript
{
  key: 'address',
  type: 'group',
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' },
    { key: 'zip', type: 'input', label: 'ZIP' },
  ],
}
```

Value shape: `{ address: { street: string, city: string, zip: string } }`

<docs-live-example scenario="examples/group"></docs-live-example>

## row

Horizontal layout — places fields side by side.

```typescript
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name' },
    { key: 'lastName', type: 'input', label: 'Last Name' },
  ],
}
```

Rows don't add a key — their child fields merge directly into the parent form value.

<docs-live-example scenario="examples/row"></docs-live-example>

## array

Repeatable field groups — users can add/remove instances.

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'email', type: 'input', label: 'Email' },
  ],
}
```

Value shape: `{ contacts: Array<{ name: string, email: string }> }`

<docs-live-example scenario="examples/array"></docs-live-example>

## page

Multi-step wizard — each page is a step with its own set of fields.

```typescript
{
  fields: [
    {
      type: 'page',
      key: 'personal',
      label: 'Personal Info',
      fields: [...],
    },
    {
      type: 'page',
      key: 'payment',
      label: 'Payment',
      fields: [...],
    },
  ],
}
```

<docs-live-example scenario="examples/paginated-form"></docs-live-example>
