---
title: Angular Schema
keyword: AngularSchemaPage
---

Angular's signal forms include a native `Schema<T>` API for form-level validation. This approach requires no additional dependencies and integrates seamlessly with Dynamic Forms.

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

Field-level validators (like `required`, `minLength`) run **first**, then the schema callback runs for cross-field validation. Both work together seamlessly.

## Using schema() Wrapper

Alternatively, you can use Angular's `schema()` function to wrap your callback:

```typescript
import { schema, required, validate } from '@angular/forms/signals';
```

Define your schema with cross-field validation:

```typescript
interface PasswordForm {
  password: string;
  confirmPassword: string;
}

const passwordSchema = schema<PasswordForm>(({ value }) =>
  validate(value.password === value.confirmPassword, { confirmPassword: { passwordMismatch: true } }),
);
```

## Using with Dynamic Forms

Pass the Angular schema directly to your form configuration:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';
import { schema, validate } from '@angular/forms/signals';

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

const config = {
  schema: schema<PasswordForm>(({ value }) =>
    validate(value.password === value.confirmPassword, { confirmPassword: { passwordMismatch: true } }),
  ),
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

### `schema<T>(validator)`

Creates a form-level schema validator.

```typescript
const mySchema = schema<MyFormType>(({ value, touched, dirty }) => {
  // value: current form value
  // touched: whether form has been touched
  // dirty: whether form has been modified
  return validate(/* condition */, /* errors */);
});
```

### `validate(condition, errors)`

Returns validation errors when condition is false.

```typescript
validate(endDate > startDate, { endDate: { invalidRange: true } });
```

### `required(path)`

Marks a field as conditionally required.

```typescript
schema<MyForm>(({ value }) => (value.hasEndDate ? required('endDate') : null));
```

### Combining Validators

Return multiple validation results:

```typescript
schema<MyForm>(({ value }) => [
  validate(value.password === value.confirmPassword, { confirmPassword: { passwordMismatch: true } }),
  validate(value.endDate > value.startDate, { endDate: { invalidRange: true } }),
]);
```

## Examples

### Date Range Validation

```typescript
interface DateRangeForm {
  startDate: string;
  endDate: string;
}

const dateRangeSchema = schema<DateRangeForm>(({ value }) =>
  validate(!value.startDate || !value.endDate || new Date(value.endDate) >= new Date(value.startDate), { endDate: { invalidRange: true } }),
);

const config = {
  schema: dateRangeSchema,
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
interface ContactForm {
  preferredContact: 'email' | 'phone';
  email: string;
  phone: string;
}

const contactSchema = schema<ContactForm>(({ value }) => [
  value.preferredContact === 'email' && !value.email ? validate(false, { email: { required: true } }) : null,
  value.preferredContact === 'phone' && !value.phone ? validate(false, { phone: { required: true } }) : null,
]);
```

### Complex Business Rules

```typescript
interface OrderForm {
  quantity: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
}

const orderSchema = schema<OrderForm>(({ value }) => {
  const errors = [];

  // Percentage discount can't exceed 100%
  if (value.discountType === 'percentage' && value.discount > 100) {
    errors.push(
      validate(false, {
        discount: { maxPercentage: true },
      }),
    );
  }

  // Fixed discount can't exceed total
  if (value.discountType === 'fixed' && value.discount > value.total) {
    errors.push(
      validate(false, {
        discount: { exceedsTotal: true },
      }),
    );
  }

  return errors;
});
```

## Best Practices

**Keep schemas focused:**

```typescript
// Good - single responsibility
const passwordMatchSchema = schema<PasswordForm>(({ value }) =>
  validate(value.password === value.confirmPassword, { confirmPassword: { passwordMismatch: true } }),
);

// Avoid - too many concerns
const everythingSchema = schema<BigForm>(({ value }) => [
  // 10+ validations...
]);
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
schema: schema<Form>(({ value }) =>
  validate(value.email !== value.alternateEmail, {
    alternateEmail: { sameAsEmail: true }
  })
)
```

## When to Use Standard Schema Instead

Consider [Standard Schema (Zod)](../zod) if you:

- Already have Zod schemas from an API or shared library
- Need the same validation in Node.js backend
- Want automatic TypeScript type inference from schemas
- Are using OpenAPI-generated schemas

## Related

- **[Schema Validation Overview](../overview)** - When to use form-level validation
- **[Standard Schema (Zod)](../zod)** - Alternative using Zod/Valibot
- **[Field Validation](../../validation/basics/)** - Individual field validators
