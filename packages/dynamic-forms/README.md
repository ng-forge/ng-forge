<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms

Core library for building type-safe, dynamic Angular forms with signal forms integration.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms)
[![Angular](https://img.shields.io/badge/Angular-21+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Experimental API Notice:** This library uses Angular's experimental Signal Forms API.
> Angular may introduce breaking changes in patch releases. Check the [compatibility matrix](#compatibility) below.

## Compatibility

| @ng-forge/dynamic-forms | Angular       |
| ----------------------- | ------------- |
| 0.5.x                   | >=21.1.0      |
| 0.4.x                   | >=21.1.0      |
| 0.3.x                   | 21.0.7-21.0.x |
| 0.2.x                   | 21.0.6        |
| 0.1.1+                  | 21.0.2-21.0.5 |
| 0.1.0                   | 21.0.0-21.0.1 |

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
- **Value Derivation** - Automatic value computation with expression, function, or static values
- **Container Fields** - Groups, rows, and pages for complex layouts
- **i18n Ready** - Observable/Signal support for labels and messages
- **Event System** - Custom events for buttons and form actions

## UI Integrations

This core library requires a UI integration. Choose one:

| Package                                                                                              | UI Library       |
| ---------------------------------------------------------------------------------------------------- | ---------------- |
| [@ng-forge/dynamic-forms-material](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)   | Angular Material |
| [@ng-forge/dynamic-forms-bootstrap](https://www.npmjs.com/package/@ng-forge/dynamic-forms-bootstrap) | Bootstrap 5      |
| [@ng-forge/dynamic-forms-primeng](https://www.npmjs.com/package/@ng-forge/dynamic-forms-primeng)     | PrimeNG          |
| [@ng-forge/dynamic-forms-ionic](https://www.npmjs.com/package/@ng-forge/dynamic-forms-ionic)         | Ionic            |

Or [create your own](https://ng-forge.com/dynamic-forms/advanced/custom-integrations).

## Documentation

- [Installation](https://ng-forge.com/dynamic-forms/installation)
- [Field Types](https://ng-forge.com/dynamic-forms/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/validation/basics)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/dynamic-behavior/overview)
- [Value Derivation](https://ng-forge.com/dynamic-forms/dynamic-behavior/derivation)
- [Type Safety](https://ng-forge.com/dynamic-forms/advanced/basics)
- [Events](https://ng-forge.com/dynamic-forms/advanced/events)
- [i18n](https://ng-forge.com/dynamic-forms/dynamic-behavior/i18n)
- [Custom Integrations](https://ng-forge.com/dynamic-forms/advanced/custom-integrations)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
