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

ng-forge supports three levels of custom validators to handle any validation scenario:

#### 1. Simple Validators

Simple validators receive the field value and entire form value. Perfect for basic validation logic:

```typescript
import { SimpleCustomValidator } from '@ng-forge/dynamic-form';

const noSpaces: SimpleCustomValidator<string> = (value, formValue) => {
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces', message: 'Spaces not allowed' };
  }
  return null;
};

// Register and use
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      validators: [{ type: 'custom', functionName: 'noSpaces' }],
    },
  ],
  signalFormsConfig: {
    simpleValidators: {
      noSpaces,
    },
  },
};
```

#### 2. Context-Aware Validators

Context-aware validators receive the full FieldContext, giving access to field state and other fields:

```typescript
import { ContextAwareValidator } from '@ng-forge/dynamic-form';

const lessThanField: ContextAwareValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const otherFieldName = params?.field as string;
  const rootValue = ctx.root()().value() as any;
  const otherValue = rootValue[otherFieldName];

  if (otherValue !== undefined && value >= otherValue) {
    return {
      kind: 'notLessThan',
      message: `Must be less than ${otherFieldName}`,
    };
  }
  return null;
};

// Use with parameters
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
    },
  ],
  signalFormsConfig: {
    contextValidators: {
      lessThanField,
    },
  },
};
```

#### 3. Tree Validators

Tree validators validate relationships between multiple fields and can target errors to specific fields:

```typescript
import { TreeValidator } from '@ng-forge/dynamic-form';

const passwordsMatch: TreeValidator = (ctx) => {
  const formValue = ctx.value() as any;
  const password = formValue.password;
  const confirmPassword = formValue.confirmPassword;

  if (password && confirmPassword && password !== confirmPassword) {
    return {
      kind: 'passwordMismatch',
      message: 'Passwords must match',
    };
  }
  return null;
};

// Apply to a group or form level
const config = {
  fields: [
    {
      key: 'credentials',
      type: 'group',
      label: 'Create Password',
      validators: [{ type: 'customTree', functionName: 'passwordsMatch' }],
      fields: [
        {
          key: 'password',
          type: 'input',
          value: '',
          label: 'Password',
          props: { type: 'password' },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          value: '',
          label: 'Confirm Password',
          props: { type: 'password' },
        },
      ],
    },
  ],
  signalFormsConfig: {
    treeValidators: {
      passwordsMatch,
    },
  },
};
```

#### Conditional Custom Validators

Custom validators support conditional logic just like built-in validators:

```typescript
const businessEmailValidator: SimpleCustomValidator<string> = (value) => {
  if (typeof value === 'string' && !value.endsWith('@company.com')) {
    return { kind: 'businessEmail', message: 'Must use company email' };
  }
  return null;
};

const config = {
  fields: [
    { key: 'accountType', type: 'select', value: 'personal' },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      validators: [
        { type: 'required' },
        { type: 'email' },
        {
          type: 'custom',
          functionName: 'businessEmail',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
  ],
  signalFormsConfig: {
    simpleValidators: {
      businessEmail: businessEmailValidator,
    },
  },
};
```

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
  simpleValidators?: Record<string, SimpleCustomValidator>;
  contextValidators?: Record<string, ContextAwareValidator>;
  treeValidators?: Record<string, TreeValidator>;
  strictMode?: boolean;
}

// Validator configuration (discriminated union)
type ValidatorConfig = BuiltInValidatorConfig | CustomValidatorConfig | TreeValidatorConfig;

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

interface TreeValidatorConfig {
  type: 'customTree';
  functionName: string;
  params?: Record<string, unknown>;
  targetFields?: string[];
  errorMessage?: string;
  when?: ConditionalExpression;
}

// Custom validator function signatures
type SimpleCustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

type ContextAwareValidator<TValue = unknown> = (ctx: FieldContext<TValue>, params?: Record<string, unknown>) => ValidationError | null;

type TreeValidator<TModel = unknown> = (
  ctx: FieldContext<TModel>,
  params?: Record<string, unknown>
) => ValidationError | ValidationError[] | null;

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
