<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms-primeng

PrimeNG field components for [@ng-forge/dynamic-forms](https://www.npmjs.com/package/@ng-forge/dynamic-forms).

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-primeng)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-primeng)
[![Angular](https://img.shields.io/badge/Angular-21+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

> **Experimental API Notice:** This library uses Angular's experimental Signal Forms API.
> Angular may introduce breaking changes in patch releases. Check the [compatibility matrix](#compatibility) below.

## Compatibility

| @ng-forge/dynamic-forms-primeng | @ng-forge/dynamic-forms | Angular       |
| ------------------------------- | ----------------------- | ------------- |
| 0.8.x                           | 0.8.x                   | >=21.2.0      |
| 0.7.x                           | 0.7.x                   | >=21.2.0      |
| 0.6.x                           | 0.6.x                   | >=21.1.0      |
| 0.5.x                           | 0.5.x                   | >=21.1.0      |
| 0.4.x                           | 0.4.x                   | >=21.1.0      |
| 0.3.x                           | 0.3.x                   | 21.0.7-21.0.x |
| 0.2.x                           | 0.2.x                   | 21.0.6        |
| 0.1.1+                          | 0.1.1+                  | 21.0.2-21.0.5 |
| 0.1.0                           | 0.1.0                   | 21.0.0-21.0.1 |

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng @primeng/themes primeicons
```

## Setup

```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideDynamicForm(...withPrimeNGFields()),
  ],
};
```

```scss
// styles.scss
@import 'primeicons/primeicons.css';
```

## Usage

```typescript
import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`,
})
export class ContactFormComponent {
  config = {
    fields: [
      { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
      { type: 'submit', key: 'submit', label: 'Submit', props: { severity: 'primary' } },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: InferFormValue<typeof this.config.fields>) {
    console.log('Form submitted:', value);
  }
}
```

## Global Configuration

```typescript
provideDynamicForm(
  ...withPrimeNGFields({
    variant: 'filled',
    size: 'large',
    severity: 'primary',
  }),
);
```

## Field Types

Input, Textarea, Select, Checkbox, Toggle, Radio, Multi-Checkbox, Datepicker, Slider, Button, Submit, Next, Previous

## Addons (`prefix` / `suffix` slots on `prime-input`)

Render icons, buttons, or static text inside an input's `<p-inputgroup>`. Opt
in by adding `withPrimengAddons()` alongside `withPrimeNGFields()`:

```ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields, withPrimengAddons } from '@ng-forge/dynamic-forms-primeng';

provideDynamicForm(...withPrimeNGFields(), withPrimengAddons());
```

### Quickstart — clear button

```ts
{
  type: 'input',
  key: 'search',
  label: 'Search',
  addons: [
    { slot: 'prefix', kind: 'pi-icon', icon: 'search', ariaLabel: 'Search' },
    { slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' },
  ],
}
```

### Available kinds

| Kind        | Renders                       | Notes                                                                                    |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `pi-icon`   | `<i class="pi pi-{icon}">`    | Bare PrimeIcons name. Add `ariaLabel` for non-decorative icons.                          |
| `pi-button` | `<p-button>` with `[loading]` | Exactly one of `preset` / `actionRef` / `action`. Severity, label, icon all supported.   |
| `text`      | `<span>` with `DynamicText`   | Universal; supports plain strings, signals, observables, i18n keys.                      |
| `template`  | Named `<ng-template>`         | Reference by `templateKey`. JSON-safe — backend ships the key, FE supplies the template. |
| `component` | Arbitrary Angular component   | Code-only — dropped from JSON-derived configs.                                           |

### Built-in button presets

`'clear'`, `'reset'`, `'submit'`, `'paste'`, `'copy'`, `'toggle-password-visibility'`. All JSON-safe.

For custom actions, register named handlers via `provideAddonActions(...)` from `@ng-forge/dynamic-forms` and reference them with `actionRef`:

```ts
provideAddonActions({
  openProfile: (ctx) => modal.open(ProfileModal, { data: ctx.value }),
});

// Backend then ships:
// { kind: 'pi-button', actionRef: 'openProfile', label: 'View profile' }
```

### Reactive `hidden` / `disabled`

Both fields accept `boolean | Signal<boolean> | Observable<boolean>`. Useful
for "show clear button only when input has value" patterns:

```ts
const hasValue = computed(() => (formValue()?.search?.length ?? 0) > 0);

{ slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear',
  preset: 'clear', hidden: computed(() => !hasValue()) }
```

## Documentation

- [PrimeNG Integration](https://ng-forge.com/dynamic-forms/ui-libs-integrations/primeng)
- [Field Types](https://ng-forge.com/dynamic-forms/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/validation/basics)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/dynamic-behavior/overview)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
