---
title: Getting Started
slug: getting-started
description: 'Install ng-forge, pick a UI adapter (Material, Bootstrap, PrimeNG, or Ionic), and render your first dynamic Angular form from a single config object.'
---

> [!TIP]
> **Coming from ngx-formly?** The [migration guide](/migrating-from-ngx-formly) maps every concept side-by-side and includes a checklist for porting a non-trivial app.

ng-forge generates fully working Angular forms from a single configuration object: validation, conditional logic, and multi-step wizards included. Here's how to set it up.

## Quick setup

In an existing Angular 22 workspace:

<docs-cli-command package="@ng-forge/dynamic-forms"></docs-cli-command>

Pick an adapter when prompted. Works in Nx too; toggle the **Nx** tab.

Prefer to wire things by hand? Manual setup is below.

## 1. Choose Your UI Library

<docs-adapter-picker></docs-adapter-picker>

<docs-integration-view></docs-integration-view>

---

## 2. Your First Form

Every adapter uses the same `FormConfig` schema. Import `DynamicForm` and bind a config object:

```typescript
@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class ContactComponent {
  config = {
    fields: [
      /* see Config tab below */
    ],
  } as const satisfies FormConfig;
}
```

Try it out: select a contact method and watch fields appear. Switch to the "Config" tab to see the full schema:

<docs-live-example scenario="examples/contact-dynamic-fields" hideForCustom></docs-live-example>

## Requirements

- **Angular 22**: the published packages declare `@angular/*` peers of `^22.0.0`. Signal Forms, which ng-forge builds on, is stable in Angular 22
- **TypeScript 6.0**: required by the Angular 22 toolchain

---

## Versioning & stability

ng-forge follows [semantic versioning](https://semver.org). The semver contract covers the public package entrypoints (`@ng-forge/dynamic-forms`, `/schema`, and `/integration`); the `/internal` entrypoint is unsupported and may change in any release. Removing or renaming a public export, an incompatible change to a documented API, or raising the minimum Angular version counts as breaking. Deprecated public APIs stay available for at least one minor release before removal in the next major.

The current `0.x` line runs on Angular 22. While the version is below `1.0`, minor releases may still contain breaking changes, so check the [release notes](https://github.com/ng-forge/ng-forge/releases) before upgrading.

---

## Community & Support

- **[Discord](https://discord.gg/qpzzvFagj3)**: Ask questions, share what you've built, and chat with the community
- **[GitHub Issues](https://github.com/ng-forge/ng-forge/issues)**: Report bugs or request features
- **[Contributing](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md)**: Learn how to contribute to ng-forge

---

## Next Steps

- **[Feature overview](/feature-overview)**: Task-oriented map of the docs, plus a general FAQ and the most common pitfalls
- **[Configuration](/configuration)**: Set global defaults with `withXxxFields({ ... })` and per-form `defaultProps`
- **[Examples](/examples)**: Browse complete form examples
- **[Field Types](/field-types/text-inputs)**: All available field types and their props
- **[Building an Adapter](/building-an-adapter)**: Create your own adapter for any UI library
- **[Migrating from ngx-formly](/migrating-from-ngx-formly)**: Side-by-side migration guide if you're coming from formly
