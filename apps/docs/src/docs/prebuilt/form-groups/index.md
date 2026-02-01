Groups nest form fields under a single key in the form value. This creates logical grouping for form data, not visual grouping.

## Interactive Demo

<iframe src="http://localhost:4201/#/examples/group" class="example-frame" title="Group Field Demo"></iframe>

## Basic Group

```typescript
{
  type: 'group',
  key: 'address',
  fields: [
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'zip', type: 'input', label: 'ZIP', value: '' },
  ],
}
```

This creates a nested structure in the form value:

```typescript
{
  address: {
    street: '',
    city: '',
    zip: ''
  }
}
```

Groups are for organizing form **data**, not UI. The visual presentation depends on your UI integration (Material, Bootstrap, etc.).

## Complete Example

Here's a complete working example of a group field with validation:

```typescript
import { Component } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-user-profile-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="formConfig"></form>`,
})
export class UserProfileFormComponent {
  formConfig = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        value: '',
        required: true,
      },
      {
        key: 'address',
        type: 'group',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            value: '',
            required: true,
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            value: '',
            required: true,
          },
          {
            key: 'state',
            type: 'input',
            label: 'State',
            value: '',
            required: true,
            maxLength: 2,
          },
          {
            key: 'zip',
            type: 'input',
            label: 'ZIP Code',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
          },
        ],
      },
    ],
  };
}
```

This produces a form value with nested structure:

```typescript
{
  name: 'John Doe',
  address: {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701'
  }
}
```

## Nesting Restrictions

Group fields can be used within:

- Pages (top-level container)
- Rows (for horizontal layouts)
- Array fields (for creating object arrays where each array item is an object)

Groups **cannot** be nested inside:

- Other group fields (no nested groups)

## Allowed Children

Groups can contain:

- Leaf fields (input, select, checkbox, etc.)
- Row fields (for horizontal layouts within the group)

See [Type Safety & Inference](../advanced/type-safety/basics) for details on how groups affect type inference.
