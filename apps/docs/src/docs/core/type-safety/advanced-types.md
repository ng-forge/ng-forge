---
title: Advanced Types
route: advanced-types
keyword: TypeSafetyAdvancedTypesPage
---

Runtime validation and type-safe validation integration patterns.

## Runtime Validation

Form values are typed at compile-time via `InferFormValue`, but runtime validation may be needed:

### Type Assertion (Trust Form Structure)

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

### Runtime Validation with Zod

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

### Combining Compile-Time and Runtime

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

## Type-Safe Validation

ng-forge integrates validation with the type system. Validators affect the inferred type:

### Shorthand Validators

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

### Validator Array

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

### Conditional Required

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

For more details, see [Validation](../../validation/basics/).

## Related

- **[Type Safety Basics](../basics/)** - Foundation of type inference
- **[Container Fields](../containers/)** - Understanding containers
- **[Validation](../../validation/basics/)** - Type-safe validation
