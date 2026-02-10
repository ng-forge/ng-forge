Hidden fields store values in the form model without rendering any visible UI. They're useful for persisting IDs, metadata, or other non-user-facing data.

## Basic Usage

```typescript
{
  type: 'hidden',
  key: 'id',
  value: 'uuid-550e8400-e29b-41d4-a716-446655440000',
}
```

This adds `id` to the form value without rendering anything:

```typescript
{
  id: 'uuid-550e8400-e29b-41d4-a716-446655440000',
  // ... other fields
}
```

## Supported Value Types

Hidden fields support scalar values and arrays of scalars:

```typescript
// String
{ type: 'hidden', key: 'sessionId', value: 'abc123' }

// Number
{ type: 'hidden', key: 'version', value: 42 }

// Boolean
{ type: 'hidden', key: 'isActive', value: true }

// String array
{ type: 'hidden', key: 'tags', value: ['draft', 'review'] }

// Number array
{ type: 'hidden', key: 'tagIds', value: [1, 2, 3] }

// Boolean array
{ type: 'hidden', key: 'flags', value: [true, false, true] }
```

## Complete Example

Here's a form that uses hidden fields to persist metadata during an update operation:

```typescript
import { Component } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-edit-user-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="formConfig"></form>`,
})
export class EditUserFormComponent {
  formConfig = {
    fields: [
      // Hidden fields for metadata
      {
        type: 'hidden',
        key: 'id',
        value: 'user-123',
      },
      {
        type: 'hidden',
        key: 'version',
        value: 3,
      },
      {
        type: 'hidden',
        key: 'roles',
        value: ['admin', 'editor'],
      },
      // Visible fields
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        value: 'John Doe',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: 'john@example.com',
        required: true,
        props: { type: 'email' },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Save Changes',
      },
    ],
  };
}
```

Form value on submission:

```typescript
{
  id: 'user-123',
  version: 3,
  roles: ['admin', 'editor'],
  name: 'John Doe',
  email: 'john@example.com'
}
```

## Use Cases

- Persisting record IDs for update operations
- Tracking version numbers for optimistic concurrency
- Passing context data (parent IDs, source references)
- Storing computed values that shouldn't be user-editable
- Including metadata in form submissions

## Placement

Hidden fields can be placed:

- At the top level of a form
- Inside page fields
- Inside group fields

**Note:** Placing hidden fields inside row fields will generate a validation warning. Rows are meant for horizontal layouts, and since hidden fields don't render anything, placing them in rows serves no purpose. Place hidden fields outside of rows instead.

## Type Safety

Hidden fields are fully type-safe:

```typescript
import { HiddenField } from '@ng-forge/dynamic-forms';

// Typed hidden field
const idField: HiddenField<string> = {
  type: 'hidden',
  key: 'id',
  value: 'abc123',
};

// Array type
const tagsField: HiddenField<number[]> = {
  type: 'hidden',
  key: 'tagIds',
  value: [1, 2, 3],
};
```

Use the `isHiddenField` type guard to check field types at runtime:

```typescript
import { isHiddenField } from '@ng-forge/dynamic-forms';

if (isHiddenField(field)) {
  console.log(field.value); // Type-safe access to value
}
```

## Value Exclusion

The `HiddenField` type (`type: 'hidden'`) is **not affected** by value exclusion. Hidden fields:

- Have no reactive `hidden()` state (they don't render a component)
- Are always included in submission output, regardless of `excludeValueIfHidden` settings

This is different from regular fields with `hidden: true` or fields hidden via conditional logic. Those fields have a reactive `hidden()` state that value exclusion checks.

See the **Value Exclusion** page under Recipes for full details.

## Technical Details

- **Componentless**: Hidden fields have no Angular component and render zero DOM elements
- **Value handling**: Uses `valueHandling: 'include'`, so values are always included in form submissions
- **Required value**: The `value` property is required (unlike most field types where it's optional)
