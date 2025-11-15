# @ng-forge/dynamic-form

The core library for building type-safe, dynamic Angular forms with signal forms integration.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-form.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@ng-forge/dynamic-form` is a UI-agnostic core library that provides the foundation for building dynamic forms in Angular 21+. It integrates natively with Angular's signal forms architecture, providing a declarative API for form configuration with full type safety.

## Features

- ⚡ **Signal Forms Integration** - Native support for Angular 21's signal forms
- 🎯 **Type-Safe** - Full TypeScript support with intelligent autocomplete
- 🎨 **UI Agnostic** - Bring your own UI components or use official integrations
- ✅ **Validation** - Shorthand validators and complex validation logic
- 🎭 **Conditional Logic** - Dynamic field visibility and requirements
- 📦 **Field Types** - Groups, rows, pages for complex form layouts
- 🌍 **i18n Ready** - Support for Observables and Signals in labels and messages
- 🚀 **Performance** - Lazy loading, tree-shakeable, optimized
- 🔧 **Extensible** - Easy to create custom field types

## Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form
```

For a complete working setup, install with a UI integration:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

## Quick Start

### 1. Configure Providers

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

### 2. Create a Form

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-user-form',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class UserFormComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
      },
      {
        key: 'password',
        type: 'input',
        value: '',
        label: 'Password',
        required: true,
        minLength: 8,
        props: { type: 'password' },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Sign In',
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript infers: { email: string, password: string }
    console.log('Form submitted:', value);
  }
}
```

## Core Concepts

### Field Configuration

Every field in ng-forge is defined by a configuration object:

```typescript
interface FieldConfig {
  key: string; // Field identifier
  type: string; // Field type (input, select, checkbox, etc.)
  value?: any; // Initial value
  label?: DynamicText; // Field label (supports i18n)
  required?: boolean; // Shorthand for required validation
  disabled?: boolean; // Disable the field
  hidden?: boolean; // Hide the field
  props?: Record<string, unknown>; // UI-specific properties
  validators?: ValidatorConfig[]; // Advanced validation
  logic?: LogicConfig[]; // Conditional logic
  validationMessages?: ValidationMessages; // Custom error messages
}
```

### Signal Forms Mapping

ng-forge maps directly to Angular's signal forms API:

```typescript
// Your config
{ key: 'email', type: 'input', value: '', required: true, email: true }

// Becomes
import { required, email } from '@angular/forms/signals';
required(fieldPath);
email(fieldPath);
```

### Type Safety

Full TypeScript inference for form values:

```typescript
const config = {
  fields: [
    { key: 'age', type: 'input', value: 0, min: 18 },
    { key: 'name', type: 'input', value: '' },
    { key: 'active', type: 'checkbox', value: false },
  ],
} as const satisfies FormConfig;

// TypeScript knows: { age: number, name: string, active: boolean }
```

## Validation

### Shorthand Validators

Use simple field properties for common validation:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$',
}
```

### Advanced Validation

Use the `validators` array for complex scenarios:

```typescript
{
  key: 'discount',
  type: 'input',
  value: null,
  label: 'Discount',
  validators: [
    { type: 'required', errorMessage: 'Discount is required' },
    { type: 'min', value: 0, errorMessage: 'Cannot be negative' },
    {
      type: 'max',
      value: 100,
      when: {
        type: 'fieldValue',
        fieldPath: 'discountType',
        operator: 'equals',
        value: 'percentage',
      },
      errorMessage: 'Percentage cannot exceed 100%',
    },
  ],
}
```

### Custom Error Messages

Customize validation messages:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email is required',
    email: 'Please enter a valid email address',
  },
}
```

### Custom Validators

ng-forge supports three types of custom validators using Angular's Signal Forms API:

1. **CustomValidator** - Synchronous validators with access to FieldContext
2. **AsyncCustomValidator** - Async validators using Angular's resource API
3. **HttpCustomValidator** - HTTP-specific validators with automatic request cancellation

**Best Practice:** Validators should focus on validation logic, not presentation. Return ONLY the error `kind` and configure messages at field level for better i18n support and reusability.

**Message Resolution Priority (STRICT):**

1. Field-level `validationMessages[kind]` (highest - allows per-field customization)
2. Form-level `defaultValidationMessages[kind]` (fallback for common messages)
3. **No message configured = Warning logged + error NOT displayed to user**

**Important:** Validator-returned messages are NOT used as fallbacks. All error messages MUST be explicitly configured at field/form level. This enforces proper i18n patterns and separation of concerns.

#### 1. Synchronous Custom Validators

Custom validators receive the full `FieldContext` API from Angular Signal Forms, providing access to field state and other field values:

```typescript
import { CustomValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind, configure message at field level
const noSpaces: CustomValidator<string> = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' }; // No hardcoded message
  }
  return null;
};

// Register and configure message at field level
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
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

**FieldContext API** provides access to:

- `ctx.value()` - Current field value (signal)
- `ctx.state` - Field state (errors, touched, dirty, etc.)
- `ctx.valueOf(path)` - Access other field values (PUBLIC API for cross-field validation)
- `ctx.stateOf(path)` - Access other field states
- `ctx.field` - Current field tree

#### 2. Cross-Field Validation

Use `ctx.valueOf()` to access other field values for comparison validators:

```typescript
import { CustomValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind, configure message at field level
const lessThanField: CustomValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const otherFieldPath = params?.field as string;

  // Use valueOf() to access other field - PUBLIC API!
  const otherValue = ctx.valueOf(otherFieldPath as any);

  if (otherValue !== undefined && value >= otherValue) {
    return { kind: 'notLessThan' }; // No hardcoded message
  }
  return null;
};

// Use with parameters and parameterized message
const config = {
  fields: [
    { key: 'minAge', type: 'input', value: 0, label: 'Min Age' },
    {
      key: 'maxAge',
      type: 'input',
      value: 0,
      label: 'Max Age',
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
    validators: {
      lessThanField,
    },
  },
};
```

**Common Cross-Field Patterns:**

- Password confirmation matching
- Date range validation (start < end)
- Numeric range validation (min < max)
- Conditional required fields

#### 3. Async Validators (Resource-based)

Async validators use Angular's resource API for database lookups or complex async operations:

```typescript
import { AsyncCustomValidator } from '@ng-forge/dynamic-form';
import { resource } from '@angular/core';
import { inject } from '@angular/core';
import { UserService } from './user.service';

const checkUsernameAvailable: AsyncCustomValidator<string> = {
  // Extract params from field context
  params: (ctx) => ({ username: ctx.value() }),

  // Create resource with params signal
  factory: (params) => {
    const userService = inject(UserService);
    return resource({
      request: () => params(),
      loader: ({ request }) => {
        if (!request?.username) return Promise.resolve(null);
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

#### 4. HTTP Validators

HTTP validators provide optimized HTTP validation with automatic request cancellation:

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

**Important:** HTTP validators use "inverted logic" - `onSuccess` should return an error if validation fails, not if the HTTP request succeeds. You're checking validation status, not fetching data.

#### Conditional Custom Validators

Apply validators conditionally using the `condition` function:

```typescript
const businessEmailValidator: CustomValidator<string> = (ctx) => {
  const value = ctx.value();
  const domain = value?.split('@')[1];

  // Common free email domains to reject for business use
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
      value: '',
      label: 'Email',
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
    validators: {
      businessEmailValidator,
    },
  },
};
```

The validator is only active when the condition returns `true`, allowing dynamic validation based on form state.

## Conditional Logic

### Conditional Visibility

Show/hide fields based on form state:

```typescript
{
  key: 'businessTaxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }],
}
```

### Conditional Required

Make fields required conditionally:

```typescript
{
  key: 'companyName',
  type: 'input',
  value: '',
  label: 'Company Name',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    errorMessage: 'Company name required for business accounts',
  }],
}
```

## Field Types

### Container Fields

**Groups** - Organize fields into sections:

```typescript
{
  key: 'address',
  type: 'group',
  label: 'Address',
  fields: [
    { key: 'street', type: 'input', value: '', label: 'Street' },
    { key: 'city', type: 'input', value: '', label: 'City' },
  ],
}
```

**Rows** - Horizontal field layout:

```typescript
{
  key: 'name',
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', value: '', label: 'First Name' },
    { key: 'lastName', type: 'input', value: '', label: 'Last Name' },
  ],
}
```

**Pages** - Multi-step forms:

```typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Personal Info',
      fields: [
        { key: 'name', type: 'input', value: '', label: 'Name' },
        { type: 'next', key: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Contact Info',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email' },
        { type: 'previous', key: 'back', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Complete' },
      ],
    },
  ],
}
```

## Custom Field Types

Create your own field components:

```typescript
@Component({
  selector: 'app-custom-field',
  template: `
    @let f = field();

    <label>{{ label() }}</label>
    <input [field]="f" />
  `,
})
export class CustomFieldComponent {
  label = input<string>();
  field = input.required<FieldTree<string>>();
}

// Register it
provideDynamicForm([
  { name: 'custom', loadComponent: () => CustomFieldComponent }
]);

// Use it
{ key: 'myField', type: 'custom', value: '', label: 'Custom Field' }
```

## Event System

Handle form events with the event bus:

```typescript
// Define custom event
class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

// Listen for events
export class MyComponent {
  private eventBus = inject(EventBus);

  ngOnInit() {
    this.eventBus.on(SaveDraftEvent).subscribe(() => {
      console.log('Save draft clicked');
    });
  }
}

// Trigger from button
{
  type: 'button',
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
}
```

## i18n Support

Use Observables or Signals for translations:

```typescript
// With Observables (Transloco)
{
  key: 'email',
  type: 'input',
  value: '',
  label: this.transloco.selectTranslate('form.email'),
  validationMessages: {
    required: this.transloco.selectTranslate('validation.required'),
  },
}

// With Signals
{
  key: 'email',
  type: 'input',
  value: '',
  label: computed(() => this.translations().email),
  validationMessages: {
    required: computed(() => this.validationMessages().required),
  },
}
```

## UI Framework Integration

The core library is UI-agnostic. Use with official integrations:

### Material Design

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-material
```

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
provideDynamicForm(...withMaterialFields());
```

### Bootstrap

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-bootstrap
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-bootstrap
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-bootstrap
```

```typescript
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
provideDynamicForm(...withBootstrapFields());
```

### PrimeNG

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-primeng
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-primeng
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-primeng
```

```typescript
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
provideDynamicForm(...withPrimeNGFields());
```

### Ionic

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-ionic
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-ionic
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-ionic
```

```typescript
import { withIonicFields } from '@ng-forge/dynamic-form-ionic';
provideDynamicForm(...withIonicFields());
```

## API Reference

### Core Types

```typescript
// Form configuration
interface FormConfig {
  fields: FieldConfig[];
  schemas?: SchemaDefinition[];
  signalFormsConfig?: SignalFormsConfig;
}

// Signal forms configuration
interface SignalFormsConfig {
  migrateLegacyValidation?: boolean;
  customFunctions?: Record<string, CustomFunction>;
  validators?: Record<string, CustomValidator>;
  asyncValidators?: Record<string, AsyncCustomValidator>;
  httpValidators?: Record<string, HttpCustomValidator>;
  strictMode?: boolean;
}

// Validator configuration (discriminated union)
type ValidatorConfig = BuiltInValidatorConfig | CustomValidatorConfig | AsyncValidatorConfig | HttpValidatorConfig;

interface BuiltInValidatorConfig {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';
  value?: number | string | RegExp;
  expression?: string;
  errorMessage?: string;
  when?: ConditionalExpression;
}

interface CustomValidatorConfig {
  type: 'custom';
  functionName: string;
  params?: Record<string, unknown>;
  errorMessage?: string;
  when?: ConditionalExpression;
}

interface AsyncValidatorConfig {
  type: 'customAsync';
  functionName: string;
  params?: Record<string, unknown>;
  errorMessage?: string;
  when?: ConditionalExpression;
}

interface HttpValidatorConfig {
  type: 'customHttp';
  functionName: string;
  params?: Record<string, unknown>;
  errorMessage?: string;
  when?: ConditionalExpression;
}

// Custom validator function signatures
type CustomValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationError | ValidationError[] | null;

interface AsyncCustomValidator<TValue = unknown, TParams = unknown, TResult = unknown> {
  readonly params: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => TParams;
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

interface HttpCustomValidator<TValue = unknown, TResult = unknown> {
  readonly request: (ctx: FieldContext<TValue>) => HttpResourceRequest | string | undefined;
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

// Logic configuration
interface LogicConfig {
  type: 'hidden' | 'readonly' | 'required';
  condition: ConditionalExpression | boolean;
  errorMessage?: string;
}

// Conditional expression
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
    | 'startsWith'
    | 'endsWith'
    | 'matches';
  value?: unknown;
  expression?: string;
  conditions?: {
    logic: 'and' | 'or';
    expressions: ConditionalExpression[];
  };
}
```

### Core Functions

```typescript
// Provider function
function provideDynamicForm(...features: DynamicFormFeature[]): EnvironmentProviders;

// Schema registration
function withSchemas(schemas: SchemaDefinition[]): DynamicFormFeature;
```

## Documentation

**[📖 Full Documentation](https://ng-forge.github.io/ng-forge)**

- [Getting Started](https://ng-forge.github.io/ng-forge/getting-started)
- [Validation Guide](https://ng-forge.github.io/ng-forge/core/validation)
- [Conditional Logic Guide](https://ng-forge.github.io/ng-forge/core/conditional-logic)
- [Custom Field Types](https://ng-forge.github.io/ng-forge/custom-integrations/guide)
- [API Reference](https://ng-forge.github.io/ng-forge/api-reference)

## License

MIT © ng-forge

## Support

- 🐛 [Issue Tracker](https://github.com/ng-forge/ng-forge/issues)
- 💡 [Discussions](https://github.com/ng-forge/ng-forge/discussions)
- 📚 [Documentation](https://ng-forge.github.io/ng-forge)
