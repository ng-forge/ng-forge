<p align="center">
  <img src="logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

**Stop writing repetitive form code.** Build type-safe, dynamic Angular forms in minutes, not hours.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-form.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**📖 [View Documentation](https://ng-forge.github.io/ng-forge/)**

ng-forge dynamic forms is a modern forms library for Angular 21+ that eliminates boilerplate while providing full type safety, validation, and conditional logic - all powered by Angular's signal forms.

## ✨ How It Works

ng-forge dynamic forms uses a declarative, type-safe configuration to build complete forms with validation, conditional logic, and beautiful UI:

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-login',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class LoginComponent {
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
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript knows: { email: string, password: string }
    console.log('Login:', value);
  }
}
```

**That's it!** You get:

- ✅ Real-time validation with custom error messages
- ✅ Full TypeScript type inference
- ✅ Beautiful Material Design UI
- ✅ Accessibility built-in
- ✅ No subscriptions or cleanup needed

## 🚀 Features

- ⚡ **Angular 21 Signal Forms** - Native integration with Angular's signal forms architecture
- 🎯 **Type-Safe** - Full TypeScript support with intelligent autocomplete
- 🎨 **UI Agnostic** - Works with Material, Bootstrap, PrimeNG, Ionic, or your custom components
- 🔥 **Zero Boilerplate** - No `ControlValueAccessor` implementation needed
- ✅ **Powerful Validation** - Shorthand validators and conditional validation
- 🎭 **Conditional Logic** - Show/hide fields dynamically based on form state
- 📦 **Multi-Step Forms** - Built-in support for wizards and paged forms
- 🌍 **i18n Ready** - Full internationalization support
- 🚀 **Performance** - Lazy loading, tree-shakeable, optimized change detection
- ♿ **Accessible** - WCAG compliant with proper ARIA support

## 📦 Packages

This monorepo contains:

| Package                                                             | Description                              | Version                                                                                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [@ng-forge/dynamic-form](./packages/dynamic-form)                   | Core library - UI-agnostic dynamic forms | [![npm](https://img.shields.io/npm/v/@ng-forge/dynamic-form.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form)                   |
| [@ng-forge/dynamic-form-material](./packages/dynamic-form-material) | Material Design implementation           | [![npm](https://img.shields.io/npm/v/@ng-forge/dynamic-form-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-material) |
| [@ng-forge/dynamic-form-primeng](./packages/dynamic-form-primeng)   | PrimeNG implementation                   | [![npm](https://img.shields.io/npm/v/@ng-forge/dynamic-form-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-primeng)   |
| [@ng-forge/dynamic-form-ionic](./packages/dynamic-form-ionic)       | Ionic implementation                     | [![npm](https://img.shields.io/npm/v/@ng-forge/dynamic-form-ionic.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-ionic)       |

## 🎯 Quick Start

### Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

### Configure Your App

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

### Create Your First Form

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-registration',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class RegistrationComponent {
  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        value: '',
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
      },
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
        label: 'Create Account',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript infers: { username: string, email: string, password: string }
    console.log('Form submitted:', value);
  }
}
```

**Result:** A form with validation, error messages, type safety, and beautiful UI in ~30 lines of code.

## 💡 Advanced Features

### Conditional Logic

Show/hide fields based on form state:

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Business Tax ID',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
  validationMessages: {
    required: 'Tax ID required for business accounts',
  }
}
```

### Dynamic Validation

Apply validators conditionally:

```typescript
{
  key: 'discount',
  type: 'input',
  value: null,
  label: 'Discount',
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
  validationMessages: {
    max: 'Discount exceeds maximum allowed value',
  }
}
```

### Multi-Step Forms

Build wizards with ease:

```typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Personal Info',
      fields: [
        { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
        { type: 'next', key: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Contact Details',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        { type: 'previous', key: 'back', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Complete' },
      ],
    },
  ],
}
```

## 🎨 UI Framework Support

ng-forge dynamic forms works with any UI library:

### Material Design (Official)

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
provideDynamicForm(...withMaterialFields());
```

### PrimeNG (Official)

```typescript
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
provideDynamicForm(...withPrimeNGFields());
```

### Ionic (Official)

```typescript
import { withIonicFields } from '@ng-forge/dynamic-form-ionic';
provideDynamicForm(...withIonicFields());
```

### Your Custom Components

```typescript
provideDynamicForm([{ name: 'custom-input', loadComponent: () => import('./input-component') }]);
```

## 📚 Documentation

**[📖 View Full Documentation](https://ng-forge.github.io/ng-forge)**

Comprehensive guides covering:

- Getting Started
- Core Concepts
- Validation
- Conditional Logic
- Custom Field Types
- UI Framework Integration
- Type Safety
- i18n Support
- API Reference

## 🏗️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/ng-forge/ng-forge.git
cd ng-forge

# Install dependencies
pnpm install

# Build libraries
pnpm run build:libs

# Run tests
pnpm run test

# Serve documentation
pnpm run serve:docs
```

### Project Structure

```
ng-forge/
├── packages/
│   ├── dynamic-form/          # Core library
│   ├── dynamic-form-material/ # Material Design integration
│   ├── dynamic-form-primeng/  # PrimeNG integration
│   └── dynamic-form-ionic/    # Ionic integration
├── apps/
│   ├── docs/                  # Documentation site
│   ├── demo/                  # Demo applications
│   └── examples/              # Example applications
└── tools/                     # Build tools and scripts
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

MIT © ng-forge

## 💬 Support

- 📚 [Documentation](https://ng-forge.github.io/ng-forge)
- 🐛 [Issue Tracker](https://github.com/ng-forge/ng-forge/issues)
- 💡 [Discussions](https://github.com/ng-forge/ng-forge/discussions)

---

**Built with ❤️ for the Angular community**

If you find ng-forge dynamic forms useful, please consider giving it a ⭐ on [GitHub](https://github.com/ng-forge/ng-forge)!
