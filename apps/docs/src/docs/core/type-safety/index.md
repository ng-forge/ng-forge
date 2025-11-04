# Type Safety & Inference

ng-forge provides compile-time type inference for form configurations, eliminating manual type definitions and catching errors before runtime.

## Basic Type Inference

Use `as const` with `FormConfig` to enable type inference:

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const formConfig = {
  fields: [
    { key: 'firstName', type: 'input' },
    { key: 'email', type: 'input' },
    { key: 'age', type: 'input', props: { type: 'number' } },
    { key: 'newsletter', type: 'checkbox' },
  ],
} as const satisfies FormConfig;

// Type is automatically inferred:
// { firstName: string; email: string; age: string; newsletter: boolean }
```

## Type Mapping

Field types map to TypeScript types via the `FieldTypeMap`:

```typescript
interface FieldTypeMap {
  input: string;
  select: string;
  checkbox: boolean;
  radio: string;
  textarea: string;
  datepicker: Date; // UI integration required
  slider: number; // UI integration required
  toggle: boolean; // UI integration required
}
```

## Nested Types

Dot notation keys create nested object structures:

```typescript
const config = {
  fields: [
    { key: 'user.name', type: 'input' },
    { key: 'user.email', type: 'input' },
    { key: 'settings.theme', type: 'select' },
    { key: 'settings.notifications', type: 'checkbox' },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   user: { name: string; email: string };
//   settings: { theme: string; notifications: boolean };
// }
```

## IntelliSense Support

TypeScript provides autocomplete for form values:

```typescript
import { signal } from '@angular/core';

@Component({...})
export class UserFormComponent {
  formValue = signal({});

  config = {
    fields: [
      { key: 'username', type: 'input' },
      { key: 'age', type: 'input', props: { type: 'number' } },
    ]
  } as const satisfies FormConfig;

  onSubmit() {
    const value = this.formValue();
    // IntelliSense suggests: username, age
    console.log(value.username);  // ✓ Type: string
    console.log(value.age);       // ✓ Type: string
    console.log(value.invalid);   // ✗ TypeScript error
  }
}
```

## Custom Field Types

Extend `FieldTypeMap` for custom types using module augmentation:

```typescript
// custom-fields.d.ts
declare module '@ng-forge/dynamic-form' {
  interface FieldTypeMap {
    'color-picker': string;
    'file-upload': File[];
    'rich-editor': string;
  }
}
```

Usage:

```typescript
const config = {
  fields: [
    { key: 'avatar', type: 'file-upload' },
    { key: 'brandColor', type: 'color-picker' },
  ],
} as const satisfies FormConfig;

// Inferred type:
// { avatar: File[]; brandColor: string }
```

## Array Fields

Multi-select fields return arrays:

```typescript
const config = {
  fields: [
    {
      key: 'skills',
      type: 'select',
      props: { multiple: true },
      options: [
        { value: 'js', label: 'JavaScript' },
        { value: 'ts', label: 'TypeScript' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type: { skills: string[] }
```

## Type Guards

Use type guards for runtime type safety:

```typescript
function isValidUserForm(value: unknown): value is { username: string; age: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'username' in value &&
    typeof value.username === 'string' &&
    'age' in value &&
    typeof value.age === 'string'
  );
}

onSubmit(value: unknown) {
  if (isValidUserForm(value)) {
    // value is now typed
    console.log(value.username);
  }
}
```

## Type-Safe Validation

Validators integrate with the type system:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      required: true,
      email: true,
      minLength: 5,
    },
  ],
} as const satisfies FormConfig;
```

See [Validation](../validation) for validator details.

## Best Practices

**Use `as const satisfies FormConfig`:**

```typescript
// ✓ Enables inference + type checking
const config = { fields: [...] } as const satisfies FormConfig;

// ✗ No inference
const config = { fields: [...] };
```

**Define configs as constants:**

```typescript
// form-configs.ts
export const USER_FORM = {
  fields: [
    { key: 'name', type: 'input' },
    { key: 'email', type: 'input' },
  ],
} as const satisfies FormConfig;
```

**Extract types when needed:**

```typescript
type UserFormValue = typeof USER_FORM extends { fields: readonly any[] } ? InferFormValue<typeof USER_FORM> : never;
```

## Troubleshooting

**Type resolves to `never` or `unknown`:**

- Verify `as const` is used
- Check all field types exist in `FieldTypeMap`
- Ensure TypeScript 5.0+

**IntelliSense not working:**

- Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
- Check `fields` is readonly array
- Verify no circular type references
