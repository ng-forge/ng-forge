Get ng-forge dynamic forms up and running in your Angular project.

## Requirements

- **Angular 21+** - ng-forge dynamic forms requires Angular 21 or higher for signal forms support
- **TypeScript 5.6+** - For best type inference results

## Installation

Install the core library and your preferred UI integration:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material
```

> This installs the core `@ng-forge/dynamic-forms` package and the Material Design integration. See [UI Framework Options](#ui-framework-options) below for other choices.

## Configure Your App

Add the dynamic form provider to your app configuration:

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
    // ... other providers
  ],
};
```

The `provideDynamicForm()` function registers field types and validators. The `withMaterialFields()` function provides all Material Design field components.

## Create Your First Form

Create a simple login form to verify everything works:

```typescript name="login.component.ts"
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-login',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
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
}
```

You now have a working form with:

- ✅ Real-time validation with error messages
- ✅ TypeScript type inference
- ✅ Material Design styling
- ✅ Accessibility support
- ✅ Submit button auto-disables when invalid

## UI Framework Options

ng-forge dynamic forms supports multiple UI frameworks. Install the integration package for your preferred framework:

### Material Design (Preview)

```bash group="install-material" name="npm"
npm install @ng-forge/dynamic-forms-material
```

```bash group="install-material" name="yarn"
yarn add @ng-forge/dynamic-forms-material
```

```bash group="install-material" name="pnpm"
pnpm add @ng-forge/dynamic-forms-material
```

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

See [Material Integration](../ui-libs-integrations/material) for full documentation.

### PrimeNG (Preview)

```bash group="install-primeng" name="npm"
npm install @ng-forge/dynamic-forms-primeng
```

```bash group="install-primeng" name="yarn"
yarn add @ng-forge/dynamic-forms-primeng
```

```bash group="install-primeng" name="pnpm"
pnpm add @ng-forge/dynamic-forms-primeng
```

```typescript
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withPrimeNGFields())],
};
```

See [PrimeNG Integration](../ui-libs-integrations/primeng) for full documentation.

### Bootstrap (Preview)

```bash group="install-bootstrap" name="npm"
npm install @ng-forge/dynamic-forms-bootstrap
```

```bash group="install-bootstrap" name="yarn"
yarn add @ng-forge/dynamic-forms-bootstrap
```

```bash group="install-bootstrap" name="pnpm"
pnpm add @ng-forge/dynamic-forms-bootstrap
```

```typescript
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withBootstrapFields())],
};
```

See [Bootstrap Integration](../ui-libs-integrations/bootstrap) for full documentation.

### Ionic (Preview)

```bash group="install-ionic" name="npm"
npm install @ng-forge/dynamic-forms-ionic
```

```bash group="install-ionic" name="yarn"
yarn add @ng-forge/dynamic-forms-ionic
```

```bash group="install-ionic" name="pnpm"
pnpm add @ng-forge/dynamic-forms-ionic
```

```typescript
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withIonicFields())],
};
```

See [Ionic Integration](../ui-libs-integrations/ionic) for full documentation.

### Custom UI Components

You can also build your own field components using any UI library or custom styling:

```typescript
import { MyCustomInputComponent } from './my-custom-input.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm([
      { name: 'input', loadComponent: () => MyCustomInputComponent },
      // ... more custom field types
    ]),
  ],
};
```

See [Custom Integration Guide](../advanced/custom-integrations) for building custom field components.

## Next Steps

Now that you have ng-forge dynamic forms installed, explore the core features:

### Learn Core Concepts

- **[Field Types](../schema-fields/field-types)** - Understand all available field types (input, select, checkbox, group, etc.)
- **[Validation](../validation/basics)** - Add validation rules with shorthand syntax or conditional validators
- **[Conditional Logic](../dynamic-behavior/conditional-logic/overview)** - Show/hide fields based on other field values
- **[Type Safety](../advanced/type-safety/basics)** - TypeScript type inference for forms

### Build Advanced Forms

- **[Multi-Step Forms](../layout-components/form-pages)** - Create wizard-style forms with page navigation
- **[Repeatable Sections](../layout-components/form-arrays)** - Dynamic form arrays for adding/removing fields
- **[Conditional Validation](../validation/advanced#conditional-validators)** - Validators that activate based on conditions

### Customize and Extend

- **[i18n Setup](../dynamic-behavior/i18n)** - Add multi-language support to your forms
- **[Events](../advanced/events)** - Handle custom form events
- **[Custom Fields](../advanced/custom-integrations)** - Create your own field types

## Get Help

- 💬 **[GitHub Discussions](https://github.com/ng-forge/ng-forge/discussions)** - Ask questions and get help
- 🐛 **[Issue Tracker](https://github.com/ng-forge/ng-forge/issues)** - Report bugs
- 📖 **[Documentation](../)** - Browse full documentation
