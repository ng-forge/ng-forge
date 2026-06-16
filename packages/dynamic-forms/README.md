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

| Angular | @ng-forge/dynamic-forms       |
| ------- | ----------------------------- |
| 22.x    | 0.x (current), 1.x (upcoming) |

Signal Forms are stable as of Angular 22. The current `0.x` line targets Angular 22: the published package declares `@angular/core ^22.0.0` in `peerDependencies`, and npm warns on a mismatch.

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

## Versioning & stability

The library follows [semantic versioning](https://semver.org). The semver contract covers the public `exports` entrypoints listed above (`@ng-forge/dynamic-forms`, `/schema`, and `/integration`). The `/internal` entrypoint is excluded and may change in any release.

A change is considered breaking when it removes or renames a public export, changes the runtime behavior or type signature of a documented API in an incompatible way, or raises the minimum Angular peer version. Additive changes (new field types, new optional config options, new exports) ship in minor releases. Bug fixes ship in patches.

Deprecations are announced in the release notes and, where practical, surface as a runtime or type-level warning. A deprecated public API stays available for at least one minor release before it can be removed in the next major.

### Upgrading from 0.x

The `0.x` line is the current pre-1.0 line and runs on Angular 22. While the version stays below `1.0`, minor releases may still contain breaking changes; check the [release notes](https://github.com/ng-forge/ng-forge/releases) before upgrading. Once the library reaches `1.0`, the deprecation and breaking-change policy above applies in full.

### Tested browsers

The end-to-end suite is verified against Chromium-class browsers in CI. The core form logic is rendering-agnostic (it produces field definitions that the UI adapters render), so it does not depend on browser-specific behavior, but cross-browser rendering beyond Chromium is not exercised in CI.

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
