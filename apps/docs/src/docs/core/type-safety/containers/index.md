Understanding how container fields affect type inference and form value structure.

## Container Fields Overview

Container fields organize form layout and structure without directly contributing values. There are three types:

- **Group Fields** - Nest children under a single key
- **Row Fields** - Organize fields horizontally, flatten children to parent level
- **Page Fields** - Multi-step forms, flatten children to parent level

Each container type has different behavior for type inference and form values.

## Group Fields

Groups nest children under a single key, creating nested objects in the form value:

```typescript
const config = {
  fields: [
    {
      type: 'group',
      key: 'address',
      label: 'Address Information',
      fields: [
        { key: 'street', type: 'input', value: '' },
        { key: 'city', type: 'input', value: '' },
        { key: 'zip', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   address: {
//     street?: string;
//     city?: string;
//     zip?: string;
//   }
// }
```

**Use groups when:**

- You want nested form values (e.g., `address.street`)
- Grouping related fields logically
- Creating reusable field sections

**Example - Nested address:**

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '', required: true },
    {
      type: 'group',
      key: 'address',
      fields: [
        { key: 'street', type: 'input', value: '', required: true },
        { key: 'city', type: 'input', value: '', required: true },
        { key: 'state', type: 'select', value: '', required: true, options: [] },
        { key: 'zip', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Form value structure:
// {
//   name: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zip?: string;
//   }
// }

function onSubmit(value: InferFormValue<typeof config.fields>) {
  console.log(value.name); // string
  console.log(value.address.street); // string
  console.log(value.address.city); // string
  console.log(value.address.zip); // string | undefined
}
```

## Row Fields

Rows organize fields horizontally for layout purposes, but flatten children to the parent level in form values:

```typescript
const config = {
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', value: '' },
        { key: 'lastName', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type (flattened):
// {
//   firstName?: string;
//   lastName?: string;
// }
```

**Use rows when:**

- You want horizontal layout (grid columns)
- Fields should be at the parent level (not nested)
- Creating responsive multi-column forms

**Example - Two-column layout:**

```typescript
const config = {
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', value: '', col: 6 },
        { key: 'lastName', type: 'input', value: '', col: 6 },
      ],
    },
    {
      type: 'row',
      fields: [
        { key: 'email', type: 'input', value: '', col: 6 },
        { key: 'phone', type: 'input', value: '', col: 6 },
      ],
    },
  ],
} as const satisfies FormConfig;

// Form value structure (all fields flattened):
// {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
// }
```

**Row vs Group:**

```typescript
// Row - fields are flattened
{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'lastName', type: 'input', value: '' },
  ],
}
// Result: { firstName?: string, lastName?: string }

// Group - fields are nested
{
  type: 'group',
  key: 'name',
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'lastName', type: 'input', value: '' },
  ],
}
// Result: { name: { firstName?: string, lastName?: string } }
```

## Page Fields

Pages organize multi-step forms, flattening all children to the root level:

```typescript
const config = {
  fields: [
    {
      type: 'page',
      title: 'Personal Information',
      fields: [
        { key: 'email', type: 'input', value: '' },
        { key: 'password', type: 'input', value: '' },
      ],
    },
    {
      type: 'page',
      title: 'Profile Details',
      fields: [
        { key: 'firstName', type: 'input', value: '' },
        { key: 'lastName', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type (all pages flattened):
// {
//   email?: string;
//   password?: string;
//   firstName?: string;
//   lastName?: string;
// }
```

**Use pages when:**

- Creating multi-step forms (wizard-style)
- Fields from all steps should be at root level
- You want step-by-step validation

**Example - Registration wizard:**

```typescript
const config = {
  fields: [
    {
      type: 'page',
      title: 'Account',
      fields: [
        { key: 'username', type: 'input', value: '', required: true },
        { key: 'email', type: 'input', value: '', required: true },
        { key: 'password', type: 'input', value: '', required: true },
        { type: 'next', label: 'Continue' },
      ],
    },
    {
      type: 'page',
      title: 'Profile',
      fields: [
        { key: 'firstName', type: 'input', value: '', required: true },
        { key: 'lastName', type: 'input', value: '', required: true },
        { type: 'previous', label: 'Back' },
        { type: 'submit', label: 'Complete' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Form value structure (all fields from both pages):
// {
//   username: string;
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
// }
```

## Nesting Rules

Container fields enforce nesting constraints at compile-time to prevent invalid structures:

### Valid Nesting

- **Pages** can contain: rows, groups, leaf fields (not other pages)
- **Rows** can contain: groups, leaf fields (not pages or rows)
- **Groups** can contain: rows, groups, leaf fields (not pages)

```typescript
// ✓ Valid nesting
const validConfig = {
  fields: [
    {
      type: 'page',
      fields: [
        {
          type: 'row',
          fields: [
            { key: 'field1', type: 'input', value: '' },
            { key: 'field2', type: 'input', value: '' },
          ],
        },
        {
          type: 'group',
          key: 'section',
          fields: [{ key: 'field3', type: 'input', value: '' }],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Invalid Nesting

TypeScript will prevent these invalid structures:

```typescript
// ✗ Invalid: page inside page
const config1 = {
  fields: [
    {
      type: 'page',
      fields: [
        { type: 'page', fields: [] }, // TypeScript error!
      ],
    },
  ],
} as const satisfies FormConfig;

// ✗ Invalid: row inside row
const config2 = {
  fields: [
    {
      type: 'row',
      fields: [
        { type: 'row', fields: [] }, // TypeScript error!
      ],
    },
  ],
} as const satisfies FormConfig;

// ✗ Invalid: page inside row
const config3 = {
  fields: [
    {
      type: 'row',
      fields: [
        { type: 'page', fields: [] }, // TypeScript error!
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Deep Nesting Example

Groups can contain rows, which can contain groups:

```typescript
const config = {
  fields: [
    {
      type: 'group',
      key: 'personalInfo',
      fields: [
        {
          type: 'row',
          fields: [
            { key: 'firstName', type: 'input', value: '', col: 6 },
            { key: 'lastName', type: 'input', value: '', col: 6 },
          ],
        },
        {
          type: 'group',
          key: 'contact',
          fields: [
            { key: 'email', type: 'input', value: '' },
            { key: 'phone', type: 'input', value: '' },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

// Form value structure:
// {
//   personalInfo: {
//     firstName?: string;    // From row (flattened)
//     lastName?: string;     // From row (flattened)
//     contact: {             // From group (nested)
//       email?: string;
//       phone?: string;
//     }
//   }
// }
```

## Value-Bearing vs Display Fields

Fields are categorized by whether they contribute to form values:

### Value-Bearing Fields

Fields with a `value` property contribute to the form output:

- `input`, `select`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, etc.

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '' }, // ✓ Included
    { key: 'country', type: 'select', value: '', options: [] }, // ✓ Included
    { key: 'accept', type: 'checkbox', value: false }, // ✓ Included
  ],
} as const satisfies FormConfig;

// All fields included: { name?: string; country?: string; accept?: boolean }
```

### Display-Only Fields

Fields without values are excluded from form values:

- `text` - displays content
- `page`, `row`, `group` - container fields (children may have values)
- Buttons - `submit`, `reset`, navigation buttons
- Custom display components

```typescript
const config = {
  fields: [
    { type: 'text', label: 'Enter your details:' }, // ✗ Excluded
    { key: 'name', type: 'input', value: '' }, // ✓ Included
    { type: 'submit', label: 'Save' }, // ✗ Excluded
    {
      type: 'row', // ✗ Excluded (container)
      fields: [
        { key: 'city', type: 'input', value: '' }, // ✓ Included
      ],
    },
  ],
} as const satisfies FormConfig;

// Only value-bearing fields:
// {
//   name?: string;
//   city?: string;
// }
```

## Array Fields

Multi-select fields and multi-checkbox fields return arrays:

### Multi-Select

```typescript
const config = {
  fields: [
    {
      key: 'skills',
      type: 'select',
      value: [],
      props: { multiple: true },
      options: [
        { value: 'js', label: 'JavaScript' },
        { value: 'ts', label: 'TypeScript' },
        { value: 'go', label: 'Go' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type: { skills?: string[] }
```

### Multi-Checkbox

```typescript
const config = {
  fields: [
    {
      key: 'interests',
      type: 'multi-checkbox',
      value: [],
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type: { interests?: string[] }
```

### Complete Example

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '', required: true },
    {
      key: 'skills',
      type: 'select',
      value: [],
      required: true,
      props: { multiple: true },
      options: [
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
        { value: 'devops', label: 'DevOps' },
      ],
    },
    {
      key: 'notifications',
      type: 'multi-checkbox',
      value: [],
      options: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   name: string;
//   skills: string[];         // Required array (never undefined)
//   notifications?: string[]; // Optional array
// }

function onSubmit(value: InferFormValue<typeof config.fields>) {
  console.log(value.skills.length); // ✓ Safe - always defined
  console.log(value.notifications?.length); // ✓ Must use optional chaining
}
```

## Best Practices

### Use Groups for Nested Data

```typescript
// ✓ Good - semantic nesting matches data structure
const config = {
  fields: [
    {
      type: 'group',
      key: 'address',
      fields: [
        { key: 'street', type: 'input', value: '' },
        { key: 'city', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;
// Result: { address: { street?: string, city?: string } }
```

### Use Rows for Layout Only

```typescript
// ✓ Good - row for horizontal layout, fields stay flat
const config = {
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', value: '', col: 6 },
        { key: 'lastName', type: 'input', value: '', col: 6 },
      ],
    },
  ],
} as const satisfies FormConfig;
// Result: { firstName?: string, lastName?: string }
```

### Combine Containers Appropriately

```typescript
// ✓ Good - use both groups and rows together
const config = {
  fields: [
    {
      type: 'group',
      key: 'billing',
      fields: [
        {
          type: 'row',
          fields: [
            { key: 'cardNumber', type: 'input', value: '', col: 8 },
            { key: 'cvv', type: 'input', value: '', col: 4 },
          ],
        },
        {
          type: 'row',
          fields: [
            { key: 'expiry', type: 'input', value: '', col: 6 },
            { key: 'zip', type: 'input', value: '', col: 6 },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

// Result:
// {
//   billing: {
//     cardNumber?: string,
//     cvv?: string,
//     expiry?: string,
//     zip?: string
//   }
// }
```

## Related

- **[Type Safety Basics](../basics/)** - Getting started with type inference
- **[Custom Types](../custom-types/)** - Creating custom field types
- **[Form Layout](../../../prebuilt/)** - Visual guide to container fields
- **[Validation](../../validation/basics/)** - Validating nested fields
