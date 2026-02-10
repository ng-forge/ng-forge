<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

<p align="center">
  <strong>Stop writing repetitive form code.</strong><br>
  Build type-safe, dynamic Angular forms in minutes, not hours.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ng-forge/dynamic-forms"><img src="https://img.shields.io/npm/v/@ng-forge/dynamic-forms.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="https://ng-forge.com/dynamic-forms/">📚 Documentation</a> •
  <a href="https://ng-forge.com/dynamic-forms/installation">🚀 Getting Started</a> •
  <a href="https://github.com/ng-forge/ng-forge/issues">🐛 Issues</a>
</p>

---

## ⚡ Quick Start

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material
```

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
  template: `<form [dynamic-form]="config"></form>`,
})
export class LoginComponent {
  config = {
    fields: [
      { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
      { key: 'password', type: 'input', value: '', label: 'Password', required: true, minLength: 8, props: { type: 'password' } },
      { type: 'submit', key: 'submit', label: 'Sign In' },
    ],
  } as const satisfies FormConfig;
}
```

## ✨ Features

⚡ **Signal Forms** – Native Angular 21+ signal forms integration

🎯 **Type-Safe** – Full TypeScript inference for form values

🎨 **UI Agnostic** – Material, Bootstrap, PrimeNG, Ionic, or custom

✅ **Validation** – Shorthand validators and conditional validation

🎭 **Conditional Logic** – Dynamic field visibility and requirements

📄 **Multi-Step Forms** – Built-in wizard and pagination support

🌍 **i18n Ready** – Observable/Signal support for labels and messages

## ⚠️ Compatibility

> **Experimental API Notice:** This library uses Angular's experimental Signal Forms API.
> Angular may introduce breaking changes in patch releases.

| @ng-forge/dynamic-forms | Angular       |
| ----------------------- | ------------- |
| 0.5.x                   | >=21.1.0      |
| 0.4.x                   | >=21.1.0      |
| 0.3.x                   | 21.0.7-21.0.x |
| 0.2.x                   | 21.0.6        |
| 0.1.1+                  | 21.0.2-21.0.5 |
| 0.1.0                   | 21.0.0-21.0.1 |

## 📦 Packages

| Package                                                                 | Description     |
| ----------------------------------------------------------------------- | --------------- |
| [@ng-forge/dynamic-forms](./packages/dynamic-forms)                     | Core library    |
| [@ng-forge/dynamic-forms-material](./packages/dynamic-forms-material)   | Material Design |
| [@ng-forge/dynamic-forms-primeng](./packages/dynamic-forms-primeng)     | PrimeNG         |
| [@ng-forge/dynamic-forms-ionic](./packages/dynamic-forms-ionic)         | Ionic           |
| [@ng-forge/dynamic-forms-bootstrap](./packages/dynamic-forms-bootstrap) | Bootstrap 5     |

## 📖 Documentation

- [Installation](https://ng-forge.com/dynamic-forms/installation)
- [Field Types](https://ng-forge.com/dynamic-forms/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/validation/basics)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/dynamic-behavior/overview)
- [Type Safety](https://ng-forge.com/dynamic-forms/advanced/basics)
- [i18n](https://ng-forge.com/dynamic-forms/dynamic-behavior/i18n)
- [Custom Integrations](https://ng-forge.com/dynamic-forms/advanced/custom-integrations)

## 🛠️ Development

```bash
git clone https://github.com/ng-forge/ng-forge.git && cd ng-forge
pnpm install
pnpm run build:libs
pnpm run test
pnpm run serve:docs
```

See [Developer Guides](./guides/) for architecture docs, testing strategy, and creating UI adapters.

## 🤝 Backers

A huge thank you to the following supporters of ng-forge! 🙏

<a href="https://github.com/scottmccaughey"><img src="https://github.com/scottmccaughey.png" width="60" height="60" alt="scottmccaughey"></a>

## 📄 License

MIT © ng-forge

---

<p align="center">
  <a href="https://github.com/ng-forge/ng-forge">⭐ Star us on GitHub</a> •
  <a href="https://github.com/ng-forge/ng-forge/issues">Report an Issue</a> •
  <a href="https://github.com/ng-forge/ng-forge/discussions">Join the Discussion</a>
</p>
