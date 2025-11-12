---
title: Reference
route: reference
keyword: ValidationReferencePage
---

Complete reference for all validators, conditional expressions, and validation configuration options.

## All Validator Types

### required

Field must have a value.

```typescript
// Shorthand
{ required: true }

// Explicit
{
  validators: [{
    type: 'required',
    errorMessage: 'This field is required',
  }],
}
```

### email

Must be a valid email format.

```typescript
// Shorthand
{ email: true }

// Explicit
{
  validators: [{
    type: 'email',
    errorMessage: 'Please enter a valid email address',
  }],
}
```

### minLength

Minimum string length.

```typescript
// Shorthand
{ minLength: 8 }

// Explicit
{
  validators: [{
    type: 'minLength',
    value: 8,
    errorMessage: 'Must be at least 8 characters',
  }],
}
```

### maxLength

Maximum string length.

```typescript
// Shorthand
{ maxLength: 20 }

// Explicit
{
  validators: [{
    type: 'maxLength',
    value: 20,
    errorMessage: 'Cannot exceed 20 characters',
  }],
}
```

### min

Minimum numeric value.

```typescript
// Shorthand
{ min: 0 }

// Explicit
{
  validators: [{
    type: 'min',
    value: 0,
    errorMessage: 'Must be at least 0',
  }],
}
```

### max

Maximum numeric value.

```typescript
// Shorthand
{ max: 100 }

// Explicit
{
  validators: [{
    type: 'max',
    value: 100,
    errorMessage: 'Cannot exceed 100',
  }],
}
```

### pattern

Regular expression validation.

```typescript
// Shorthand
{ pattern: '^[0-9]{5}$' }

// Explicit
{
  validators: [{
    type: 'pattern',
    value: '^[0-9]{5}$',
    errorMessage: 'Must be a 5-digit ZIP code',
  }],
}
```

### custom

Custom JavaScript expression.

```typescript
{
  validators: [{
    type: 'custom',
    expression: 'fieldValue === formValue.password',
    errorMessage: 'Passwords must match',
  }],
}
```

## Conditional Operators

Use in `when` conditions:

| Operator         | Description           | Example               |
| ---------------- | --------------------- | --------------------- |
| `equals`         | Exact match           | `value: 'business'`   |
| `notEquals`      | Not equal to          | `value: 'pending'`    |
| `greater`        | Greater than          | `value: 100`          |
| `less`           | Less than             | `value: 0`            |
| `greaterOrEqual` | Greater than or equal | `value: 18`           |
| `lessOrEqual`    | Less than or equal    | `value: 120`          |
| `contains`       | String/array contains | `value: '@gmail.com'` |
| `startsWith`     | String starts with    | `value: 'https://'`   |
| `endsWith`       | String ends with      | `value: '.com'`       |
| `matches`        | RegEx match           | `value: '^[A-Z]'`     |

### Operator Examples

```typescript
// equals
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'equals',
  value: 'active',
}

// greater
{
  type: 'fieldValue',
  fieldPath: 'age',
  operator: 'greater',
  value: 18,
}

// contains
{
  type: 'fieldValue',
  fieldPath: 'email',
  operator: 'contains',
  value: '@company.com',
}

// in
{
  type: 'fieldValue',
  fieldPath: 'role',
  operator: 'in',
  value: ['admin', 'moderator', 'owner'],
}
```

## Conditional Expression Types

### fieldValue

Check a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}
```

### formValue

Use JavaScript expression on entire form:

```typescript
{
  type: 'formValue',
  expression: 'formValue.hasShipping && formValue.country === "US"',
}
```

### javascript

Custom JavaScript validation:

```typescript
{
  type: 'javascript',
  expression: 'new Date(fieldValue) > new Date()',
}
```

### custom

Advanced custom logic:

```typescript
{
  type: 'custom',
  expression: 'fieldValue === formValue.confirmPassword',
}
```

## Combining Conditions

### AND Logic

All conditions must be true:

```typescript
{
  type: 'and',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    {
      type: 'fieldValue',
      fieldPath: 'hasTeam',
      operator: 'equals',
      value: true,
    },
  ],
}
```

### OR Logic

At least one condition must be true:

```typescript
{
  type: 'or',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'role',
      operator: 'equals',
      value: 'admin',
    },
    {
      type: 'fieldValue',
      fieldPath: 'role',
      operator: 'equals',
      value: 'owner',
    },
  ],
}
```

## ValidatorConfig Interface

```typescript
interface ValidatorConfig {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  expression?: string;
  errorMessage?: string;
  when?: ConditionalExpression;
}
```

## ConditionalExpression Interface

```typescript
interface ConditionalExpression {
  type: 'fieldValue' | 'formValue' | 'javascript' | 'custom';
  fieldPath?: string;
  operator?:
    | 'equals'
    | 'notEquals'
    | 'greater'
    | 'less'
    | 'greaterOrEqual'
    | 'lessOrEqual'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'matches'
    | 'in'
    | 'notIn';
  value?: unknown;
  expression?: string;
  conditions?: {
    type: 'and' | 'or';
    expressions: ConditionalExpression[];
  };
}
```

## Validation Messages

### Per-Field Messages

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email is required',
    email: 'Invalid email format',
  },
}
```

### Dynamic Messages (i18n)

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  validationMessages: {
    required: this.transloco.selectTranslate('validation.required'),
    email: this.transloco.selectTranslate('validation.email'),
  },
}
```

## Common Patterns

### Email Validation

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email is required',
    email: 'Please enter a valid email address',
  },
}
```

### Password Requirements

```typescript
{
  key: 'password',
  type: 'input',
  value: '',
  required: true,
  minLength: 8,
  maxLength: 128,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])',
  validationMessages: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    pattern: 'Password must include uppercase, lowercase, number, and special character',
  },
  props: { type: 'password' },
}
```

### Numeric Range

```typescript
{
  key: 'age',
  type: 'input',
  value: null,
  required: true,
  min: 18,
  max: 120,
  validationMessages: {
    required: 'Age is required',
    min: 'Must be at least 18 years old',
    max: 'Please enter a valid age',
  },
  props: { type: 'number' },
}
```

### ZIP Code

```typescript
{
  key: 'zipCode',
  type: 'input',
  value: '',
  required: true,
  pattern: '^[0-9]{5}(-[0-9]{4})?$',
  validationMessages: {
    required: 'ZIP code is required',
    pattern: 'Must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)',
  },
}
```

### Phone Number

```typescript
{
  key: 'phone',
  type: 'input',
  value: '',
  pattern: '^\\+?[1-9]\\d{1,14}$',
  validationMessages: {
    pattern: 'Please enter a valid phone number (E.164 format preferred)',
  },
  props: { type: 'tel' },
}
```

### URL

```typescript
{
  key: 'website',
  type: 'input',
  value: '',
  pattern: '^https?:\\/\\/.+',
  validationMessages: {
    pattern: 'Please enter a valid URL starting with http:// or https://',
  },
  props: { type: 'url' },
}
```

## Related

- **[Validation Basics](../basics/)** - Getting started with validation
- **[Validation Advanced](../advanced/)** - Conditional validators
- **[Conditional Logic](../../conditional-logic/)** - Field behavior changes
- **[Type Safety](../../type-safety/)** - TypeScript integration
