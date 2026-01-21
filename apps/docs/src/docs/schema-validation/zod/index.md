---
title: Standard Schema (Zod)
keyword: ZodSchemaPage
---

Dynamic Forms supports the [Standard Schema](https://standardschema.dev) specification, enabling validation with Zod, Valibot, ArkType, and other compatible libraries. This approach lets you reuse existing schemas and share validation logic between frontend and backend.

## Installation

Standard Schema support is built into the core library. Install your preferred schema library:

```bash
# Using Zod
npm install zod

# Or Valibot
npm install valibot

# Or ArkType
npm install arktype
```

## Basic Usage

Import the `standardSchema` wrapper from the schema entry point:

```typescript
import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
```

Define your schema and wrap it:

```typescript
const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

const config = {
  schema: standardSchema(passwordSchema),
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      props: { type: 'password' },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      props: { type: 'password' },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Register',
    },
  ],
} as const satisfies FormConfig;
```

## Live Demo

Try the password confirmation form with Zod validation:

{{ NgDocActions.demo("ZodIframeDemoComponent", { container: false }) }}

## Why Standard Schema?

The [Standard Schema spec](https://standardschema.dev) provides a unified interface for schema libraries. Benefits include:

- **Library agnostic** - Switch between Zod, Valibot, or ArkType
- **Type inference** - TypeScript types derived from schemas
- **Ecosystem integration** - Works with tRPC, Hono, and more
- **Backend sharing** - Same schema validates on server

### Supported Libraries

| Library | Version | Standard Schema Support         |
| ------- | ------- | ------------------------------- |
| Zod     | 3.23+   | Built-in (`~standard` property) |
| Valibot | 0.31+   | Built-in                        |
| ArkType | 2.0+    | Built-in                        |

## The `standardSchema()` Wrapper

The wrapper creates a marker that Dynamic Forms recognizes:

```typescript
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

// Zod schema
const zodSchema = z.object({ name: z.string() });
const wrapped = standardSchema(zodSchema);

// Valibot schema
import * as v from 'valibot';
const valibotSchema = v.object({ name: v.string() });
const wrappedValibot = standardSchema(valibotSchema);
```

## Zod Validation Patterns

### Cross-Field Validation with `.refine()`

```typescript
const dateRangeSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });
```

### Multiple Refinements with `.superRefine()`

```typescript
const registrationSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
    email: z.string().email(),
    confirmEmail: z.string().email(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords must match',
        path: ['confirmPassword'],
      });
    }
    if (data.email !== data.confirmEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Emails must match',
        path: ['confirmEmail'],
      });
    }
  });
```

### Conditional Validation with `.transform()`

```typescript
const contactSchema = z
  .object({
    contactMethod: z.enum(['email', 'phone']),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.contactMethod === 'email') return !!data.email;
      if (data.contactMethod === 'phone') return !!data.phone;
      return true;
    },
    (data) => ({
      message: `${data.contactMethod} is required`,
      path: [data.contactMethod],
    }),
  );
```

## Using with OpenAPI

Reuse schemas generated from OpenAPI specs:

```typescript
// From your OpenAPI-generated schemas
import { UserCreateSchema } from './generated/schemas';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const config = {
  schema: standardSchema(UserCreateSchema),
  fields: [
    { key: 'username', type: 'input', label: 'Username', required: true },
    { key: 'email', type: 'input', label: 'Email', required: true },
    { key: 'password', type: 'input', label: 'Password', required: true, props: { type: 'password' } },
  ],
} as const satisfies FormConfig;
```

## Error Mapping

Zod errors are automatically mapped to form fields using the `path` property:

```typescript
// Zod error structure
{
  issues: [
    {
      path: ['confirmPassword'],
      message: 'Passwords must match',
    },
  ];
}

// Becomes Angular form error
form.controls.confirmPassword.errors;
// → { 'Passwords must match': true }
```

## Type Safety

The schema provides type inference for your form:

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
  email: z.string().email(),
});

// TypeScript infers the form type
type UserForm = z.infer<typeof userSchema>;
// { name: string; age: number; email: string }
```

### Optional `formConfig()` Helper

For enhanced type safety between your schema and form fields, use the optional `formConfig()` helper:

```typescript
import { z } from 'zod';
import { formConfig } from '@ng-forge/dynamic-forms';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

const config = formConfig({
  schema: standardSchema(passwordSchema),
  fields: [
    { key: 'password', type: 'input', label: 'Password', required: true, props: { type: 'password' } },
    { key: 'confirmPassword', type: 'input', label: 'Confirm', required: true, props: { type: 'password' } },
    { key: 'submit', type: 'submit', label: 'Register' },
  ] as const,
});
```

The helper infers the form value type from fields and constrains the schema accordingly. This is equivalent to:

```typescript
const config = {
  schema: standardSchema(passwordSchema),
  fields: [...],
} as const satisfies FormConfig;
```

Use `formConfig()` when you prefer function syntax or want explicit type inference. Both approaches work equally well.

## Best Practices

**Define schemas separately for reuse:**

```typescript
// schemas/user.schema.ts
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// In your form
import { userSchema } from './schemas/user.schema';
const config = {
  schema: standardSchema(userSchema),
  fields: [
    /* ... */
  ],
};
```

**Use schema validation for cross-field, field validators for single-field:**

```typescript
const config = {
  // Schema handles cross-field validation
  schema: standardSchema(
    z
      .object({
        password: z.string(),
        confirm: z.string(),
      })
      .refine(/* ... */),
  ),

  // Field validators handle single-field rules
  fields: [
    { key: 'password', minLength: 8, required: true },
    { key: 'confirm', required: true },
  ],
};
```

## When to Use Angular Schema Instead

Consider [Angular Schema](../angular-schema) if you:

- Don't want additional dependencies
- Have validation logic specific to one form
- Prefer Angular's native APIs

## Related

- **[Schema Validation Overview](../overview)** - When to use form-level validation
- **[Angular Schema](../angular-schema)** - Native Angular approach
- **[Field Validation](../../core/validation/)** - Individual field validators
- **[Standard Schema Spec](https://standardschema.dev)** - The specification
