Complete type inference for form configurations using TypeScript's type system and Angular signal forms.

## Overview

Dynamic Forms provides compile-time type inference for form configurations, eliminating manual type definitions and catching errors before runtime. All form values are automatically inferred from your configuration using TypeScript's advanced type features.

## Basic Type Inference

Use `as const satisfies FormConfig` to enable type inference:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'email', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'newsletter', type: 'checkbox', value: false },
  ],
} as const satisfies FormConfig;

// Type is automatically inferred based on value property:
// { firstName?: string; email?: string; age?: number; newsletter?: boolean }
```

**How it works:**

1. `as const` makes the configuration deeply readonly, preserving literal types
2. `satisfies FormConfig` validates the config structure without widening types
3. TypeScript infers the form value type from the `value` properties

## The `value` Property

The `value` property is critical for type inference - its type determines the inferred field type:

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '' }, // string
    { key: 'age', type: 'input', value: 0 }, // number
    { key: 'active', type: 'checkbox', value: false }, // boolean
    { key: 'tags', type: 'multi-checkbox', value: [] }, // string[]
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   name?: string;
//   age?: number;
//   active?: boolean;
//   tags?: string[];
// }
```

## Field Registry System

UI integrations register their field types via `provideDynamicForm`. For example, with Material Design:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
    // other providers
  ],
};
```

Material fields augment the `FieldRegistryLeaves` interface for type safety:

```typescript
// From @ng-forge/dynamic-forms-material (already included)
declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: MatInputField;
    select: MatSelectField<unknown>;
    checkbox: MatCheckboxField;
    // ... other Material fields
  }
}
```

This determines:

- What field `type` values are valid (e.g., `'input'`, `'select'`)
- How each field type is structured
- What props are available for each field

**Example - Wrong field type:**

```typescript
const config = {
  fields: [
    { key: 'name', type: 'invalid', value: '' }, // TypeScript error!
  ],
} as const satisfies FormConfig;
```

## Required vs Optional Fields

The `required` flag affects whether fields include `undefined` in their type:

```typescript
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true }, // string (required)
    { key: 'name', type: 'input', value: '' }, // string | undefined
    { key: 'age', type: 'input', value: 0, required: false }, // number | undefined
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   email: string;           // Required - no undefined
//   name?: string;           // Optional - includes undefined
//   age?: number;            // Optional - includes undefined
// }
```

**In practice:**

```typescript
function handleSubmit(value: InferFormValue<typeof config.fields>) {
  console.log(value.email.toUpperCase()); // ✓ Safe - always defined
  console.log(value.name?.toUpperCase()); // ✓ Must use optional chaining
  console.log(value.age + 1); // ✗ Error - might be undefined
}
```

## Using InferFormValue

Extract the inferred type for use in your component:

```typescript
import { signal } from '@angular/core';
import { InferFormValue } from '@ng-forge/dynamic-forms';

@Component({...})
export class UserFormComponent {
  config = {
    fields: [
      { key: 'username', type: 'input', value: '', required: true },
      { key: 'age', type: 'input', value: 0 },
    ]
  } as const satisfies FormConfig;

  // Extract type for signal
  formValue = signal<InferFormValue<typeof this.config.fields>>({
    username: '',
  });

  onSubmit() {
    const value = this.formValue();
    console.log(value.username);  // ✓ Type: string (required)
    console.log(value.age);       // ✓ Type: number | undefined (optional)
  }
}
```

## IntelliSense Support

TypeScript provides autocomplete for form values throughout your code:

```typescript
const config = {
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'lastName', type: 'input', value: '' },
    { key: 'email', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

type FormValue = InferFormValue<typeof config.fields>;

function processForm(value: FormValue) {
  // IntelliSense suggests: firstName, lastName, email
  value.firstName; // ✓ Autocomplete works
  value.lastName; // ✓ Autocomplete works
  value.email; // ✓ Autocomplete works
  value.invalid; // ✗ TypeScript error - property doesn't exist
}
```

## Best Practices

### Always Use `as const satisfies FormConfig`

This enables type inference and validates your configuration:

```typescript
// ✓ Correct - enables inference + type checking
const config = { fields: [...] } as const satisfies FormConfig;

// ✗ Wrong - no inference
const config = { fields: [...] };

// ✗ Wrong - too wide, loses precision
const config: FormConfig = { fields: [...] };
```

### Define Configs as Constants

Export form configs as constants for reuse and consistent typing:

```typescript
// form-configs.ts
export const USER_FORM = {
  fields: [
    { key: 'name', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

// user-form.component.ts
import { USER_FORM } from './form-configs';

@Component({...})
export class UserFormComponent {
  config = USER_FORM;
}
```

### Always Include `value` Property

Type inference requires the `value` property to determine field types:

```typescript
// ✓ Good - type inferred from value
const config = {
  fields: [
    { key: 'age', type: 'input', value: 0 }, // number
    { key: 'name', type: 'input', value: '' }, // string
    { key: 'active', type: 'checkbox', value: false }, // boolean
  ],
} as const satisfies FormConfig;

// ✗ Bad - without value, type inference may not work correctly
const config = {
  fields: [
    { key: 'age', type: 'input' }, // Type unclear
  ],
} as const satisfies FormConfig;
```

### Extract Types When Needed

Create type aliases for complex form values:

```typescript
import { InferFormValue } from '@ng-forge/dynamic-forms';

const REGISTRATION_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'password', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

// Export type for reuse
export type RegistrationFormValue = InferFormValue<(typeof REGISTRATION_FORM)['fields']>;

// Use in functions
function registerUser(data: RegistrationFormValue) {
  console.log(data.username, data.email, data.password);
}
```

## Troubleshooting

### Type inference not working

Type inference requires `as const` - without it, TypeScript treats your config as mutable:

```typescript
// ✗ No inference - types are too wide
const config = {
  fields: [{ key: 'name', type: 'input', value: '' }],
};
// Type: { fields: { key: string; type: string; value: string }[] }

// ✓ With as const - precise inference
const config = {
  fields: [{ key: 'name', type: 'input', value: '' }],
} as const satisfies FormConfig;
// Type inferred: { name?: string }
```

### `satisfies` vs type annotation

Don't use type annotation (`const config: FormConfig = ...`) as it widens types:

```typescript
// ✗ Wrong - type is widened, inference fails
const config: FormConfig = {
  fields: [{ key: 'name', type: 'input', value: '' }],
} as const;

// ✓ Correct - satisfies validates without widening
const config = {
  fields: [{ key: 'name', type: 'input', value: '' }],
} as const satisfies FormConfig;
```

### Dynamic form configs

Type inference only works for **static**, **compile-time constant** configurations:

```typescript
// ✗ Dynamic - no inference possible
const fields = getFieldsFromAPI(); // Returns field array at runtime
const config = { fields } as const satisfies FormConfig;
// Can't infer - TypeScript doesn't know what getFieldsFromAPI() returns

// For dynamic forms, manually type your form values:
interface MyFormValue {
  name: string;
  email: string;
}

const formValue = signal<MyFormValue>({ name: '', email: '' });
```

If your form configuration is built dynamically (from API data, conditional logic, or runtime calculations), you'll need to manually define the form value type.

## Container Fields

Understanding how container fields affect type inference and form value structure.

### Container Fields Overview

Container fields organize form layout and structure without directly contributing values. There are three types:

- **Group Fields** - Nest children under a single key
- **Row Fields** - Organize fields horizontally, flatten children to parent level
- **Page Fields** - Multi-step forms, flatten children to parent level

Each container type has different behavior for type inference and form values.

### Group Fields

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

### Row Fields

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

### Page Fields

Pages organize multi-step forms, flattening all children to the root level:

```typescript
const config = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'page1Title', type: 'text', label: 'Personal Information', props: { elementType: 'h3' } },
        { key: 'email', type: 'input', value: '' },
        { key: 'password', type: 'input', value: '' },
      ],
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'page2Title', type: 'text', label: 'Profile Details', props: { elementType: 'h3' } },
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

### Nesting Rules

Container fields enforce nesting constraints at compile-time to prevent invalid structures.

**Visual Reference:**

```
┌─────────────────────────────────────────────────────────────┐
│                      NESTING RULES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PAGE ──────┬──► ROW ────────┬──► GROUP ──┬──► LEAF FIELD  │
│             │                │            │                 │
│             ├──► GROUP ──────┼──► ROW ────┴──► LEAF FIELD  │
│             │                │                              │
│             └──► LEAF FIELD  └──► LEAF FIELD               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ✗ PAGE cannot contain PAGE                                 │
│  ✗ ROW cannot contain ROW or PAGE                          │
│  ✗ GROUP cannot contain GROUP or PAGE                      │
└─────────────────────────────────────────────────────────────┘
```

**Valid Nesting:**

- **Pages** can contain: rows, groups, leaf fields (not other pages)
- **Rows** can contain: groups, leaf fields (not pages or rows)
- **Groups** can contain: rows, leaf fields (not pages or other groups)

**Invalid Nesting:**

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
```

### Value-Bearing vs Display Fields

Fields are categorized by whether they contribute to form values:

**Value-Bearing Fields:**

Fields with a `value` property contribute to the form output:

- `input`, `select`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, etc.

**Display-Only Fields:**

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

### Array Fields

Multi-select fields and multi-checkbox fields return arrays:

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

// Type: { skills?: string[]; interests?: string[] }
```

## Advanced Patterns

### Runtime Validation

Form values are typed at compile-time via `InferFormValue`, but runtime validation may be needed:

#### Type Assertion (Trust Form Structure)

If you trust the form structure, cast the value:

```typescript
import { InferFormValue } from '@ng-forge/dynamic-forms';

const USER_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;

type UserFormValue = InferFormValue<(typeof USER_FORM)['fields']>;

function onSubmit(value: unknown) {
  // Cast to inferred type
  const data = value as UserFormValue;

  console.log(data.username); // string
  console.log(data.email); // string
  console.log(data.age); // number | undefined
}
```

#### Runtime Validation with Zod

For runtime guarantees, use a validation library like Zod:

```typescript
import { z } from 'zod';
import { InferFormValue } from '@ng-forge/dynamic-forms';

const USER_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;

// Define Zod schema matching form structure
const userSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional(),
});

function onSubmit(value: unknown) {
  // Runtime validation
  const result = userSchema.safeParse(value);

  if (!result.success) {
    console.error('Validation failed:', result.error);
    return;
  }

  // Type-safe access
  const data = result.data;
  console.log(data.username); // string
  console.log(data.email); // string
  console.log(data.age); // number | undefined
}
```

#### Combining Compile-Time and Runtime

Use both for maximum safety:

```typescript
import { z } from 'zod';
import { InferFormValue } from '@ng-forge/dynamic-forms';

const REGISTRATION_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'password', type: 'input', value: '', required: true },
    { key: 'confirmPassword', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

// Compile-time type
type RegistrationValue = InferFormValue<typeof REGISTRATION_FORM['fields']>;

// Runtime schema (with additional validation)
const registrationSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

@Component({...})
export class RegistrationComponent {
  config = REGISTRATION_FORM;

  // Compile-time type for signal
  formValue = signal<RegistrationValue>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  onSubmit() {
    const value = this.formValue();

    // Runtime validation with cross-field check
    const result = registrationSchema.safeParse(value);

    if (!result.success) {
      console.error('Validation failed:', result.error);
      return;
    }

    // Safe to use
    this.register(result.data);
  }
}
```

### Type-Safe Validation

ng-forge integrates validation with the type system. Validators affect the inferred type:

#### Shorthand Validators

Shorthand validators are simple and affect type inference:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      required: true, // Removes undefined from type
      email: true, // Email validation
      minLength: 5, // Min length validation
    },
  ],
} as const satisfies FormConfig;

// Type inferred: { email: string } (required, so no undefined)
```

#### Validator Array

For complex validation, use the `validators` array:

```typescript
const config = {
  fields: [
    {
      key: 'discount',
      type: 'input',
      value: 0,
      validators: [
        {
          type: 'min',
          value: 0,
        },
        {
          type: 'max',
          value: 100,
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'percentage',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

#### Conditional Required

Use the `logic` array for conditional required fields:

```typescript
const config = {
  fields: [
    { key: 'accountType', type: 'select', value: '', options: [] },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      logic: [
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type: { accountType?: string; taxId?: string }
// Note: Conditional required doesn't affect type inference
```

## Related

- **[Validation](../../validation/basics/)** - How validators affect inferred types
- **[Field Types](../../schema-fields/field-types/)** - Understanding available field types
- **[Form Layout](../../prebuilt/form-groups/)** - Visual guide to container fields
