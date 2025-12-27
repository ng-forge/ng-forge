Hidden fields store values in the form model without rendering any visible UI. They're useful for persisting IDs, metadata, or other non-user-facing data that should be included in form submissions.

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

### Scalar Values

```typescript
// String
{ type: 'hidden', key: 'sessionId', value: 'abc123' }

// Number
{ type: 'hidden', key: 'version', value: 42 }

// Boolean
{ type: 'hidden', key: 'isActive', value: true }
```

### Array Values

```typescript
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

### Persisting IDs for Updates

When editing existing records, include the record ID as a hidden field:

```typescript
{
  type: 'hidden',
  key: 'id',
  value: existingRecord.id,
}
```

### Tracking Form Metadata

Include metadata like version numbers for optimistic concurrency:

```typescript
{
  type: 'hidden',
  key: 'version',
  value: existingRecord.version,
}
```

### Passing Context Data

Include context that should be submitted but not displayed:

```typescript
{
  type: 'hidden',
  key: 'sourceId',
  value: parentRecord.id,
}
```

## Technical Details

### Componentless Architecture

Hidden fields are "componentless" - they have no associated Angular component and render nothing to the DOM. This is different from CSS-hidden elements; hidden fields produce zero DOM footprint.

### Value Handling

Hidden fields use `valueHandling: 'include'`, meaning their values are always included in the form's value object. The `value` property is required.

### Type Safety

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

### Type Guard

Use the `isHiddenField` type guard to check field types at runtime:

```typescript
import { isHiddenField } from '@ng-forge/dynamic-forms';

if (isHiddenField(field)) {
  console.log(field.value); // Type-safe access to value
}
```

## Placement

Hidden fields can be placed:

- At the top level of a form
- Inside page fields
- Inside row fields
- Inside group fields

Since they render nothing, their position in the field array only affects their order in the form value object.
