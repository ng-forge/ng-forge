> Prerequisites: [What is Dynamic Forms?](../what-is-dynamic-forms)

Get ng-forge dynamic forms up and running in your Angular project in 3 minutes.

## Requirements

- **Angular 21+** - ng-forge dynamic forms requires Angular 21 or higher for signal forms support
- **TypeScript 5.6+** - For best type inference results

## Installation

Install the core library and your preferred UI integration:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

> This installs the core `@ng-forge/dynamic-form` package and the Material Design integration. See [UI Framework Options](#ui-framework-options) below for other choices.

## Configure Your App

Add the dynamic form provider to your app configuration:

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

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

**That's it!** You now have a fully functional, type-safe form with:

- ✅ Real-time validation with error messages
- ✅ Full TypeScript type inference
- ✅ Beautiful Material Design UI
- ✅ Accessibility built-in
- ✅ Submit button auto-disables when invalid

## UI Framework Options

ng-forge dynamic forms supports multiple UI frameworks. Install the integration package for your preferred framework:

### Material Design (Production Ready)

```bash
npm install @ng-forge/dynamic-form-material
```

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

See [Material Integration](../ui-libs-integrations/reference/material) for full documentation.

### Bootstrap (Coming Soon)

```bash
npm install @ng-forge/dynamic-form-bootstrap
```

See [Bootstrap Integration](../ui-libs-integrations/reference/bootstrap) for status and alternatives.

### PrimeNG (Coming Soon)

```bash
npm install @ng-forge/dynamic-form-primeng
```

See [PrimeNG Integration](../ui-libs-integrations/reference/primeng) for status and alternatives.

### Ionic (Coming Soon)

```bash
npm install @ng-forge/dynamic-form-ionic
```

See [Ionic Integration](../ui-libs-integrations/reference/ionic) for status and alternatives.

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

See [Custom Integration Guide](../ui-libs-integrations/guide) for building custom field components.

## Next Steps

Now that you have ng-forge dynamic forms installed, explore the core features:

### Learn Core Concepts

- **[Field Types](../core/field-types)** - Understand all available field types (input, select, checkbox, group, etc.)
- **[Validation](../core/validation)** - Add validation rules with shorthand syntax or conditional validators
- **[Conditional Logic](../core/conditional-logic)** - Show/hide fields based on other field values
- **[Type Safety](../core/type-safety)** - Master TypeScript type inference for forms

### Build Advanced Forms

- **[Multi-Step Forms](../prebuilt/wizards/multi-step)** - Create wizard-style forms with page navigation
- **[Repeatable Sections](../prebuilt/arrays/repeatable-sections)** - Dynamic form arrays for adding/removing fields
- **[Conditional Validation](../core/validation#conditional-validators)** - Validators that activate based on conditions

### Customize and Extend

- **[i18n Setup](../i18n)** - Add multi-language support to your forms
- **[Events](../core/events)** - Handle custom form events
- **[Custom Fields](../ui-libs-integrations/guide)** - Create your own field types

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types, ensure you're using `as const satisfies FormConfig`:

```typescript
// ✓ Correct - enables type inference
const config = { fields: [...] } as const satisfies FormConfig;

// ✗ Wrong - no type inference
const config = { fields: [...] };
```

### Material Theme Not Applied

If Material fields appear unstyled, ensure you've included a Material theme in your `styles.scss`:

```scss
@use 'index' as mat;

@include mat.core();

$theme: mat.define-theme();
html {
  @include mat.all-component-themes($theme);
}
```

See [Angular Material Theming Guide](https://material.angular.io/guide/theming) for more details.

### Module Not Found

If you see import errors for `@ng-forge/dynamic-form`, ensure:

1. You've run `npm install` (or yarn/pnpm equivalent)
2. Your package.json includes the dependency
3. Your TypeScript paths are configured correctly

## Get Help

- 💬 **[GitHub Discussions](https://github.com/ng-forge/ng-forge/discussions)** - Ask questions and get help
- 🐛 **[Issue Tracker](https://github.com/ng-forge/ng-forge/issues)** - Report bugs
- 📖 **[Documentation](../)** - Browse full documentation

## Related Topics

- **[What is Dynamic Forms?](../what-is-dynamic-forms)** - Learn about features and benefits
- **[Field Types](../core/field-types)** - Explore all available field types
- **[Validation](../core/validation)** - Add validation to your forms
- **[Material Integration](../ui-libs-integrations/reference/material)** - Material Design field reference
