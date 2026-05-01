---
title: Getting Started
slug: getting-started
description: 'Install ng-forge, pick a UI adapter (Material, Bootstrap, PrimeNG, or Ionic), and render your first dynamic Angular form from a single config object.'
---

ng-forge generates fully working Angular forms from a single configuration object — validation, conditional logic, and multi-step wizards included. Here's how to set it up.

## 1. Choose Your UI Library

<docs-adapter-picker></docs-adapter-picker>

<docs-integration-view></docs-integration-view>

---

## 2. Your First Form

Every adapter uses the same `FormConfig` schema — import `DynamicForm` and bind a config object:

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

Try it out — select a contact method and watch fields appear. Switch to the "Config" tab to see the full schema:

<docs-live-example scenario="examples/contact-dynamic-fields" hideForCustom></docs-live-example>

## Requirements

- **Angular 21+** — required for signal support
- **TypeScript 5.6+** — for best type inference

---

## Community & Support

- **[Discord](https://discord.gg/qpzzvFagj3)** — Ask questions, share what you've built, and chat with the community
- **[GitHub Issues](https://github.com/ng-forge/ng-forge/issues)** — Report bugs or request features
- **[Contributing](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md)** — Learn how to contribute to ng-forge

---

## Next Steps

- **[Feature overview](/feature-overview)** — Task-oriented map of the docs, plus a general FAQ and the most common pitfalls
- **[Configuration](/configuration)** — Set global defaults with `withXxxFields({ ... })` and per-form `defaultProps`
- **[Examples](/examples)** — Browse complete form examples
- **[Field Types](/field-types/text-inputs)** — All available field types and their props
- **[Building an Adapter](/building-an-adapter)** — Create your own adapter for any UI library
- **[Migrating from ngx-formly](/migrating-from-ngx-formly)** — Side-by-side migration guide if you're coming from formly
