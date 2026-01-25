Custom validation functions for complex validation logic that goes beyond built-in validators.

## Overview

ng-forge supports three types of custom validators using Angular's Signal Forms API:

1. **CustomValidator** - Synchronous validators with access to FieldContext
2. **AsyncCustomValidator** - Async validators using Angular's resource API
3. **HttpCustomValidator** - HTTP-specific validators with automatic request cancellation

**Key Principle:** Validators should focus on validation logic, NOT presentation. Return only the error `kind` and configure messages at field level for proper i18n support.

## Live Demo

Try the interactive example below to see both expression-based and function-based validators in action:

<iframe src="http://localhost:4201/#/examples/expression-validators" class="example-frame" title="Expression Validators Demo"></iframe>

## Message Resolution (STRICT)

All error messages MUST be explicitly configured. The framework enforces this strictly:

1. **Field-level `validationMessages[kind]`** (highest priority - per-field customization)
2. **Form-level `defaultValidationMessages[kind]`** (fallback for common messages)
3. **No message configured = Console warning + error NOT displayed**

**Important:** Validator-returned messages are NOT used as fallbacks. This enforces proper separation of concerns and i18n patterns.

You can define messages at the form level for common validation errors:

```typescript
{
  defaultValidationMessages: {
    noSpaces: 'Spaces are not allowed',
    passwordMismatch: 'Passwords must match'
  },
  fields: [/* ... */]
}
```

## Two Validator Patterns

ng-forge supports two patterns for custom validators:

1. **Function-based** - Register reusable validator functions (best for complex logic, reusability)
2. **Expression-based** - Inline JavaScript expressions (best for simple, one-off validations)

## Expression-Based Validators

For simple validation logic, use inline JavaScript expressions without registering functions.

### Basic Example

```typescript
{
  key: 'confirmPassword',
  type: 'input',
  value: '',
  validators: [{
    type: 'custom',
    expression: 'fieldValue === formValue.password',
    kind: 'passwordMismatch',
  }],
  validationMessages: {
    passwordMismatch: 'Passwords must match',
  },
}
```

**How it works:**

- `fieldValue` - Current field's value
- `formValue` - Entire form value object
- Expression returns `true` = validation passes
- Expression returns `false` = validation fails with the specified `kind`

### Available Context

Expression-based validators have access to:

- **`fieldValue`** - Current field value
- **`formValue`** - Complete form value object (e.g., `formValue.password`, `formValue.email`)
- **`fieldPath`** - Current field path
- Custom functions registered in `customFnConfig.customFunctions`

### Safe Member Access

**Built-in null/undefined handling**: Member access is safe by default - no manual null checks needed!

```typescript
// ✅ Works safely even when nested values are null/undefined
{
  expression: 'fieldValue !== formValue.user.profile.firstName',
  kind: 'invalidNested',
}

// ❌ Unnecessary - Don't do this
{
  expression: '!formValue.user || !formValue.user.profile || !formValue.user.profile.firstName || fieldValue !== formValue.user.profile.firstName',
  kind: 'invalidNested',
}

// ✅ Better - Safe by default
{
  expression: '!formValue.user.profile.firstName || fieldValue !== formValue.user.profile.firstName',
  kind: 'invalidNested',
}
```

Accessing properties on `null` or `undefined` returns `undefined` instead of throwing errors, making expressions cleaner and more maintainable.

### Common Expression Patterns

**Password confirmation:**

```typescript
{
  expression: 'fieldValue === formValue.password',
  kind: 'passwordMismatch',
}
```

**Date range validation:**

```typescript
{
  expression: 'new Date(fieldValue) > new Date(formValue.startDate)',
  kind: 'endDateBeforeStart',
}
```

**Conditional required:**

```typescript
{
  expression: 'formValue.requiresApproval ? fieldValue?.length > 0 : true',
  kind: 'approvalRequired',
}
```

**Numeric comparison:**

```typescript
{
  expression: 'fieldValue >= formValue.minAge && fieldValue <= formValue.maxAge',
  kind: 'ageOutOfRange',
}
```

**Deeply nested field validation:**

```typescript
{
  // Safe to access deeply nested properties
  expression: 'fieldValue.toLowerCase() !== formValue.user.address.city.toLowerCase()',
  kind: 'invalidAddress',
}
```

### Security

Expressions use **secure AST-based parsing** - no `eval()` or `new Function()`. Only safe JavaScript operations are allowed.

## Function-Based Validators

Best for validation that needs field value and access to other fields via FieldContext.

### Basic Example

```typescript
import { CustomValidator } from '@ng-forge/dynamic-forms';

// ✅ RECOMMENDED: Return only kind
const noSpaces: CustomValidator = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' }; // No hardcoded message
  }
  return null;
};

// Register and configure message
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      validators: [{ type: 'custom', functionName: 'noSpaces' }],
      validationMessages: {
        noSpaces: 'Spaces are not allowed', // Or Observable/Signal for i18n
      },
    },
  ],
  customFnConfig: {
    validators: {
      noSpaces,
    },
  },
};
```

### FieldContext API

The `FieldContext` API provides access to:

- **`ctx.value()`** - Current field value (signal)
- **`ctx.state`** - Field state (errors, touched, dirty, etc.)
- **`ctx.valueOf(path)`** - Access other field values (PUBLIC API for cross-field validation)
- **`ctx.stateOf(path)`** - Access other field states
- **`ctx.field`** - Current field tree

### Cross-Field Validation

Use `ctx.valueOf()` to access other field values for comparison validators:

```typescript
import { CustomValidator } from '@ng-forge/dynamic-forms';

const greaterThanMin: CustomValidator = (ctx) => {
  const value = ctx.value();
  const minValue = ctx.valueOf('minAge');

  if (minValue !== undefined && value <= minValue) {
    return { kind: 'notGreaterThanMin' };
  }
  return null;
};

// Note: Custom validators return only 'kind'. Built-in validators (min, max, etc.)
// automatically include params for interpolation (e.g., {{min}}, {{max}}, etc.)
const config = {
  fields: [
    { key: 'minAge', type: 'input', value: 0 },
    {
      key: 'maxAge',
      type: 'input',
      value: 0,
      validators: [
        {
          type: 'custom',
          functionName: 'greaterThanMin',
        },
      ],
      validationMessages: {
        notGreaterThanMin: 'Maximum age must be greater than minimum age',
      },
    },
  ],
  customFnConfig: {
    validators: { greaterThanMin },
  },
};
```

**Common Cross-Field Patterns:**

- Password confirmation matching
- Date range validation (start < end)
- Numeric range validation (min < max)
- Conditional required fields

### Password Confirmation Example

```typescript
const passwordMatch: CustomValidator = (ctx) => {
  const confirmPassword = ctx.value();
  const password = ctx.valueOf('password');

  if (!confirmPassword || !password) {
    return null; // Let required validator handle empty case
  }

  if (password !== confirmPassword) {
    return { kind: 'passwordMismatch' };
  }
  return null;
};

// In field config:
{
  key: 'confirmPassword',
  type: 'input',
  validators: [{ type: 'custom', functionName: 'passwordMatch' }],
  validationMessages: {
    passwordMismatch: 'Passwords do not match'
  }
}
```

## Async Validators (Resource-based)

Async validators use Angular's resource API for database lookups or complex async operations.

### Basic Example

```typescript
import { AsyncCustomValidator } from '@ng-forge/dynamic-forms';
import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { UserService } from './user.service';

const checkUsernameAvailable: AsyncCustomValidator = {
  // Extract params from field context
  params: (ctx) => ({ username: ctx.value() }),

  // Create resource with params signal
  factory: (params) => {
    const userService = inject(UserService);
    return rxResource({
      request: params,
      loader: ({ request }) => {
        if (!request?.username) return of(null);
        return userService.checkAvailability(request.username);
      },
    });
  },

  // Map result to validation error
  onSuccess: (result, ctx) => {
    if (!result) return null;
    return result.available ? null : { kind: 'usernameTaken' };
  },

  // Handle errors gracefully
  onError: (error, ctx) => {
    console.error('Availability check failed:', error);
    return null; // Don't block form on network errors
  },
};

const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      validators: [{ type: 'customAsync', functionName: 'checkUsernameAvailable' }],
      validationMessages: {
        usernameTaken: 'This username is already taken',
      },
    },
  ],
  customFnConfig: {
    asyncValidators: {
      checkUsernameAvailable,
    },
  },
};
```

**Key Benefits:**

- Automatic loading states via resource API
- Angular manages resource lifecycle
- Reactive - refetches when params change
- Integrates with Signal Forms validation state

### Structure

```typescript
interface AsyncCustomValidator<TValue, TParams, TResult> {
  // Function that receives field context and returns resource params
  readonly params: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => TParams;

  // Function that creates a ResourceRef from the params signal
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;

  // Map successful resource result to validation errors
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;

  // Handle resource errors
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}
```

## HTTP Validators

HTTP validators provide optimized HTTP validation with automatic request cancellation.

### Basic Example

```typescript
import { HttpCustomValidator } from '@ng-forge/dynamic-forms';

const checkEmailDomain: HttpCustomValidator = {
  // Build HTTP request from context
  request: (ctx) => {
    const email = ctx.value();
    if (!email?.includes('@')) return undefined; // Skip if invalid

    const domain = email.split('@')[1];
    return {
      url: `/api/validate-domain`,
      method: 'POST',
      body: { domain },
      headers: { 'Content-Type': 'application/json' },
    };
  },

  // NOTE: Inverted logic - onSuccess checks if response indicates INVALID
  // We're validating, not fetching data!
  onSuccess: (response, ctx) => {
    // Assuming API returns { valid: boolean }
    return response.valid ? null : { kind: 'invalidDomain' };
  },

  onError: (error, ctx) => {
    console.error('Domain validation failed:', error);
    return null; // Don't block form on network errors
  },
};

const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      validators: [{ type: 'customHttp', functionName: 'checkEmailDomain' }],
      validationMessages: {
        invalidDomain: 'This email domain is not allowed',
      },
    },
  ],
  customFnConfig: {
    httpValidators: {
      checkEmailDomain,
    },
  },
};
```

**Key Benefits:**

- Automatic request cancellation when field changes
- Built-in debouncing via resource API
- Prevents race conditions
- Optimized for HTTP-specific validation

**Important:** HTTP validators use "inverted logic" - `onSuccess` should return an error if validation fails, not if the HTTP request succeeds. You're checking validation status, not fetching data.

### Structure

```typescript
interface HttpCustomValidator<TValue, TResult> {
  // Build HTTP request from field context
  readonly request: (ctx: FieldContext<TValue>) => HttpResourceRequest | string | undefined;

  // Map successful response to validation error
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;

  // Handle HTTP errors
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

interface HttpResourceRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string | string[]>;
}
```

## Conditional Custom Validators

Apply validators conditionally using the `when` property with a `ConditionalExpression`:

```typescript
const businessEmailValidator: CustomValidator = (ctx) => {
  const value = ctx.value();
  const domain = value?.split('@')[1];

  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];

  if (domain && freeEmailDomains.includes(domain.toLowerCase())) {
    return { kind: 'requireBusinessEmail' };
  }
  return null;
};

const config = {
  fields: [
    {
      key: 'accountType',
      type: 'select',
      value: 'personal',
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' },
      ],
    },
    {
      key: 'email',
      type: 'input',
      validators: [
        {
          type: 'custom',
          functionName: 'businessEmailValidator',
          // Only apply when account type is "business"
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
      validationMessages: {
        requireBusinessEmail: 'Please use a business email address',
      },
    },
  ],
  customFnConfig: {
    validators: { businessEmailValidator },
  },
};
```

The validator is only active when the `when` condition evaluates to `true`, allowing dynamic validation based on form state. See [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for all expression types and operators.

## Common Validation Patterns

### Email Domain Validation

```typescript
const emailDomainValidator: CustomValidator = (ctx) => {
  const blockedDomains = ['tempmail.com', 'throwaway.email'];
  const email = ctx.value();
  const domain = email?.split('@')[1];

  if (domain && blockedDomains.includes(domain)) {
    return { kind: 'blockedDomain' };
  }
  return null;
};
```

### Age Validation

```typescript
const ageValidator: CustomValidator = (ctx) => {
  const birthDate = ctx.value();
  const age = calculateAge(birthDate);

  if (age < 18) {
    return { kind: 'tooYoung' };
  }
  return null;
};
```

### Conditional Required

```typescript
const conditionalRequiredValidator: CustomValidator = (ctx) => {
  const value = ctx.value();
  const employmentStatus = ctx.valueOf('employmentStatus');

  // Company name required if employed
  if (employmentStatus === 'employed' && !value) {
    return { kind: 'required' };
  }
  return null;
};
```

### Date Range Validation

```typescript
const dateRangeValidator: CustomValidator = (ctx) => {
  const endDate = ctx.value();
  const startDate = ctx.valueOf('startDate');

  if (startDate && endDate && startDate > endDate) {
    return { kind: 'invalidDateRange' };
  }
  return null;
};
```

## Multiple Errors

Validators can return multiple errors for cross-field validation:

```typescript
const validateDateRange: CustomValidator = (ctx) => {
  const errors: ValidationError[] = [];

  const startDate = ctx.valueOf('startDate');
  const endDate = ctx.valueOf('endDate');

  if (!startDate) errors.push({ kind: 'startDateRequired' });
  if (!endDate) errors.push({ kind: 'endDateRequired' });
  if (startDate && endDate && startDate > endDate) {
    errors.push({ kind: 'invalidDateRange' });
  }

  return errors.length > 0 ? errors : null;
};
```

## Validation Messages

### Field-Level Messages

```typescript
{
  key: 'username',
  validators: [{ type: 'custom', functionName: 'noSpaces' }],
  validationMessages: {
    noSpaces: 'Spaces are not allowed'
  }
}
```

### Form-Level Default Messages

```typescript
{
  defaultValidationMessages: {
    noSpaces: 'Spaces are not allowed',
    passwordMismatch: 'Passwords must match',
    usernameTaken: 'This username is already taken'
  },
  fields: [/* ... */]
}
```

### Dynamic Messages with i18n

```typescript
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

{
  key: 'username',
  validators: [{ type: 'custom', functionName: 'noSpaces' }],
  validationMessages: {
    noSpaces: inject(TranslateService).get('VALIDATION.NO_SPACES')
  }
}
```

### Parameterized Messages

Messages can interpolate params from ValidatorConfig using Angular template syntax (double curly braces around the param name).

**Syntax:** To interpolate a param, wrap its name in double curly braces (same syntax as Angular templates).

**Example:** To access `params.label`, write the param name `label` wrapped in double curly braces in your message string.

```typescript
{
  validators: [
    {
      type: 'custom',
      functionName: 'lessThanField',
      params: { field: 'minAge', label: 'Minimum Age' }
    }
  ],
  validationMessages: {
    // Interpolate params.label using double curly braces
    notLessThan: 'Must be less than {{label}}'
  }
}
```

The validation message will render as **"Must be less than Minimum Age"** by interpolating the `label` param value.

## Type Safety

All validator types are fully typed. While validators can optionally use generic type parameters for stricter typing, the simple form without generics works well for most cases:

```typescript
// Simple form - works for most cases
const noSpaces: CustomValidator = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' };
  }
  return null;
};

// With type parameter - for stricter typing (advanced)
const strictNoSpaces: CustomValidator<string> = (ctx) => {
  const value = ctx.value(); // Type: string
  // TypeScript knows value is always string
  return value.includes(' ') ? { kind: 'noSpaces' } : null;
};

// Async validators with type parameters (advanced)
const checkUsername: AsyncCustomValidator<string, { username: string }, { available: boolean }> = {
  params: (ctx) => ({ username: ctx.value() }),
  factory: (params) => {
    /* ... */
  },
  onSuccess: (result, ctx) => {
    result.available; // Type: boolean
    return result.available ? null : { kind: 'usernameTaken' };
  },
};

// HTTP validators with type parameters (advanced)
const checkDomain: HttpCustomValidator<string, { valid: boolean }> = {
  request: (ctx) => ({
    /* ... */
  }),
  onSuccess: (response, ctx) => {
    response.valid; // Type: boolean
    return response.valid ? null : { kind: 'invalidDomain' };
  },
};
```

**Note:** When registering validators in `customFnConfig.validators`, use the simple form without type parameters to avoid TypeScript compatibility issues.

## Best Practices

1. **Separation of Concerns**: Return only error `kind`, configure messages separately
2. **i18n Support**: Use Observable/Signal for validation messages
3. **Graceful Degradation**: Handle async/HTTP errors without blocking the form
4. **Cross-Field Validation**: Use `ctx.valueOf()` for accessing related fields
5. **Type Safety**: Leverage TypeScript generics for type-safe validation
6. **Message Priority**: Use field-level messages for customization, form-level for common errors
7. **Conditional Validation**: Use `when` property with `ConditionalExpression` for dynamic validators
8. **Inverted Logic**: HTTP validators check validity, not data fetching success

## Related Documentation

- [Validation Basics](../basics/) - Core validation concepts
- [Validation Reference](../reference/) - Standard validation rules
- [Type Safety](../../advanced/type-safety/basics/) - TypeScript integration
