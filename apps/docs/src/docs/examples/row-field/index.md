A practical example demonstrating row fields for creating horizontal layouts in forms.

## Interactive Example

{{ NgDocActions.demo("RowFieldDemoComponent") }}

## Features Demonstrated

- **Horizontal Layout**: Fields displayed side-by-side in rows
- **Column Sizing**: Using the 12-column grid system with `col` property
- **Flat Structure**: Row fields don't add nesting to form values
- **Responsive Design**: Automatically stacks on small screens

## Key Concepts

### Row Field Definition

```typescript
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', col: 6, ... },
    { key: 'lastName', type: 'input', col: 6, ... },
  ],
}
```

### Form Output Structure

The form value remains flat (no nesting from rows):

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "city": "Springfield",
  "state": "IL",
  "zip": "62701"
}
```

Note: The row structure is purely for layout - it doesn't affect the form data structure.

See the [Row Field documentation](../../prebuilt/form-rows) for more details.
