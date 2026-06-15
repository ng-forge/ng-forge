---
title: Angular Schema
keyword: AngularSchemaPage
description: "Use Angular's native signal forms Schema API for form-level validation in dynamic forms with zero extra dependencies."
---

Angular's signal forms include native schema APIs for form-level validation. This approach requires no additional dependencies and works directly with Dynamic Forms.

## Raw Callback Pattern (Recommended)

For maximum simplicity, pass Angular's schema callback directly without any wrapper:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';
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
    { key: 'password', type: 'input', label: 'Password', required: true, props: { type: 'password' } },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      validationMessages: { passwordMismatch: 'Passwords must match' },
      props: { type: 'password' },
    },
    { key: 'submit', type: 'submit', label: 'Register' },
  ],
} as const satisfies FormConfig;
```

This pattern gives you full access to Angular's validation APIs including `validateTree`, `validate`, and `required`.

## Combining Field and Schema Validation

Field-level validators (like `required`, `minLength`) and the schema callback both run reactively, and their errors are combined on the affected fields.

## The schema() Wrapper

Angular also exports a `schema()` function that wraps a callback into a `Schema<T>` object. Dynamic Forms does not accept this wrapper: the `schema` property of `FormConfig` takes either a raw callback `(path) => void` or a `standardSchema()` marker. A `Schema` object created with `schema()` is ignored.

To reuse validation logic across forms, type and export the callback itself:

```typescript
import { validate, SchemaPathTree } from '@angular/forms/signals';

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

const passwordSchema = (p: SchemaPathTree<PasswordForm>) => {
  validate(p.confirmPassword, ({ value, valueOf }) => (value() === valueOf(p.password) ? null : { kind: 'passwordMismatch' }));
};
```

The returned `passwordMismatch` kind maps to display text via the field's `validationMessages` (or form-level `defaultValidationMessages`).

## Using with Dynamic Forms

Pass the raw callback to your form configuration. The callback receives the schema path tree, and you bind validators to paths inside it:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';
import { validate } from '@angular/forms/signals';

const config = {
  schema: (path) => {
    validate(path.confirmPassword, ({ value, valueOf }) => (value() === valueOf(path.password) ? null : { kind: 'passwordMismatch' }));
  },
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      minLength: 8,
      props: { type: 'password' },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      validationMessages: {
        passwordMismatch: 'Passwords must match',
      },
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

## Schema API Reference

### The schema callback

Dynamic Forms invokes your callback with the schema path tree for the form value. Navigate to a field's path with property access (`path.email`, `path.address.city`) and bind validation logic to it:

```typescript
schema: (path) => {
  // path.fieldKey is a path object, not a value
  // bind logic with validate(), validateTree(), required(), ...
};
```

### `validate(path, logic)`

Binds a validator to a path and returns `void`. The logic function receives a `FieldContext` and returns `ValidationError | ValidationError[] | null`. Use `value()` for the bound field's value and `valueOf(otherPath)` for other fields:

```typescript
validate(path.endDate, ({ value, valueOf }) => {
  const start = valueOf(path.startDate);
  const end = value();
  if (!start || !end) return null;
  return end >= start ? null : { kind: 'invalidRange' };
});
```

### `validateTree(path, logic)`

Like `validate`, but the returned errors can target specific fields in the subtree via `fieldTree` (see the password example above). Useful when one rule produces errors on several fields.

### `required(path, config?)`

Marks a field as required. Pass `when` for conditional requiredness:

```typescript
required(path.endDate, {
  when: ({ valueOf }) => valueOf(path.hasEndDate) === true,
});
```

### Combining Validators

Call as many validation functions as you need inside one callback:

```typescript
schema: (path) => {
  validate(path.confirmPassword, ({ value, valueOf }) => (value() === valueOf(path.password) ? null : { kind: 'passwordMismatch' }));
  validate(path.endDate, ({ value, valueOf }) => (!value() || value() > valueOf(path.startDate) ? null : { kind: 'invalidRange' }));
};
```

## Examples

### Date Range Validation

```typescript
const config = {
  schema: (path) => {
    validate(path.endDate, ({ value, valueOf }) => {
      const start = valueOf(path.startDate);
      const end = value();
      if (!start || !end) return null;
      return new Date(end) >= new Date(start) ? null : { kind: 'invalidRange' };
    });
  },
  fields: [
    {
      key: 'startDate',
      type: 'datepicker',
      label: 'Start Date',
      required: true,
    },
    {
      key: 'endDate',
      type: 'datepicker',
      label: 'End Date',
      required: true,
      validationMessages: {
        invalidRange: 'End date must be after start date',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Conditional Required Fields

```typescript
const config = {
  schema: (path) => {
    required(path.email, { when: ({ valueOf }) => valueOf(path.preferredContact) === 'email' });
    required(path.phone, { when: ({ valueOf }) => valueOf(path.preferredContact) === 'phone' });
  },
  fields: [
    /* preferredContact, email, phone */
  ],
} as const satisfies FormConfig;
```

### Complex Business Rules

```typescript
const config = {
  schema: (path) => {
    // Percentage discount cannot exceed 100%
    validate(path.discount, ({ value, valueOf }) =>
      valueOf(path.discountType) === 'percentage' && value() > 100 ? { kind: 'maxPercentage' } : null,
    );

    // Fixed discount cannot exceed total
    validate(path.discount, ({ value, valueOf }) =>
      valueOf(path.discountType) === 'fixed' && value() > valueOf(path.total) ? { kind: 'exceedsTotal' } : null,
    );
  },
  fields: [
    /* quantity, discount, discountType, total */
  ],
} as const satisfies FormConfig;
```

## Best Practices

**Keep schemas focused:**

```typescript
// Good - single responsibility
schema: (path) => {
  validate(path.confirmPassword, ({ value, valueOf }) => (value() === valueOf(path.password) ? null : { kind: 'passwordMismatch' }));
};

// Avoid - too many concerns in one callback
schema: (path) => {
  // 10+ validations...
};
```

**Use field validators for simple cases:**

```typescript
// Use field validators when possible
{
  key: 'email',
  required: true,
  email: true,
}

// Use schema for cross-field only
schema: (path) => {
  validate(path.alternateEmail, ({ value, valueOf }) =>
    value() !== valueOf(path.email) ? null : { kind: 'sameAsEmail' },
  );
};
```

## When to Use Standard Schema Instead

Consider [Standard Schema (Zod)](/schema-validation/zod) if you:

- Already have Zod schemas from an API or shared library
- Need the same validation in Node.js backend
- Want automatic TypeScript type inference from schemas
- Are using OpenAPI-generated schemas

## Next Steps

- **[Standard Schema (Zod)](/schema-validation/zod)**: Use Zod, Valibot, or ArkType for cross-platform schema validation
- **[Field Validation](/validation/basics)**: Add built-in and custom validators to individual fields
- **[Schema Validation Overview](/schema-validation/overview)**: Compare Angular and Standard Schema approaches
