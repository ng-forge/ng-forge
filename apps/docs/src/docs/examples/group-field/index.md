A practical example demonstrating group fields for creating nested object structures in form data.

## Interactive Example

{{ NgDocActions.demo("GroupFieldDemoComponent") }}

## Features Demonstrated

- **Nested Structure**: Address fields grouped under a single object key
- **Validation**: Required fields, maxLength, and pattern validation
- **Object Grouping**: Fields organized into a nested object structure

## Key Concepts

### Group Field Definition

```typescript
{
  key: 'address',
  type: 'group',
  fields: [
    // Child fields nested under the 'address' key
    { key: 'street', type: 'input', ... },
    { key: 'city', type: 'input', ... },
    { key: 'state', type: 'input', ... },
    { key: 'zip', type: 'input', ... },
  ],
}
```

### Form Output Structure

The form value creates a nested object:

```json
{
  "name": "John Doe",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  }
}
```

See the [Group Field documentation](../../prebuilt/form-groups) for more details.
