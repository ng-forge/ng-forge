The dynamic form library provides powerful compile-time type inference that automatically determines the result type of your forms based on the field configurations you provide. This eliminates the need to manually define types and ensures type safety throughout your application.

## Overview

With type inference, you can:

- **Automatically infer form result types** from field configurations
- **Get full TypeScript intellisense** for form values
- **Eliminate `unknown` or `any` types** in form handling
- **Catch type errors at compile time** rather than runtime
- **Support nested object structures** with dot notation keys

## Basic Usage

### Simple Form Configuration

```typescript
import { provideDynamicForm, withConfig, ProvidedFormResult } from '@ng-forge/dynamic-form';

// Define your form configuration
const formConfig = {
  fields: [
    { key: 'firstName', type: 'input' },
    { key: 'email', type: 'email' },
    { key: 'age', type: 'number' },
    { key: 'isSubscribed', type: 'checkbox' },
  ] as const, // Important: use 'as const' for type inference
};

// Set up providers with type inference
const providers = provideDynamicForm(withConfig(formConfig));

// Extract the inferred result type
type FormResult = ProvidedFormResult<typeof providers>;
// Result: { firstName: string; email: string; age: number; isSubscribed: boolean; }
```

### Using in Components

```typescript
@Component({
  providers: [providers],
  template: ` <dynamic-form [fields]="fields" [value]="initialValue" (valueChange)="onFormChange($event)" /> `,
})
export class MyFormComponent {
  fields = formConfig.fields;
  initialValue: FormResult = {
    firstName: '',
    email: '',
    age: 0,
    isSubscribed: false,
  };

  onFormChange(result: FormResult) {
    // 'result' is fully typed with intellisense
    console.log(result.firstName); // ✅ string
    console.log(result.age); // ✅ number
    console.log(result.isSubscribed); // ✅ boolean

    // This would be a TypeScript error:
    // console.log(result.nonExistent); // ❌ Property 'nonExistent' does not exist
  }
}
```

## Advanced Features

### Nested Field Configuration

The type system supports nested object structures using dot notation:

```typescript
const nestedFormConfig = {
  fields: [
    { key: 'user.name', type: 'input' },
    { key: 'user.email', type: 'email' },
    { key: 'settings.theme', type: 'select' },
    { key: 'settings.notifications', type: 'checkbox' },
    { key: 'preferences.languages', type: 'multi-select' },
  ] as const,
};

const nestedProviders = provideDynamicForm(withConfig(nestedFormConfig));
type NestedFormResult = ProvidedFormResult<typeof nestedProviders>;

// Result type:
// {
//   user: {
//     name: string;
//     email: string;
//   };
//   settings: {
//     theme: string;
//     notifications: boolean;
//   };
//   preferences: {
//     languages: string[];
//   };
// }
```

### Material Design Integration

When using Material Design components, the type system automatically includes Material-specific field types:

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

const materialFormConfig = {
  fields: [
    { key: 'skills', type: 'multi-checkbox' },
    { key: 'notifications', type: 'toggle' },
    { key: 'birthDate', type: 'datepicker' },
    { key: 'volume', type: 'slider' },
  ] as const,
};

const materialProviders = provideDynamicForm(withMaterialFields(materialFormConfig));
type MaterialFormResult = ProvidedFormResult<typeof materialProviders>;

// Result type:
// {
//   skills: string[];        // multi-checkbox returns array of strings
//   notifications: boolean;  // toggle returns boolean
//   birthDate: Date;        // datepicker returns Date
//   volume: number;         // slider returns number
// }
```

## Enhanced Type Safety

### Using TypedDynamicForm

For even better type safety, you can use the `TypedDynamicForm` component:

```typescript
import { TypedDynamicForm } from '@ng-forge/dynamic-form';

@Component({
  providers: [providers],
  template: ` <typed-dynamic-form [fields]="fields" [value]="initialValue" (valueChange)="onFormChange($event)" /> `,
})
export class TypeSafeFormComponent {
  onFormChange(result: FormResult) {
    // Automatically typed based on provider configuration
  }
}
```

### Using withTypedConfig

For maximum type safety, use `withTypedConfig`:

```typescript
import { withTypedConfig } from '@ng-forge/dynamic-form';

const typedFormConfig = {
  types: [], // Your field type definitions
  fields: [
    { key: 'name', type: 'input' },
    { key: 'email', type: 'email' },
  ] as const,
};

const typedProviders = provideDynamicForm(withTypedConfig(typedFormConfig));
type TypedFormResult = ProvidedFormResult<typeof typedProviders>;
```

## Field Type Registry

The type inference system uses a global field type registry that maps field types to TypeScript types:

```typescript
interface FieldTypeMap {
  input: string;
  email: string;
  number: number;
  checkbox: boolean;
  select: string;
  'multi-select': string[];
  toggle: boolean;
  datepicker: Date;
  slider: number;
  // ... more types
}
```

### Extending Field Types

You can extend the type registry with custom field types using module augmentation:

```typescript
declare module '@ng-forge/dynamic-form' {
  interface FieldTypeMap {
    'custom-field': CustomType;
    'another-field': AnotherType;
  }
}
```

## Best Practices

### 1. Always Use `as const`

For type inference to work properly, always use `as const` when defining field configurations:

```typescript
// ✅ Good - enables type inference
const fields = [{ key: 'name', type: 'input' }] as const;

// ❌ Bad - no type inference
const fields = [{ key: 'name', type: 'input' }];
```

### 2. Define Configurations at Module Level

Define your form configurations at the module level for better reusability:

```typescript
// form-configs.ts
export const USER_FORM_CONFIG = {
  fields: [
    { key: 'name', type: 'input' },
    { key: 'email', type: 'email' },
  ] as const,
};

export const USER_FORM_PROVIDERS = provideDynamicForm(withConfig(USER_FORM_CONFIG));
export type UserFormResult = ProvidedFormResult<typeof USER_FORM_PROVIDERS>;
```

### 3. Use Consistent Naming

Use consistent naming conventions for your form configurations and types:

```typescript
// Configuration
export const CONTACT_FORM_CONFIG = { ... };

// Providers
export const CONTACT_FORM_PROVIDERS = provideDynamicForm(withConfig(CONTACT_FORM_CONFIG));

// Types
export type ContactFormResult = ProvidedFormResult<typeof CONTACT_FORM_PROVIDERS>;
```

## Troubleshooting

### Type Resolves to `never` or `unknown`

If your inferred type resolves to `never` or `unknown`:

1. **Check `as const`**: Ensure you're using `as const` on your field configuration
2. **Verify field types**: Make sure all field types exist in the `FieldTypeMap`
3. **Check configuration structure**: Ensure your configuration has the correct `fields` property

### TypeScript Compilation Errors

If you encounter TypeScript compilation errors:

1. **Update TypeScript**: Ensure you're using TypeScript 4.7 or later
2. **Check imports**: Verify all type imports are correct
3. **Simplify configuration**: Start with a simple configuration and gradually add complexity

The type inference system provides powerful compile-time type safety while maintaining the flexibility of dynamic forms. It eliminates the gap between configuration and type safety, making your forms both dynamic and type-safe.
