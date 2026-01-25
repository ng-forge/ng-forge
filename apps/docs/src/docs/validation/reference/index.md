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
  }],
}
```

## Conditional Expressions

Validators support a `when` property for conditional validation. See **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** for the complete reference on:

- All operators (`equals`, `notEquals`, `greater`, `less`, `contains`, `matches`, etc.)
- Expression types (`fieldValue`, `formValue`, `javascript`, `custom`)
- Combining conditions with `and`/`or` logic

**Quick example:**

```typescript
{
  validators: [{
    type: 'required',
    when: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

## ValidatorConfig Types

ValidatorConfig is a discriminated union type with four variants:

```typescript
// Built-in validators (required, email, min, max, etc.)
interface BuiltInValidatorConfig {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';
  value?: number | string | RegExp;
  expression?: string;
  when?: ConditionalExpression;
}

// Custom synchronous validators
interface CustomValidatorConfig {
  type: 'custom';
  functionName?: string;
  params?: Record<string, unknown>;
  expression?: string;
  kind?: string;
  errorParams?: Record<string, string>;
  when?: ConditionalExpression;
}

// Async validators (for debounced validation, database lookups)
interface AsyncValidatorConfig {
  type: 'customAsync';
  functionName: string;
  params?: Record<string, unknown>;
  when?: ConditionalExpression;
}

// HTTP validators (optimized HTTP validation with auto-cancellation)
interface HttpValidatorConfig {
  type: 'customHttp';
  functionName: string;
  params?: Record<string, unknown>;
  when?: ConditionalExpression;
}

type ValidatorConfig = BuiltInValidatorConfig | CustomValidatorConfig | AsyncValidatorConfig | HttpValidatorConfig;
```

## ConditionalExpression Interface

```typescript
interface ConditionalExpression {
  // Expression type - includes 'and' and 'or' for combining conditions
  type: 'fieldValue' | 'formValue' | 'custom' | 'javascript' | 'and' | 'or';

  // Field path for fieldValue type
  fieldPath?: string;

  // Comparison operator
  operator?:
    | 'equals'
    | 'notEquals'
    | 'greater'
    | 'less'
    | 'greaterOrEqual'
    | 'lessOrEqual'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'matches';

  // Value to compare against
  value?: unknown;

  // JavaScript expression for custom logic
  expression?: string;

  // Array of sub-conditions for 'and' and 'or' types
  conditions?: ConditionalExpression[];
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
- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Field behavior changes
- **[Type Safety](../../advanced/type-safety/basics/)** - TypeScript integration
