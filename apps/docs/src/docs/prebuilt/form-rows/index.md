Organize fields into horizontal rows for compact layouts. Rows display fields side-by-side.

## Interactive Demo

<iframe src="http://localhost:4201/#/examples/row" class="example-frame" title="Row Field Demo"></iframe>

## Basic Row

```typescript
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', value: '', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last Name', value: '', col: 6 },
  ],
}
```

Rows flatten their children - they don't add nesting to form values. Use the `col` property to control field widths (see Column Sizing below).

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

## Complete Example

Here's a complete working example of a row field with multiple fields:

```typescript
import { Component } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-address-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="formConfig"></form>
    >`,
})
export class AddressFormComponent {
  formConfig = {
    fields: [
      {
        type: 'row',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            value: '',
            required: true,
            col: 6,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            value: '',
            required: true,
            col: 6,
          },
        ],
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        value: '',
        required: true,
        email: true,
      },
      {
        type: 'row',
        fields: [
          {
            key: 'city',
            type: 'input',
            label: 'City',
            value: '',
            required: true,
            col: 6,
          },
          {
            key: 'state',
            type: 'input',
            label: 'State',
            value: '',
            required: true,
            maxLength: 2,
            col: 3,
          },
          {
            key: 'zip',
            type: 'input',
            label: 'ZIP',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
            col: 3,
          },
        ],
      },
    ],
  };
}
```

This produces a flat form value (rows don't create nesting):

```typescript
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
}
```

## Value Structure

Rows are layout containers - they don't add nesting to your form values. Fields flatten to the root level:

```typescript
// Form config with rows
{
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', value: '', col: 6 },
        { key: 'lastName', type: 'input', value: '', col: 6 },
      ],
    },
  ];
}

// Resulting form value (flat structure)
{
  firstName: 'John',
  lastName: 'Doe',
  // Note: row itself is NOT in the value
}
```

## Nesting Restrictions

Row fields can be used within:

- Pages (top-level container)
- Groups (for layouts within grouped data)
- Arrays (for layouts within array items)

Rows **cannot** be nested inside:

- Other row fields

## Allowed Children

Rows can contain:

- Leaf fields (input, select, checkbox, etc.)
- Group fields (for nested data structures within the row)
- Array fields (for repeating sections within the row)
