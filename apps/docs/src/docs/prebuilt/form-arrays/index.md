Arrays nest form fields as array elements instead of object properties. This creates array-based data structures for repeating form patterns.

## Basic Array

```typescript
{
  type: 'array',
  key: 'phoneNumbers',
  fields: [
    { key: 'number', type: 'input', label: 'Phone Number', value: '' },
    { key: 'type', type: 'select', label: 'Type', value: 'mobile', options: ['mobile', 'home', 'work'] },
  ],
}
```

This creates an array structure in the form value:

```typescript
{
  phoneNumbers: [
    { number: '', type: 'mobile' },
    { number: '', type: 'mobile' },
  ];
}
```

## Array vs Group

- **Groups** create nested objects with keys: `{ address: { street: '', city: '' } }`
- **Arrays** create ordered lists: `{ items: ['value1', 'value2', ...] }`

## Use Cases

Arrays are ideal for:

- Repeating form sections (multiple addresses, phone numbers)
- Dynamic lists where order matters
- Collection-based data structures

## Example: Multiple Addresses

```typescript
{
  type: 'array',
  key: 'addresses',
  fields: [
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'zip', type: 'input', label: 'ZIP', value: '' },
    { key: 'isPrimary', type: 'checkbox', label: 'Primary Address', value: false },
  ],
}
```

Result:

```typescript
{
  addresses: [
    { street: '123 Main St', city: 'New York', zip: '10001', isPrimary: true },
    { street: '456 Oak Ave', city: 'Boston', zip: '02101', isPrimary: false },
  ];
}
```

Arrays are for organizing form **data** in sequential order, not UI. The visual presentation depends on your UI integration (Material, Bootstrap, etc.).

See [Type Safety & Inference](../core/type-safety) for details on how arrays affect type inference.
