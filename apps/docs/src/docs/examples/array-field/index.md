A practical example demonstrating array fields for collecting repeating form data.

## Interactive Example

{{ NgDocActions.demo("ArrayFieldDemoComponent") }}

## Features Demonstrated

- **Array Structure**: Fields organized as array elements
- **Validation**: Required fields and pattern validation for phone numbers
- **Nested Fields**: Multiple fields within each array item
- **Select Options**: Dropdown for relationship selection

## Key Concepts

### Array Field Definition

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [
    // Child fields repeated for each array item
    { key: 'name', type: 'input', ... },
    { key: 'phone', type: 'input', ... },
    { key: 'relationship', type: 'select', ... },
  ],
}
```

### Form Output Structure

The form value creates an array of objects:

```json
{
  "contacts": [
    { "name": "John Doe", "phone": "5551234567", "relationship": "family" },
    { "name": "Jane Smith", "phone": "5559876543", "relationship": "friend" }
  ]
}
```

See the [Array Field documentation](../../prebuilt/form-arrays) for more details.
