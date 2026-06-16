<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms-material

Material Design field components for [@ng-forge/dynamic-forms](https://www.npmjs.com/package/@ng-forge/dynamic-forms).

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)
[![Angular](https://img.shields.io/badge/Angular-22+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

> **Stability:** This library is built on Angular Signal Forms, which is stable as of Angular v22.
> Check the [compatibility matrix](#compatibility) below for supported Angular versions.

## Compatibility

| Angular | @ng-forge/dynamic-forms-material |
| ------- | -------------------------------- |
| 22.x    | 1.x                              |
| 21.x    | 0.x (experimental)               |

Versioned in lockstep with `@ng-forge/dynamic-forms`. The `0.x` line targets Angular 21 (experimental Signal Forms). Each release pins its Angular requirement via `peerDependencies`; npm warns on a mismatch.

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material
```

## Setup

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
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
      { key: 'name', type: 'input', value: '', label: 'Name', required: true, props: { appearance: 'outline' } },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        props: { appearance: 'outline', prefixIcon: 'email' },
      },
      { type: 'submit', key: 'submit', label: 'Send', props: { color: 'primary' } },
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
  ...withMaterialFields({
    appearance: 'outline',
    subscriptSizing: 'dynamic',
  }),
);
```

## Field Types

Input, Textarea, Select, Checkbox, Radio, Datepicker, Slider, Toggle, Multi-Checkbox, Button, Submit, Next, Previous

## Documentation

- [Feature overview](https://ng-forge.com/material/feature-overview)
- [Material Integration](https://ng-forge.com/material)
- [Field Types](https://ng-forge.com/material/field-types/text-inputs)
- [Validation](https://ng-forge.com/material/validation/basics)
- [Conditional Logic](https://ng-forge.com/material/dynamic-behavior/conditional-logic)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
