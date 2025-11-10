Complete type inference for form configurations using TypeScript's type system and Angular signal forms.

## Overview

ng-forge provides compile-time type inference for form configurations, eliminating manual type definitions and catching errors before runtime. All form values are automatically inferred from your configuration using TypeScript's advanced type features.

## Basic Type Inference

Use `as const satisfies FormConfig` to enable type inference:

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

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
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
    // other providers
  ],
};
```

Material fields augment the `FieldRegistryLeaves` interface for type safety:

```typescript
// From @ng-forge/dynamic-form-material (already included)
declare module '@ng-forge/dynamic-form' {
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
import { InferFormValue } from '@ng-forge/dynamic-form';

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
import { InferFormValue } from '@ng-forge/dynamic-form';

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

## Related

- **[Container Fields & Nesting](../containers/)** - Groups, rows, pages, and nesting rules
- **[Custom Types](../custom-types/)** - Extending the type system with custom fields
- **[Validation](../../validation/basics/)** - How validators affect inferred types
- **[Field Types](../../field-types/)** - Understanding available field types
