<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-forms

Core library for building type-safe, dynamic Angular forms with signal forms integration.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material
```

## Quick Start

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

```typescript
// component.ts
import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`,
})
export class UserFormComponent {
  config = {
    fields: [
      { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
      { key: 'password', type: 'input', value: '', label: 'Password', required: true, minLength: 8, props: { type: 'password' } },
      { type: 'submit', key: 'submit', label: 'Sign In' },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: InferFormValue<typeof this.config.fields>) {
    console.log('Form submitted:', value); // TypeScript infers: { email: string, password: string }
  }
}
```

## Features

- **Signal Forms** - Native Angular 21+ signal forms integration
- **Type-Safe** - Full TypeScript inference with `InferFormValue`
- **UI Agnostic** - Bring your own UI or use official integrations
- **Validation** - Shorthand validators (`required`, `email`, `minLength`) and custom validators
- **Conditional Logic** - Dynamic visibility and validation based on form state
- **Container Fields** - Groups, rows, and pages for complex layouts
- **i18n Ready** - Observable/Signal support for labels and messages
- **Event System** - Custom events for buttons and form actions

## Documentation

- [Installation](https://ng-forge.com/dynamic-forms/installation)
- [Field Types](https://ng-forge.com/dynamic-forms/core/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/core/validation)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/core/conditional-logic)
- [Type Safety](https://ng-forge.com/dynamic-forms/core/type-safety)
- [Events](https://ng-forge.com/dynamic-forms/core/events)
- [i18n](https://ng-forge.com/dynamic-forms/core/i18n)
- [Custom Integrations](https://ng-forge.com/dynamic-forms/deep-dive/custom-integrations)

## License

MIT © ng-forge
