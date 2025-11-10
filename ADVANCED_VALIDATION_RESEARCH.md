# Advanced Validation Integration Research

**Date:** 2025-11-10
**Project:** ng-forge/dynamic-form
**Researcher:** Claude Code
**Objective:** Research and design integration of `validate`, `validateTree`, `validateAsync`, and `validateHttp` from Angular Signal Forms

---

## Executive Summary

This document outlines the research findings and implementation plan for integrating Angular's advanced Signal Forms validation APIs (`validate`, `validateTree`, `validateAsync`, `validateHttp`) into the ng-forge/dynamic-form library. These APIs will enable custom validation logic, cross-field validation, asynchronous validation, and HTTP-based validation while maintaining the library's JSON-driven configuration approach.

### Key Findings

| API             | Purpose                | Use Case                                            | Priority |
| --------------- | ---------------------- | --------------------------------------------------- | -------- |
| `validate`      | Custom validators      | Complex business logic, field-level custom rules    | HIGH     |
| `validateTree`  | Cross-field validation | Password confirmation, interdependent fields        | HIGH     |
| `validateAsync` | Async validation       | Database lookups, debounced checks                  | MEDIUM   |
| `validateHttp`  | HTTP validation        | Username/email availability, server-side validation | MEDIUM   |

---

## ✅ Verified API Signatures from Angular Source

**Source:** `node_modules/@angular/forms/types/signals.d.ts`
**Angular Version:** 21.0.0-next.10

### 1. `validate` - Custom Field Validator

**Actual Signature:**

```typescript
declare function validate<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<FieldValidator<TValue, TPathKind>>
): void;

// Where FieldValidator is defined as:
type FieldValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  ValidationResult<ValidationErrorWithoutField>,
  TPathKind
>;

// ValidationResult can be:
type ValidationResult<E extends ValidationError = ValidationError> = ValidationSuccess | OneOrMany<E>;

// ValidationError structure:
interface ValidationError {
  readonly kind: string;
  readonly message?: string;
}
```

**Key Details:**

- ✅ Takes `FieldPath<TValue, TPathKind>` - same as built-in validators
- ✅ Validator function is a `LogicFn` - receives `FieldContext<TValue, TPathKind>`
- ✅ Must return `ValidationErrorWithoutField` (cannot have `field` property)
- ✅ Returns `null` or `ValidationSuccess` when valid
- ✅ Can return single error or array of errors

### 2. `validateTree` - Cross-Field Validator

**Actual Signature:**

```typescript
declare function validateTree<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<TreeValidator<TValue, TPathKind>>
): void;

// Where TreeValidator is defined as:
type TreeValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<TValue, TreeValidationResult, TPathKind>;

// TreeValidationResult allows optional field targets:
type TreeValidationResult<E extends ValidationErrorWithOptionalField = ValidationErrorWithOptionalField> = ValidationSuccess | OneOrMany<E>;

interface ValidationErrorWithOptionalField extends ValidationError {
  readonly field?: FieldTree<unknown>;
}
```

**Key Details:**

- ✅ Same signature as `validate` but uses `TreeValidator` type
- ✅ Can return errors with `field` property to target specific child fields
- ✅ Applied at group or form level to validate multiple fields
- ✅ Errors without `field` apply to the path the validator is attached to

### 3. `validateAsync` - Asynchronous Validator

**Actual Signature:**

```typescript
declare function validateAsync<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>
): void;

interface AsyncValidatorOptions<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root> {
  // Function that receives field context and returns resource params
  readonly params: (ctx: FieldContext<TValue, TPathKind>) => TParams;

  // Function that creates a resource from params signal
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;

  // Optional error handler for resource errors
  readonly onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => OneOrMany<ValidationErrorWithOptionalField>;

  // Optional function to map successful result to errors
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
}
```

**Key Details:**

- ❗ Different API than expected - uses Angular's `resource` API, not raw Observables
- ✅ Separates param computation from resource creation
- ✅ Built-in loading state management via `ResourceRef`
- ✅ `onSuccess` maps result to validation errors (inverted logic - success can produce errors)
- ✅ `onError` handles resource errors (network failures, etc.)
- ⚠️ More complex than simple Observable/Promise approach

### 4. `validateHttp` - HTTP Resource Validator

**Actual Signature:**

```typescript
declare function validateHttp<TValue, TResult = unknown, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: HttpValidatorOptions<TValue, TResult, TPathKind>
): void;

interface HttpValidatorOptions<TValue, TResult, TPathKind extends PathKind = PathKind.Root> {
  // Function that returns URL or HttpResourceRequest
  readonly request:
    | ((ctx: FieldContext<TValue, TPathKind>) => string | undefined)
    | ((ctx: FieldContext<TValue, TPathKind>) => HttpResourceRequest | undefined);

  // Maps successful HTTP response to validation errors
  readonly onSuccess: MapToErrorsFn<TValue, TResult, TPathKind>;

  // Optional error handler for HTTP errors
  readonly onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => OneOrMany<ValidationErrorWithOptionalField>;
}

// Helper type for mapping results to errors
type MapToErrorsFn<TValue, TResult, TPathKind extends PathKind = PathKind.Root> = (
  result: TResult,
  ctx: FieldContext<TValue, TPathKind>
) => TreeValidationResult;

// HttpResourceRequest structure:
interface HttpResourceRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: HttpHeaders | Record<string, string | string[]>;
}
```

**Key Details:**

- ✅ Simplified wrapper around `validateAsync` for HTTP use cases
- ✅ Can accept simple URL string or full `HttpResourceRequest` object
- ✅ Automatically creates HTTP resource internally
- ✅ `onSuccess` required - maps HTTP response to validation errors
- ✅ `onError` optional - handles network/HTTP errors
- ⚠️ Also uses inverted logic (success handler returns errors)

### Important Differences from Initial Design

1. **Async Validation Uses Resources, Not Observables**

   - Angular 21's async validation is built on the new `resource` API
   - Must create `ResourceRef` instead of returning Observable/Promise
   - More complex but better integrated with Signal Forms lifecycle

2. **HTTP Validation Has Inverted Logic**

   - `onSuccess` maps successful HTTP responses to errors
   - Example: `{ available: false }` → `{ usernameTaken: true }`
   - Must always define `onSuccess` to handle the response

3. **Validation Errors Have Strict Typing**

   - Field validators: must use `ValidationErrorWithoutField` (no `field` property)
   - Tree validators: can use `ValidationErrorWithOptionalField` (optional `field`)
   - Type system enforces correct error structures

4. **No Direct Observable/Promise Support**
   - Must wrap async operations in `resource` API
   - Cannot simply return `Observable<ValidationError | null>`
   - Requires understanding of Angular's resource system

---

## Current Validation Architecture

### Existing Implementation

**Location:** `packages/dynamic-form/src/lib/core/validation/validator-factory.ts:9-80`

The current system supports:

- ✅ Built-in validators: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`
- ✅ Conditional validation with `when` logic
- ✅ Dynamic validator values with expressions
- ✅ Type-safe validator application to `FieldPath<TValue>`

**Configuration Model:** `packages/dynamic-form/src/lib/models/validation/validator-config.ts:6-21`

```typescript
export interface ValidatorConfig {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';
  value?: number | string | RegExp;
  expression?: string;
  errorMessage?: string;
  when?: ConditionalExpression;
}
```

### Integration Points

1. **Field Definition → Schema Builder** (`schema-builder.ts:12-55`)

   - Creates schema from field definitions
   - Delegates to `mapFieldToForm` for validation

2. **Field Mapping** (`form-mapping.ts:14-62`)

   - Applies validators via `applyValidator`
   - Supports nested field navigation
   - Handles page/row/group field patterns

3. **Validator Factory** (`validator-factory.ts:9-87`)
   - Switch-case pattern for validator types
   - Creates `LogicFn` for conditional validation
   - Type-safe field path casting

---

## Angular Signal Forms Validation APIs

### API 1: `validate` - Custom Validators

**Purpose:** Create custom validation logic with access to field context

**Expected Signature:**

```typescript
function validate<TValue, TError = unknown>(fieldPath: FieldPath<TValue>, validatorFn: LogicFn<TValue, TError | null>): void;
```

**Key Characteristics:**

- Receives `FieldContext<TValue>` parameter
- Returns error object or `null` if valid
- Can access field value via `ctx.value()`
- Can reference other fields via `ctx.root()`
- Synchronous execution

**Use Cases:**

- Complex business rules (e.g., "price must be 10% less than MSRP")
- Custom format validation (e.g., phone numbers, tax IDs)
- Calculated field validation (e.g., "total must equal sum of items")

### API 2: `validateTree` - Cross-Field Validation

**Purpose:** Validate multiple fields with access to entire form tree

**Expected Signature:**

```typescript
function validateTree<TModel, TErrors = Record<string, unknown>>(
  formTree: FieldTree<TModel>,
  validatorFn: (ctx: FieldContext<TModel>) => TErrors | null
): void;
```

**Key Characteristics:**

- Applied at form or group level
- Can return errors for multiple fields
- Error format: `{ fieldKey: errorObject }`
- Executes when any dependent field changes
- Can access entire model via context

**Use Cases:**

- Password confirmation matching
- Date range validation (start < end)
- Mutually exclusive field groups
- Total/subtotal calculations
- Cross-field dependencies (e.g., "if country = 'US', state is required")

### API 3: `validateAsync` - Asynchronous Validation

**Purpose:** Perform validation with async operations (Promises, Observables)

**Expected Signature:**

```typescript
function validateAsync<TValue, TError = unknown>(
  fieldPath: FieldPath<TValue>,
  validatorFn: (ctx: FieldContext<TValue>) => Observable<TError | null> | Promise<TError | null>
): void;
```

**Key Characteristics:**

- Returns Observable or Promise
- Sets field to "pending" state while validating
- Debounce recommended to avoid excessive calls
- Can be cancelled if field value changes
- Should handle errors gracefully

**Use Cases:**

- Database uniqueness checks (username, email)
- API validation calls
- File upload validation
- External service validation
- Rate-limited checks

### API 4: `validateHttp` - HTTP Resource Validation

**Purpose:** Simplified HTTP validation with built-in resource management

**Expected Signature:**

```typescript
function validateHttp<TValue, TError = unknown>(
  fieldPath: FieldPath<TValue>,
  config: {
    request: (value: TValue) => HttpRequest | ResourceRef;
    errors?: (response: unknown) => TError | null;
  }
): void;
```

**Key Characteristics:**

- Automatically manages HTTP resource lifecycle
- Built-in loading state management
- Configurable error mapping
- Optimized for REST API validation
- Handles request cancellation

**Use Cases:**

- Username/email availability checks
- Postal code validation via API
- Product SKU validation
- Server-side business rule validation
- Remote data validation

---

## JSON Configuration Design

### Extended ValidatorConfig Type

**New Type Definition:**

```typescript
export type ValidatorType =
  // Existing built-in validators
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  // New advanced validators
  | 'custom'
  | 'customTree'
  | 'async'
  | 'http';

export interface BaseValidatorConfig {
  /** Validator type identifier */
  type: ValidatorType;

  /** Custom error message */
  errorMessage?: string;

  /** Conditional logic for when validator applies */
  when?: ConditionalExpression;
}

export interface BuiltInValidatorConfig extends BaseValidatorConfig {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';

  /** Static value for the validator */
  value?: number | string | RegExp;

  /** Dynamic value expression */
  expression?: string;
}

export interface CustomValidatorConfig extends BaseValidatorConfig {
  type: 'custom';

  /** Function name registered in FunctionRegistryService */
  functionName: string;

  /** Optional parameters to pass to the validator function */
  params?: Record<string, unknown>;
}

export interface CustomTreeValidatorConfig extends BaseValidatorConfig {
  type: 'customTree';

  /** Function name for cross-field validation */
  functionName: string;

  /** Field keys that should receive errors from this validator */
  targetFields?: string[];

  /** Optional parameters */
  params?: Record<string, unknown>;
}

export interface AsyncValidatorConfig extends BaseValidatorConfig {
  type: 'async';

  /** Function name that returns Observable or Promise */
  functionName: string;

  /** Debounce time in milliseconds (default: 300) */
  debounceTime?: number;

  /** Optional parameters */
  params?: Record<string, unknown>;
}

export interface HttpValidatorConfig extends BaseValidatorConfig {
  type: 'http';

  /** HTTP validation configuration */
  http: {
    /** URL template (can use field value: /api/check-username/{value}) */
    url: string;

    /** HTTP method (default: GET) */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH';

    /** Request body template (for POST/PUT/PATCH) */
    body?: Record<string, unknown>;

    /** Function name to map response to error */
    errorMapper?: string;

    /** Debounce time in milliseconds (default: 500) */
    debounceTime?: number;
  };
}

export type ValidatorConfig =
  | BuiltInValidatorConfig
  | CustomValidatorConfig
  | CustomTreeValidatorConfig
  | AsyncValidatorConfig
  | HttpValidatorConfig;
```

### JSON Configuration Examples

#### Example 1: Custom Validator

```json
{
  "key": "price",
  "type": "number",
  "validators": [
    {
      "type": "custom",
      "functionName": "lessThanMsrp",
      "params": {
        "percentage": 10
      },
      "errorMessage": "Price must be at least 10% less than MSRP"
    }
  ]
}
```

**Registered Function:**

```typescript
functionRegistry.registerValidator('lessThanMsrp', (ctx, params) => {
  const price = ctx.value();
  const msrp = ctx.root().msrp?.value();
  const percentage = params.percentage || 0;

  if (msrp && price >= msrp * (1 - percentage / 100)) {
    return { lessThanMsrp: { msrp, price, requiredDiscount: percentage } };
  }
  return null;
});
```

#### Example 2: Cross-Field Validation (Password Confirmation)

```json
{
  "key": "password",
  "type": "password",
  "validators": [
    { "type": "required" },
    { "type": "minLength", "value": 8 }
  ]
},
{
  "key": "confirmPassword",
  "type": "password",
  "validators": [
    { "type": "required" },
    {
      "type": "custom",
      "functionName": "matchesPassword",
      "errorMessage": "Passwords must match"
    }
  ]
}
```

**Alternative: Tree-Level Validation**

```json
{
  "type": "group",
  "fields": [
    { "key": "password", "type": "password" },
    { "key": "confirmPassword", "type": "password" }
  ],
  "validators": [
    {
      "type": "customTree",
      "functionName": "passwordsMatch",
      "targetFields": ["confirmPassword"],
      "errorMessage": "Passwords must match"
    }
  ]
}
```

#### Example 3: Async Username Validation

```json
{
  "key": "username",
  "type": "text",
  "validators": [
    { "type": "required" },
    { "type": "minLength", "value": 3 },
    {
      "type": "async",
      "functionName": "checkUsernameAvailability",
      "debounceTime": 500,
      "errorMessage": "Username is already taken"
    }
  ]
}
```

**Registered Function:**

```typescript
// Note: Async validators use the resource API, not plain Observables
functionRegistry.registerAsyncValidator('checkUsernameAvailability', {
  params: (ctx) => ({ username: ctx.value() }),
  factory: (params) =>
    resource({
      request: () => {
        const p = params();
        return p ? { url: `/api/users/check-username/${p.username}` } : undefined;
      },
    }),
  onSuccess: (result, ctx) => {
    return result.available ? null : { kind: 'usernameTaken', message: 'Username is already taken' };
  },
  onError: (error, ctx) => {
    console.error('Username check failed:', error);
    return null; // Ignore errors, don't block form
  },
});
```

#### Example 4: HTTP Validation

```json
{
  "key": "email",
  "type": "email",
  "validators": [
    { "type": "required" },
    { "type": "email" },
    {
      "type": "http",
      "http": {
        "url": "/api/users/check-email/{value}",
        "method": "GET",
        "debounceTime": 500,
        "errorMapper": "mapEmailCheckResponse"
      },
      "errorMessage": "Email is already registered"
    }
  ]
}
```

#### Example 5: Date Range Validation

```json
{
  "type": "group",
  "key": "eventDates",
  "fields": [
    { "key": "startDate", "type": "date" },
    { "key": "endDate", "type": "date" }
  ],
  "validators": [
    {
      "type": "customTree",
      "functionName": "validateDateRange",
      "targetFields": ["endDate"],
      "errorMessage": "End date must be after start date"
    }
  ]
}
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (High Priority)

#### 1.1 Extend Type Definitions

**File:** `packages/dynamic-form/src/lib/models/validation/validator-config.ts`

**Tasks:**

- Add new validator type unions
- Create specific config interfaces for each validator type
- Maintain backward compatibility with existing `ValidatorConfig`

#### 1.2 Create Function Registry for Custom Validators

**New File:** `packages/dynamic-form/src/lib/core/validation/custom-validator-registry.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { Observable } from 'rxjs';

// Sync validator function type
export type CustomValidatorFn<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationResult<ValidationErrorWithoutField>;

// Tree validator function type
export type TreeValidatorFn<TModel = unknown> = (ctx: FieldContext<TModel>, params?: Record<string, unknown>) => TreeValidationResult;

// Async validator options type - matches Angular's API
export interface AsyncValidatorOptions<TParams = unknown, TResult = unknown> {
  params: (ctx: FieldContext<unknown>, config?: Record<string, unknown>) => TParams;
  factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;
  onSuccess?: (result: TResult, ctx: FieldContext<unknown>) => TreeValidationResult;
  onError?: (error: unknown, ctx: FieldContext<unknown>) => TreeValidationResult;
}

@Injectable({ providedIn: 'root' })
export class CustomValidatorRegistryService {
  private customValidators = new Map<string, CustomValidatorFn>();
  private asyncValidators = new Map<string, AsyncValidatorOptions>();
  private treeValidators = new Map<string, TreeValidatorFn>();

  registerValidator(name: string, fn: CustomValidatorFn): void {
    this.customValidators.set(name, fn);
  }

  registerAsyncValidator(name: string, opts: AsyncValidatorOptions): void {
    this.asyncValidators.set(name, opts);
  }

  registerTreeValidator(name: string, fn: TreeValidatorFn): void {
    this.treeValidators.set(name, fn);
  }

  getValidator(name: string): CustomValidatorFn | undefined {
    return this.customValidators.get(name);
  }

  getAsyncValidator(name: string): AsyncValidatorOptions | undefined {
    return this.asyncValidators.get(name);
  }

  getTreeValidator(name: string): TreeValidatorFn | undefined {
    return this.treeValidators.get(name);
  }
}
```

#### 1.3 Extend Validator Factory

**File:** `packages/dynamic-form/src/lib/core/validation/validator-factory.ts`

**Add new cases to `applyValidator` function:**

```typescript
import { validate } from '@angular/forms/signals';
import { inject } from '@angular/core';
import { CustomValidatorRegistryService } from './custom-validator-registry.service';

export function applyValidator<TValue>(config: ValidatorConfig, fieldPath: FieldPath<TValue>): void {
  switch (config.type) {
    // ... existing cases ...

    case 'custom':
      applyCustomValidator(config as CustomValidatorConfig, fieldPath);
      break;

    case 'async':
      applyAsyncValidator(config as AsyncValidatorConfig, fieldPath);
      break;

    case 'http':
      applyHttpValidator(config as HttpValidatorConfig, fieldPath);
      break;

    // Note: customTree is handled at the group/form level, not field level
  }
}

function applyCustomValidator<TValue>(config: CustomValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(CustomValidatorRegistryService);
  const validatorFn = registry.getValidator(config.functionName);

  if (!validatorFn) {
    console.warn(`Custom validator "${config.functionName}" not found in registry`);
    return;
  }

  const wrappedValidator = (ctx: FieldContext<TValue>) => {
    return validatorFn(ctx, config.params);
  };

  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    validate(fieldPath, wrappedValidator, { when: whenLogic });
  } else {
    validate(fieldPath, wrappedValidator);
  }
}
```

### Phase 2: Advanced Validators (Medium Priority)

#### 2.1 Async Validation Support

**New File:** `packages/dynamic-form/src/lib/core/validation/async-validator-factory.ts`

```typescript
import { validateAsync } from '@angular/forms/signals';
import { inject } from '@angular/core';
import { resource, ResourceRef, Signal } from '@angular/core';
import { CustomValidatorRegistryService, AsyncValidatorOptions as CustomAsyncOptions } from './custom-validator-registry.service';

export function applyAsyncValidator<TValue>(config: AsyncValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(CustomValidatorRegistryService);
  const validatorOpts = registry.getAsyncValidator(config.functionName);

  if (!validatorOpts) {
    console.warn(`Async validator "${config.functionName}" not found in registry`);
    return;
  }

  // Wrap the custom validator options with the Angular API
  const angularOpts = {
    params: (ctx: FieldContext<TValue>) => {
      return validatorOpts.params(ctx, config.params);
    },
    factory: (params: Signal<unknown | undefined>) => {
      return validatorOpts.factory(params);
    },
    onSuccess: validatorOpts.onSuccess ? (result: unknown, ctx: FieldContext<TValue>) => validatorOpts.onSuccess!(result, ctx) : undefined,
    onError: validatorOpts.onError ? (error: unknown, ctx: FieldContext<TValue>) => validatorOpts.onError!(error, ctx) : undefined,
  };

  validateAsync(fieldPath, angularOpts);
}
```

#### 2.2 HTTP Validation Support

**New File:** `packages/dynamic-form/src/lib/core/validation/http-validator-factory.ts`

```typescript
import { validateHttp } from '@angular/forms/signals';
import { inject } from '@angular/core';
import { CustomValidatorRegistryService } from './custom-validator-registry.service';

export function applyHttpValidator<TValue>(config: HttpValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(CustomValidatorRegistryService);

  // Build request function based on config
  const requestFn = (ctx: FieldContext<TValue>) => {
    const value = ctx.value();

    // Replace {value} placeholder in URL
    const url = config.http.url.replace('{value}', encodeURIComponent(String(value)));

    // Return undefined if value is empty (skip validation)
    if (!value) {
      return undefined;
    }

    // Return simple URL string or full HttpResourceRequest
    if (config.http.method === 'GET' || !config.http.method) {
      return url;
    }

    return {
      url,
      method: config.http.method,
      body: config.http.body || { value },
    };
  };

  // Get the error mapper function if specified
  const errorMapperFn = config.http.errorMapper ? registry.getValidator(config.http.errorMapper) : undefined;

  const httpConfig = {
    request: requestFn,
    onSuccess: (result: unknown, ctx: FieldContext<TValue>) => {
      // Use custom error mapper if provided, otherwise assume result indicates validity
      if (errorMapperFn) {
        return errorMapperFn({ value: () => result } as any, config.params);
      }

      // Default behavior: if result has an 'errors' property, return it
      if (result && typeof result === 'object' && 'errors' in result) {
        return result.errors as any;
      }

      // If result is falsy or result.valid === false, return error
      if (!result || (typeof result === 'object' && 'valid' in result && !result.valid)) {
        return { kind: 'httpValidation', message: config.errorMessage };
      }

      return null; // Valid
    },
    onError: (error: unknown, ctx: FieldContext<TValue>) => {
      // Log error but don't block form submission
      console.error(`HTTP validation error for field:`, error);
      return null;
    },
  };

  validateHttp(fieldPath, httpConfig);
}
```

#### 2.3 Tree Validation Support

**File:** `packages/dynamic-form/src/lib/core/form-mapping.ts`

**Modify `mapGroupFieldToForm` to support tree validators:**

```typescript
function mapGroupFieldToForm<TValue>(groupField: FieldDef<any>, fieldPath: FieldPath<TValue>): void {
  if (!isGroupField(groupField) || !groupField.fields) {
    return;
  }

  // Apply tree-level validators first
  const validationField = groupField as FieldDef<any> & FieldWithValidation;
  if (validationField.validators) {
    const treeValidators = validationField.validators.filter((v) => v.type === 'customTree');
    treeValidators.forEach((config) => {
      applyTreeValidator(config as CustomTreeValidatorConfig, fieldPath);
    });
  }

  // Then apply child field validations
  const fields = groupField.fields as FieldDef<any>[];
  for (const childField of fields) {
    // ... existing code ...
  }
}

function applyTreeValidator<TValue>(config: CustomTreeValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(CustomValidatorRegistryService);
  const validatorFn = registry.getTreeValidator(config.functionName);

  if (!validatorFn) {
    console.warn(`Tree validator "${config.functionName}" not found in registry`);
    return;
  }

  const wrappedValidator = (ctx: FieldContext<TValue>) => {
    return validatorFn(ctx, config.params);
  };

  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    validateTree(fieldPath, wrappedValidator, { when: whenLogic });
  } else {
    validateTree(fieldPath, wrappedValidator);
  }
}
```

### Phase 3: Documentation & Testing

#### 3.1 User Documentation

**New File:** `packages/dynamic-form/docs/advanced-validation.md`

Topics to cover:

- Overview of advanced validation features
- Registering custom validators
- JSON configuration examples
- Best practices
- Performance considerations
- Error handling

#### 3.2 Integration Tests

**New File:** `packages/dynamic-form/src/lib/testing/integration/advanced-validation.integration.spec.ts`

Test cases:

- Custom validators with field context access
- Cross-field validation with validateTree
- Async validators with debouncing
- HTTP validators with resource management
- Conditional advanced validators
- Error message customization
- Performance with multiple async validators

---

## Usage Examples

### Example 1: Setting Up Custom Validators

```typescript
import { ApplicationConfig } from '@angular/core';
import { CustomValidatorRegistryService } from '@ng-forge/dynamic-form';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers ...
  ],
};

// In component or service initialization
export class AppComponent implements OnInit {
  constructor(private validatorRegistry: CustomValidatorRegistryService) {}

  ngOnInit() {
    // Register custom validators
    this.validatorRegistry.registerValidator('lessThanMsrp', (ctx, params) => {
      const price = ctx.value();
      const msrp = ctx.root().msrp?.value();
      const percentage = params?.percentage || 0;

      if (msrp && price >= msrp * (1 - percentage / 100)) {
        return {
          lessThanMsrp: {
            msrp,
            price,
            requiredDiscount: percentage,
          },
        };
      }
      return null;
    });

    // Register tree validators
    this.validatorRegistry.registerTreeValidator('passwordsMatch', (ctx) => {
      const password = ctx.password?.value();
      const confirmPassword = ctx.confirmPassword?.value();

      if (password && confirmPassword && password !== confirmPassword) {
        return { confirmPassword: { passwordMismatch: true } };
      }
      return null;
    });

    // Register async validators
    this.validatorRegistry.registerAsyncValidator('checkUsername', (ctx) => {
      const username = ctx.value();
      return this.http.get(`/api/check-username/${username}`).pipe(map((res) => (res.available ? null : { usernameTaken: true })));
    });
  }
}
```

### Example 2: Complex Form with Advanced Validation

```json
{
  "fields": [
    {
      "key": "username",
      "type": "text",
      "label": "Username",
      "validators": [
        { "type": "required" },
        { "type": "minLength", "value": 3 },
        { "type": "maxLength", "value": 20 },
        { "type": "pattern", "value": "^[a-zA-Z0-9_]+$" },
        {
          "type": "async",
          "functionName": "checkUsernameAvailability",
          "debounceTime": 500
        }
      ]
    },
    {
      "key": "email",
      "type": "email",
      "label": "Email",
      "validators": [
        { "type": "required" },
        { "type": "email" },
        {
          "type": "http",
          "http": {
            "url": "/api/users/validate-email",
            "method": "POST",
            "body": { "email": "{value}" },
            "errorMapper": "mapEmailValidationResponse",
            "debounceTime": 500
          }
        }
      ]
    },
    {
      "type": "group",
      "key": "security",
      "fields": [
        {
          "key": "password",
          "type": "password",
          "label": "Password",
          "validators": [
            { "type": "required" },
            { "type": "minLength", "value": 8 },
            {
              "type": "custom",
              "functionName": "strongPassword",
              "errorMessage": "Password must contain uppercase, lowercase, number, and special character"
            }
          ]
        },
        {
          "key": "confirmPassword",
          "type": "password",
          "label": "Confirm Password",
          "validators": [{ "type": "required" }]
        }
      ],
      "validators": [
        {
          "type": "customTree",
          "functionName": "passwordsMatch",
          "targetFields": ["confirmPassword"]
        }
      ]
    },
    {
      "type": "group",
      "key": "pricing",
      "fields": [
        { "key": "msrp", "type": "number", "label": "MSRP" },
        {
          "key": "price",
          "type": "number",
          "label": "Sale Price",
          "validators": [
            {
              "type": "custom",
              "functionName": "lessThanMsrp",
              "params": { "percentage": 10 }
            }
          ]
        }
      ]
    },
    {
      "type": "group",
      "key": "eventDates",
      "fields": [
        { "key": "startDate", "type": "date", "label": "Start Date" },
        { "key": "endDate", "type": "date", "label": "End Date" }
      ],
      "validators": [
        {
          "type": "customTree",
          "functionName": "validateDateRange",
          "targetFields": ["endDate"]
        }
      ]
    }
  ]
}
```

---

## Best Practices & Guidelines

### Custom Validators

1. **Keep validators pure** - Avoid side effects in validator functions
2. **Use descriptive error objects** - Include relevant context in error data
3. **Type safety** - Leverage TypeScript generics for type-safe validators
4. **Reusability** - Design validators to be reusable across different forms
5. **Error messages** - Provide clear, user-friendly error messages

### Async Validators

1. **Debouncing** - Always use debounce for user input (300-500ms recommended)
2. **Error handling** - Gracefully handle network errors, don't block form
3. **Cancellation** - Use `switchMap` to cancel previous requests
4. **Loading state** - Leverage `pending()` signal for UI feedback
5. **Rate limiting** - Consider API rate limits when designing async validators

### Tree Validators

1. **Minimal dependencies** - Only access fields that affect validation
2. **Error placement** - Return errors for the most relevant field
3. **Performance** - Be mindful that tree validators run when any dependency changes
4. **Clear intent** - Document which fields are validated together

### HTTP Validators

1. **Endpoint design** - Create dedicated validation endpoints
2. **Response format** - Use consistent response structure
3. **Caching** - Consider server-side caching for common checks
4. **Security** - Don't leak sensitive information in validation responses
5. **Fallback** - Provide client-side validation as first line of defense

---

## Migration Path

### For Existing Applications

1. **Backward Compatible** - All changes are additive, existing validators continue to work
2. **Gradual Adoption** - Migrate complex validations one at a time
3. **Testing** - Thoroughly test migrated validators
4. **Documentation** - Update form configuration documentation

### Migration Steps

1. Register custom validator functions in app initialization
2. Update JSON configurations to use new validator types
3. Test validation behavior
4. Update error message handling if needed
5. Remove any workaround code that's no longer needed

---

## Open Questions & Decisions Needed

### 1. HttpClient Injection Strategy

**Question:** How should `HttpClient` be injected for HTTP validators?

**Options:**

- A) Inject in validator factory (current approach)
- B) Require HTTP service in custom validator registry
- C) Pass HTTP client as config option to dynamic form

**Recommendation:** Option A - inject in factory for simplicity

### 2. Error Message Localization

**Question:** How should error messages from custom validators be localized?

**Options:**

- A) Use existing translation system with error codes
- B) Allow custom validators to return translation keys
- C) Separate error message registry

**Recommendation:** Option B - validators return keys, translation handles the rest

### 3. Validator Function Serialization

**Question:** Should we support serializing validator functions from API?

**Options:**

- A) No - functions must be registered client-side (current approach)
- B) Yes - use safe eval with restricted scope
- C) Yes - support expression language for simple validators

**Recommendation:** Option A for security, Option C as future enhancement

### 4. Tree Validator Error Distribution

**Question:** How should tree validators distribute errors to multiple fields?

**Options:**

- A) Return `{ fieldKey: errorObject }` (Angular default)
- B) Return array of `{ field, error }` objects
- C) Support both formats

**Recommendation:** Option A - follow Angular convention

---

## Success Criteria

- [ ] `validate` API integrated and tested
- [ ] `validateTree` API integrated and tested
- [ ] `validateAsync` API integrated and tested
- [ ] `validateHttp` API integrated and tested
- [ ] Custom validator registry service implemented
- [ ] Extended `ValidatorConfig` types defined
- [ ] Backward compatibility maintained
- [ ] Integration tests passing
- [ ] Documentation completed
- [ ] Example configurations provided
- [ ] Best practices documented
- [ ] Migration guide created

---

## Next Steps

1. **Wait for npm install completion** to access Angular type definitions
2. **Verify API signatures** against @angular/forms/signals types
3. **Update type definitions** based on actual Angular API
4. **Implement Phase 1** (core infrastructure)
5. **Create proof of concept** with simple custom validator
6. **Test integration** with existing form system
7. **Iterate based on findings**

---

## References

- Angular Signal Forms (web search results)
- Current validation implementation: `packages/dynamic-form/src/lib/core/validation/`
- Field context registry: `packages/dynamic-form/src/lib/core/registry/field-context-registry.service.ts`
- Existing logic functions: `packages/dynamic-form/src/lib/core/expressions/logic-function-factory.ts`

---

---

## Summary of Findings

### Key Discoveries

1. **API Signatures Verified** ✅

   - All four advanced validation APIs have been verified against Angular 21.0.0-next.10 source code
   - Actual signatures differ from initial assumptions in important ways
   - Type definitions are stricter than expected, enforcing better error handling patterns

2. **Resource API Required for Async Validation** ⚠️

   - `validateAsync` and `validateHttp` use Angular's new `resource` API
   - Cannot use raw Observables or Promises directly
   - More complex but better integrated with Signal Forms lifecycle
   - Provides automatic loading state management

3. **Inverted Validation Logic** ⚠️

   - HTTP validators use `onSuccess` to map successful responses to errors
   - Counter-intuitive but allows flexible error mapping
   - Example: `{ available: false }` response → `{ usernameTaken: true }` error

4. **Strict Error Typing** ✅

   - Field validators must use `ValidationErrorWithoutField`
   - Tree validators can use `ValidationErrorWithOptionalField`
   - Type system prevents incorrect error structures

5. **Integration Strategy Defined** ✅
   - JSON configuration schema designed
   - Phased implementation plan created
   - Backward compatibility maintained
   - Custom validator registry pattern established

### Implementation Complexity Assessment

| Feature         | Complexity | Reason                                         |
| --------------- | ---------- | ---------------------------------------------- |
| `validate`      | LOW        | Simple wrapper around existing patterns        |
| `validateTree`  | MEDIUM     | Requires understanding of error distribution   |
| `validateAsync` | HIGH       | Must understand Angular resource API           |
| `validateHttp`  | MEDIUM     | Wrapper around `validateAsync`, inverted logic |

### Recommended Implementation Order

1. **Phase 1:** `validate` (custom field validators)

   - Most straightforward
   - Enables basic custom validation
   - Builds foundation for registry system

2. **Phase 2:** `validateTree` (cross-field validation)

   - Common use case (password matching, date ranges)
   - Moderate complexity
   - High user value

3. **Phase 3:** `validateHttp` (HTTP validation)

   - Specific use case but high value
   - Leverages Angular's built-in resource management
   - Easier than full async validation

4. **Phase 4:** `validateAsync` (general async validation)
   - Most complex
   - Covers advanced use cases
   - Can be deferred if `validateHttp` covers most needs

### Breaking Changes from Initial Design

1. **Async Validator Registry**

   - Cannot register simple functions returning Observables
   - Must register `AsyncValidatorOptions` objects
   - Requires `params`, `factory`, `onSuccess` structure

2. **HTTP Configuration**

   - No automatic debouncing (must implement in JSON config)
   - `onSuccess` required, not optional
   - Response mapping more complex than expected

3. **Error Objects**
   - Must include `kind` property (error identifier)
   - `message` is optional
   - Cannot include `field` property for field validators

### Next Steps

1. ✅ Research complete - API signatures verified
2. ⏭️ Create proof-of-concept with `validate`
3. ⏭️ Test integration with existing form system
4. ⏭️ Implement Phase 1 (custom validators)
5. ⏭️ Document usage patterns
6. ⏭️ Create integration tests
7. ⏭️ Plan Phase 2 implementation

---

**Research Status:** ✅ COMPLETE
**Last Updated:** 2025-11-10
**Next Action:** Create proof-of-concept implementation
**Verified Against:** Angular Forms 21.0.0-next.10
