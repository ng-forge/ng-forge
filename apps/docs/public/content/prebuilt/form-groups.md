---
title: Form Groups
slug: prebuilt/form-groups
description: 'Learn how to nest form fields under a single key using group fields, creating logical data grouping in your dynamic form configuration.'
---

Groups nest form fields under a single key in the form value. This creates logical grouping for form data, not visual grouping.

## Interactive Demo

<docs-live-example scenario="examples/group"></docs-live-example>

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

See [Type Safety & Inference](/advanced/basics) for details on how groups affect type inference.

## Conditional Visibility

Group containers support the `logic` property to conditionally show or hide the entire group (and all its nested fields) based on form state.

```typescript
{
  key: 'addressGroup',
  type: 'group',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'sameAsBilling',
      operator: 'equals',
      value: true,
    },
  }],
  fields: [
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'zip', type: 'input', label: 'ZIP', value: '' },
  ],
}
```

When the group is hidden, all its nested fields are hidden with it. Only `'hidden'` is supported as a logic type on containers (not `required`, `readonly`, or `disabled`).

For all available condition types and operators, see [Conditional Logic](/dynamic-behavior/overview).

## Next Steps

- **[Form Rows](/prebuilt/form-rows)** — Arrange fields side-by-side in horizontal layouts
- **[Form Pages](/prebuilt/form-pages)** — Build multi-step wizard forms with page navigation
- **[Form Arrays](/prebuilt/form-arrays/simplified)** — Create repeating sections with dynamic add/remove
