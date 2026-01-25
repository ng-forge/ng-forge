---
title: Zod Validation
keyword: ZodSchemaPage
---

Use [Zod](https://zod.dev) schemas to validate your dynamic forms. This lets you reuse existing schemas, share validation logic between frontend and backend, and leverage Zod's powerful cross-field validation like `.refine()`.

## Installation

```bash
npm install zod
```

## Basic Usage

```typescript
import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const config = {
  schema: standardSchema(userSchema),
  fields: [
    { key: 'email', type: 'input', label: 'Email', props: { type: 'email' } },
    { key: 'password', type: 'input', label: 'Password', props: { type: 'password' } },
    { key: 'submit', type: 'submit', label: 'Register' },
  ],
} as const satisfies FormConfig;
```

The `standardSchema()` wrapper tells Dynamic Forms to use Zod for validation. Errors are automatically mapped to the corresponding form fields.

## Live Demo

Try the password confirmation form with Zod validation:

<iframe src="http://localhost:4201/#/examples/zod-schema-validation" class="example-frame" title="Zod Validation Demo"></iframe>

## Cross-Field Validation

The main reason to use Zod is cross-field validation - rules that depend on multiple fields.

### Password Confirmation with `.refine()`

```typescript
const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // Error appears on this field
  });
```

### Date Range Validation

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

### Multiple Cross-Field Rules with `.superRefine()`

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

### Conditional Required Fields

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

## Reusing Schemas

### From OpenAPI or Backend

```typescript
// Reuse schemas generated from OpenAPI specs
import { UserCreateSchema } from './generated/schemas';

const config = {
  schema: standardSchema(UserCreateSchema),
  fields: [
    { key: 'username', type: 'input', label: 'Username' },
    { key: 'email', type: 'input', label: 'Email' },
    { key: 'password', type: 'input', label: 'Password', props: { type: 'password' } },
  ],
} as const satisfies FormConfig;
```

### Shared Validation Logic

```typescript
// schemas/user.schema.ts - shared with backend
export const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});

// frontend form
import { userSchema } from '@shared/schemas';

const config = {
  schema: standardSchema(userSchema),
  fields: [
    { key: 'email', type: 'input', label: 'Email' },
    { key: 'password', type: 'input', label: 'Password', props: { type: 'password' } },
  ],
} as const satisfies FormConfig;
```

## How Errors Work

Zod errors automatically map to form fields via the `path` property:

```typescript
// When validation fails, Zod produces:
{
  issues: [{ path: ['confirmPassword'], message: 'Passwords must match' }];
}

// Dynamic Forms maps this to Angular's form errors:
form.controls.confirmPassword.errors;
// → { 'Passwords must match': true }
```

## Combining with Field Validators

Use Zod for cross-field rules, field-level validators for single-field rules:

```typescript
const config = {
  // Zod handles cross-field validation
  schema: standardSchema(
    z.object({ password: z.string(), confirm: z.string() }).refine((data) => data.password === data.confirm, {
      message: 'Passwords must match',
      path: ['confirm'],
    }),
  ),

  // Field validators handle single-field rules
  fields: [
    { key: 'password', type: 'input', label: 'Password', required: true, minLength: 8 },
    { key: 'confirm', type: 'input', label: 'Confirm Password', required: true },
  ],
} as const satisfies FormConfig;
```

## Other Schema Libraries

The same approach works with Valibot and ArkType:

```typescript
// Valibot
import * as v from 'valibot';
const schema = v.object({ email: v.pipe(v.string(), v.email()) });
const config = { schema: standardSchema(schema), fields: [...] };

// ArkType
import { type } from 'arktype';
const schema = type({ email: 'email' });
const config = { schema: standardSchema(schema), fields: [...] };
```

## Related

- **[Schema Validation Overview](../overview)** - When to use form-level validation
- **[Angular Schema](../angular-schema)** - Native Angular approach without dependencies
- **[Field Validation](../../validation/basics/)** - Individual field validators
