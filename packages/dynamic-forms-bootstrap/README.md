<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms-bootstrap

Bootstrap 5 field components for [@ng-forge/dynamic-forms](https://www.npmjs.com/package/@ng-forge/dynamic-forms).

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-bootstrap.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-bootstrap)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-bootstrap.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-bootstrap)
[![Angular](https://img.shields.io/badge/Angular-22+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

> **Stability:** This library is built on Angular Signal Forms, which is stable as of Angular v22.
> Check the [compatibility matrix](#compatibility) below for supported Angular versions.

## Compatibility

| Angular | @ng-forge/dynamic-forms-bootstrap |
| ------- | --------------------------------- |
| 22.x    | 1.x                               |
| 21.x    | 0.x (experimental)                |

Versioned in lockstep with `@ng-forge/dynamic-forms`. The `0.x` line targets Angular 21 (experimental Signal Forms). Each release pins its Angular requirement via `peerDependencies`; npm warns on a mismatch.

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

## Setup

```scss
// styles.scss
@import 'bootstrap/dist/css/bootstrap.min.css';
```

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withBootstrapFields())],
};
```

## Usage

```typescript
import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`,
})
export class MyFormComponent {
  config = {
    fields: [
      { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true, props: { floatingLabel: true } },
      { type: 'submit', key: 'submit', label: 'Submit', props: { variant: 'primary' } },
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
  ...withBootstrapFields({
    floatingLabel: true,
    size: 'lg',
    variant: 'primary',
  }),
);
```

## Field Types

Input, Select, Checkbox, Toggle, Button, Submit, Next, Previous, Textarea, Radio, Multi-Checkbox, Datepicker, Slider

## Documentation

- [Feature overview](https://ng-forge.com/dynamic-forms/bootstrap/feature-overview)
- [Bootstrap Integration](https://ng-forge.com/dynamic-forms/bootstrap/configuration)
- [Field Types](https://ng-forge.com/dynamic-forms/bootstrap/field-types/text-inputs)
- [Validation](https://ng-forge.com/dynamic-forms/bootstrap/validation/basics)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/bootstrap/dynamic-behavior/conditional-logic)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
