---
title: Reference
slug: validation/reference
description: 'Complete reference for all built-in validators, conditional expressions, and validation configuration options in ng-forge dynamic forms.'
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

Validators support a `when` property for conditional validation. See **[Conditional Logic](/dynamic-behavior/conditional-logic)** for the complete reference on:

- All operators (`equals`, `notEquals`, `greater`, `less`, `contains`, `matches`, etc.)
- Expression types (`fieldValue`, `javascript`, `custom`)
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

ValidatorConfig is a discriminated union type with five variants:

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
  fn?: CustomValidator; // inline validator; mutually exclusive with functionName
  params?: Record<string, unknown>;
  expression?: string;
  kind?: string;
  errorParams?: Record<string, string>;
  when?: ConditionalExpression;
}

// Async validators (database lookups, resource-based async checks)
// Exactly one of functionName or fn must be set (XOR)
type AsyncValidatorConfig = {
  type: 'async';
  params?: Record<string, unknown>;
  when?: ConditionalExpression;
} & ({ functionName: string; fn?: never } | { fn: AsyncCustomValidator; functionName?: never });

// Function-based HTTP validators (registered function or inline fn)
// Exactly one of functionName or fn must be set (XOR)
type FunctionHttpValidatorConfig = {
  type: 'http';
  params?: Record<string, unknown>;
  when?: ConditionalExpression;
} & ({ functionName: string; fn?: never } | { fn: HttpCustomValidator; functionName?: never });

// Declarative HTTP validators (fully JSON-serializable, no function registration)
interface DeclarativeHttpValidatorConfig {
  type: 'http';
  http: HttpRequestConfig;
  responseMapping: HttpValidationResponseMapping;
  when?: ConditionalExpression;
}

type ValidatorConfig =
  | BuiltInValidatorConfig
  | CustomValidatorConfig
  | AsyncValidatorConfig
  | FunctionHttpValidatorConfig
  | DeclarativeHttpValidatorConfig;
```

> **Note:** `FunctionHttpValidatorConfig` and `DeclarativeHttpValidatorConfig` both use `type: 'http'`. They are discriminated by property presence: `functionName` or `fn` indicates function-based, `http` + `responseMapping` indicates declarative.

### HttpRequestConfig

Used by `DeclarativeHttpValidatorConfig` to define the HTTP request:

```typescript
interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; // defaults to 'GET'
  params?: Record<string, string>; // URL path parameters for :key placeholders; values are expressions
  queryParams?: Record<string, string>; // values are expressions
  body?: Record<string, unknown>;
  evaluateBodyExpressions?: boolean; // when true, top-level string values in body are evaluated as expressions
  headers?: Record<string, string>;
}
```

### HttpValidationResponseMapping

Used by `DeclarativeHttpValidatorConfig` to interpret the HTTP response:

```typescript
interface HttpValidationResponseMapping {
  validWhen: string; // expression evaluated with { response } scope; must evaluate to boolean true
  errorKind: string; // error kind for validationMessages lookup
  errorParams?: Record<string, string>; // parameter expressions evaluated against { response }
}
```

## ConditionalExpression Types

`ConditionalExpression` is a discriminated union of seven condition types. Each variant only allows the properties relevant to its type, providing compile-time safety against invalid property combinations.

```typescript
// Compare a specific field's value
interface FieldValueCondition {
  type: 'fieldValue';
  fieldPath: string;
  operator: ComparisonOperator;
  value?: unknown;
}

// Invoke a registered custom function by name, or an inline function
// Exactly one of functionName or fn must be set (XOR)
type CustomCondition = { type: 'custom'; functionName: string; fn?: never } | { type: 'custom'; fn: CustomFunction; functionName?: never };

// Evaluate a JavaScript expression via the secure AST-based parser
interface JavascriptCondition {
  type: 'javascript';
  expression: string; // has access to formValue, fieldValue, externalData, etc.
}

// Evaluate based on an HTTP response
interface HttpCondition {
  type: 'http';
  http: HttpRequestConfig;
  responseExpression?: string; // expression with { response } scope; defaults to !!response
  pendingValue?: boolean; // value while the request is in flight; defaults to false
  cacheDurationMs?: number; // response cache duration; defaults to 30000
  debounceMs?: number; // re-evaluation debounce; defaults to 300
}

// Resolve asynchronously via a custom function
// Exactly one of asyncFunctionName or asyncFn must be set (XOR)
type AsyncCondition = {
  type: 'async';
  pendingValue?: boolean; // value while resolution is pending; defaults to false
  debounceMs?: number; // re-evaluation debounce; defaults to 300
} & ({ asyncFunctionName: string; asyncFn?: never } | { asyncFn: AsyncConditionFunction; asyncFunctionName?: never });

// Logical AND — all sub-conditions must be true
interface AndCondition {
  type: 'and';
  conditions: ConditionalExpression[];
}

// Logical OR — at least one sub-condition must be true
interface OrCondition {
  type: 'or';
  conditions: ConditionalExpression[];
}

type ComparisonOperator =
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

type ConditionalExpression =
  | FieldValueCondition
  | CustomCondition
  | JavascriptCondition
  | HttpCondition
  | AsyncCondition
  | AndCondition
  | OrCondition;
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

- **[Validation Basics](/validation/basics)** - Getting started with validation
- **[Validation Advanced](/validation/advanced)** - Conditional validators
- **[Conditional Logic](/dynamic-behavior/conditional-logic)** - Field behavior changes
- **[Type Safety](/recipes/type-safety)** - TypeScript integration
