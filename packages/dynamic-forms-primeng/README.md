<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms-primeng

PrimeNG field components for [@ng-forge/dynamic-forms](https://www.npmjs.com/package/@ng-forge/dynamic-forms).

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-primeng)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-primeng)
[![Angular](https://img.shields.io/badge/Angular-22+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

> **Stability:** This library is built on Angular Signal Forms, which is stable as of Angular v22.
> Check the [compatibility matrix](#compatibility) below for supported Angular versions.

## Compatibility

| @ng-forge/dynamic-forms-primeng | @ng-forge/dynamic-forms | Angular       |
| ------------------------------- | ----------------------- | ------------- |
| 1.0.x                           | 1.0.x                   | ^22.0.0       |
| 0.9.x                           | 0.9.x                   | >=21.2.0      |
| 0.8.x                           | 0.8.x                   | >=21.2.0      |
| 0.7.x                           | 0.7.x                   | >=21.2.0      |
| 0.6.x                           | 0.6.x                   | >=21.1.0      |
| 0.5.x                           | 0.5.x                   | >=21.1.0      |
| 0.4.x                           | 0.4.x                   | >=21.1.0      |
| 0.3.x                           | 0.3.x                   | 21.0.7-21.0.x |
| 0.2.x                           | 0.2.x                   | 21.0.6        |
| 0.1.1+                          | 0.1.1+                  | 21.0.2-21.0.5 |
| 0.1.0                           | 0.1.0                   | 21.0.0-21.0.1 |

PrimeNG has not yet published a release that officially supports Angular 22. This package's test suite passes against PrimeNG 21.x running on Angular 22.

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng @primeuix/themes primeicons
```

## Setup

```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
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

## Addons

`prime-input` ships first-class `prefix` / `suffix` addon slots accepting the PrimeNG-specific `prime-icon` / `prime-button` kinds plus the universal `text` / `template` / `component` kinds. `withPrimeNGFields()` auto-registers them — no extra setup needed.

See [Addons / Overview](https://ng-forge.com/primeng/addons/overview), [Presets and Actions](https://ng-forge.com/primeng/addons/presets-and-actions), and [Custom Kinds](https://ng-forge.com/primeng/addons/custom-types) for the full surface (slots, kinds, presets, `actionRef`, reactive `hidden` / `disabled`, custom kind registration).

## Documentation

- [PrimeNG Integration](https://ng-forge.com/primeng)
- [Field Types](https://ng-forge.com/primeng/field-types/text-inputs)
- [Validation](https://ng-forge.com/primeng/validation/basics)
- [Conditional Logic](https://ng-forge.com/primeng/dynamic-behavior/conditional-logic)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
