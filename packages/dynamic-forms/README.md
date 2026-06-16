<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms

Core library for building type-safe, dynamic Angular forms with signal forms integration.

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms)
[![Angular](https://img.shields.io/badge/Angular-22+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

> **Stability:** This library is built on Angular Signal Forms, which is stable as of Angular v22.
> Check the [compatibility matrix](#compatibility) below for supported Angular versions.

## Compatibility

| Angular | @ng-forge/dynamic-forms |
| ------- | ----------------------- |
| 22.x    | 1.x                     |
| 21.x    | 0.x (experimental)      |

Signal Forms are stable as of Angular 22. The `0.x` line targets Angular 21, where Signal Forms were still experimental and could change in patch releases. Each release pins its Angular requirement via `peerDependencies`; npm warns on a mismatch.

## Supported entrypoints

| Entrypoint                            | Audience           | Stability                        |
| ------------------------------------- | ------------------ | -------------------------------- |
| `@ng-forge/dynamic-forms`             | Form consumers     | Public API, governed by semver   |
| `@ng-forge/dynamic-forms/schema`      | Form consumers     | Public API, governed by semver   |
| `@ng-forge/dynamic-forms/integration` | UI adapter authors | Public API, governed by semver   |
| `@ng-forge/dynamic-forms/internal`    | None (build-time)  | Unsupported, no semver guarantee |

The `/schema` entrypoint is a supported, semver-governed surface for using [Standard Schema](https://standardschema.dev) validation libraries (Zod, Valibot, ArkType) with dynamic forms via `standardSchema()`.

The `/internal` entrypoint is an unsupported build surface with no semver guarantee. It is published only because shared DI tokens, services, and config types must keep a single compiled identity across the public bundles. Its contents may change or be removed in any release, including patch releases.

Import only from `@ng-forge/dynamic-forms` and `@ng-forge/dynamic-forms/schema` (form consumers) or `@ng-forge/dynamic-forms/integration` (UI adapter authors).

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

- **Signal Forms** - Native Angular Signal Forms integration
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

Or [create your own](https://ng-forge.com/material/building-an-adapter).

## Documentation

- [Feature overview](https://ng-forge.com/material/feature-overview)
- [Installation](https://ng-forge.com/material/getting-started)
- [Field Types](https://ng-forge.com/material/field-types/text-inputs)
- [Validation](https://ng-forge.com/material/validation/basics)
- [Conditional Logic](https://ng-forge.com/material/dynamic-behavior/conditional-logic)
- [Value Derivation](https://ng-forge.com/material/dynamic-behavior/derivation/values)
- [Type Safety](https://ng-forge.com/material/recipes/type-safety)
- [Events](https://ng-forge.com/material/recipes/events)
- [i18n](https://ng-forge.com/material/dynamic-behavior/i18n)
- [Custom Integrations](https://ng-forge.com/material/building-an-adapter)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
