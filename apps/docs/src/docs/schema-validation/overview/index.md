---
title: Overview
keyword: SchemaValidationOverviewPage
---

Form-level schema validation enables cross-field validation rules that examine the entire form state. While field-level validators check individual fields, schema validators validate relationships between multiple fields.

## When to Use Schema Validation

Schema validation excels at:

- **Password confirmation** - Ensure two fields match
- **Date ranges** - Validate end date is after start date
- **Conditional requirements** - Complex business rules across fields
- **Data consistency** - Ensure related fields are logically consistent

## Available Approaches

Dynamic Forms supports two approaches to form-level validation:

| Approach                            | Best For                               | Wrapper Required         |
| ----------------------------------- | -------------------------------------- | ------------------------ |
| [Angular Schema](../angular-schema) | Angular-only projects, full API access | No (raw callback)        |
| [Standard Schema](../zod)           | Reusing Zod/Valibot schemas, OpenAPI   | Yes (`standardSchema()`) |

### Angular Schema

Uses Angular's native schema APIs from signal forms. Best when:

- Your project is Angular-only
- You want zero additional dependencies
- Validation logic is specific to this form

```typescript
import { validateTree } from '@angular/forms/signals';

const config = {
  // Raw callback - no wrapper needed!
  schema: (path) => {
    validateTree(path, (ctx) => {
      const { password, confirmPassword } = ctx.value();
      if (password !== confirmPassword) {
        return [{ kind: 'passwordMismatch', fieldTree: ctx.fieldTreeOf(path).confirmPassword }];
      }
      return null;
    });
  },
  fields: [
    /* ... */
  ],
};
```

### Standard Schema (Zod, Valibot, ArkType)

Uses the [Standard Schema](https://standardschema.dev) spec for cross-library compatibility. Best when:

- You have existing Zod/Valibot schemas
- You're reusing OpenAPI-generated schemas
- You want the same validation on frontend and backend

```typescript
import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

const config = {
  schema: standardSchema(passwordSchema),
  fields: [
    /* ... */
  ],
};
```

## Comparison

| Feature          | Angular Schema           | Standard Schema                   |
| ---------------- | ------------------------ | --------------------------------- |
| Dependencies     | None (Angular core)      | Schema library (Zod, etc.)        |
| Type inference   | Manual                   | Automatic from schema             |
| Cross-platform   | No                       | Yes (same schema in Node.js)      |
| OpenAPI compat   | No                       | Yes (via zod-openapi, etc.)       |
| Learning curve   | Familiar to Angular devs | Requires schema library knowledge |
| Wrapper required | No (raw callback)        | Yes (`standardSchema()`)          |

## How It Works

1. Define your schema (Angular or Standard Schema)
2. Add it to your form configuration via the `schema` property
3. The form validates against the schema on every change
4. Schema errors are mapped to the appropriate fields

## Next Steps

- **[Angular Schema](../angular-schema)** - Native Angular approach
- **[Standard Schema (Zod)](../zod)** - Use Zod, Valibot, or ArkType
- **[Field Validation](../../validation/basics/)** - Individual field validators
