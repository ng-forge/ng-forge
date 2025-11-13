---
title: Custom Validators
route: custom-validators
keyword: ValidationCustomValidatorsPage
---

Custom validation functions for complex validation logic that goes beyond built-in validators.

## Overview

ng-forge supports three types of custom validators using Angular's Signal Forms API:

1. **CustomValidator** - Synchronous validators with access to FieldContext
2. **AsyncCustomValidator** - Async validators using Angular's resource API
3. **HttpCustomValidator** - HTTP-specific validators with automatic request cancellation

**Key Principle:** Validators should focus on validation logic, NOT presentation. Return only the error `kind` and configure messages at field level for proper i18n support.

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

## Synchronous Custom Validators

Best for validation that needs field value and access to other fields via FieldContext.

### Basic Example

```typescript
import { CustomValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind
const noSpaces: CustomValidator<string> = (ctx) => {
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
  signalFormsConfig: {
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
import { CustomValidator } from '@ng-forge/dynamic-form';

const lessThanField: CustomValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const otherFieldPath = params?.field as string;

  // Use valueOf() to access other field - PUBLIC API!
  const otherValue = ctx.valueOf(otherFieldPath as any);

  if (otherValue !== undefined && value >= otherValue) {
    return { kind: 'notLessThan' };
  }
  return null;
};

// Use with parameters and parameterized message
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
          functionName: 'lessThanField',
          params: { field: 'minAge' },
        },
      ],
      validationMessages: {
        notLessThan: 'Must be less than {{field}}', // Interpolates params
      },
    },
  ],
  signalFormsConfig: {
    validators: { lessThanField },
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
const passwordMatch: CustomValidator<string> = (ctx) => {
  const confirmPassword = ctx.value();
  const password = ctx.valueOf('password' as any);

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
import { AsyncCustomValidator } from '@ng-forge/dynamic-form';
import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserService } from './user.service';

const checkUsernameAvailable: AsyncCustomValidator<string> = {
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
  signalFormsConfig: {
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
import { HttpCustomValidator } from '@ng-forge/dynamic-form';

const checkEmailDomain: HttpCustomValidator<string> = {
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
  signalFormsConfig: {
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

Apply validators conditionally using the `condition` function:

```typescript
const businessEmailValidator: CustomValidator<string> = (ctx) => {
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
          condition: (config, formValue) => formValue?.accountType === 'business',
        },
      ],
      validationMessages: {
        requireBusinessEmail: 'Please use a business email address',
      },
    },
  ],
  signalFormsConfig: {
    validators: { businessEmailValidator },
  },
};
```

The validator is only active when the condition returns `true`, allowing dynamic validation based on form state.

## Common Validation Patterns

### Email Domain Validation

```typescript
const emailDomainValidator: CustomValidator<string> = (ctx) => {
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
const ageValidator: CustomValidator<Date> = (ctx) => {
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
  const employmentStatus = ctx.valueOf('employmentStatus' as any);

  // Company name required if employed
  if (employmentStatus === 'employed' && !value) {
    return { kind: 'required' };
  }
  return null;
};
```

### Date Range Validation

```typescript
const dateRangeValidator: CustomValidator<Date> = (ctx) => {
  const endDate = ctx.value();
  const startDate = ctx.valueOf('startDate' as any);

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

  const startDate = ctx.valueOf('startDate' as any);
  const endDate = ctx.valueOf('endDate' as any);

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

Messages can use params from ValidatorConfig:

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
    notLessThan: 'Must be less than {{label}}' // Uses params.label
  }
}
```

## Type Safety

All validator types are fully typed:

```typescript
// Type-safe value access
const noSpaces: CustomValidator<string> = (ctx) => {
  const value = ctx.value(); // Type: string
  // ...
};

// Type-safe async validator
const checkUsername: AsyncCustomValidator<string, { username: string }, { available: boolean }> = {
  params: (ctx) => ({ username: ctx.value() }), // Type-safe params
  factory: (params) => {
    /* ... */
  },
  onSuccess: (result, ctx) => {
    result.available; // Type: boolean
    // ...
  },
};

// Type-safe HTTP validator
const checkDomain: HttpCustomValidator<string, { valid: boolean }> = {
  request: (ctx) => ({
    /* ... */
  }),
  onSuccess: (response, ctx) => {
    response.valid; // Type: boolean
    // ...
  },
};
```

## Best Practices

1. **Separation of Concerns**: Return only error `kind`, configure messages separately
2. **i18n Support**: Use Observable/Signal for validation messages
3. **Graceful Degradation**: Handle async/HTTP errors without blocking the form
4. **Cross-Field Validation**: Use `ctx.valueOf()` for accessing related fields
5. **Type Safety**: Leverage TypeScript generics for type-safe validation
6. **Message Priority**: Use field-level messages for customization, form-level for common errors
7. **Conditional Validation**: Use `condition` function for dynamic validators
8. **Inverted Logic**: HTTP validators check validity, not data fetching success

## Migration from Legacy API

If you're migrating from the old API:

**Old API:**

```typescript
// SimpleCustomValidator
const old: SimpleCustomValidator<string> = (value, formValue) => { /* ... */ };

// ContextAwareValidator
const old: ContextAwareValidator<string> = (ctx, params) => { /* ... */ };

// TreeValidator
const old: TreeValidator = (ctx, params) => { /* ... */ };

// Registration
signalFormsConfig: {
  simpleValidators: { old },
  contextValidators: { old },
  treeValidators: { old }
}
```

**New API:**

```typescript
// Unified CustomValidator (has access to FieldContext)
const new: CustomValidator<string> = (ctx, params) => {
  const value = ctx.value();
  const otherValue = ctx.valueOf('otherField' as any);
  // ...
};

// Registration
signalFormsConfig: {
  validators: { new }
}
```

The new `CustomValidator` type unifies all three old types and always provides access to the full `FieldContext` API.

## Related Documentation

- [Validation Basics](./basics) - Core validation concepts
- [Built-in Validators](./built-in) - Standard validation rules
- [Type Safety](../../type-safety/basics) - TypeScript integration
