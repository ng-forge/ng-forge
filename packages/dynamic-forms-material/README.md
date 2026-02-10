<p align="center">
  <img src="./logo.svg" alt="ng-forge Dynamic Forms" width="400"/>
</p>

# @ng-forge/dynamic-forms-material

Material Design field components for [@ng-forge/dynamic-forms](https://www.npmjs.com/package/@ng-forge/dynamic-forms).

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)
[![Angular](https://img.shields.io/badge/Angular-21+-DD0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Experimental API Notice:** This library uses Angular's experimental Signal Forms API.
> Angular may introduce breaking changes in patch releases. Check the [compatibility matrix](#compatibility) below.

## Compatibility

| @ng-forge/dynamic-forms-material | @ng-forge/dynamic-forms | Angular       |
| -------------------------------- | ----------------------- | ------------- |
| 0.5.x                            | 0.5.x                   | >=21.1.0      |
| 0.4.x                            | 0.4.x                   | >=21.1.0      |
| 0.3.x                            | 0.3.x                   | 21.0.7-21.0.x |
| 0.2.x                            | 0.2.x                   | 21.0.6        |
| 0.1.1+                           | 0.1.1+                  | 21.0.2-21.0.5 |
| 0.1.0                            | 0.1.0                   | 21.0.0-21.0.1 |

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

- [Material Integration](https://ng-forge.com/dynamic-forms/ui-libs-integrations/material)
- [Field Types](https://ng-forge.com/dynamic-forms/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/validation/basics)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/dynamic-behavior/overview)

## Changelog

See [GitHub Releases](https://github.com/ng-forge/ng-forge/releases).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ng-forge/ng-forge/blob/main/CONTRIBUTING.md).

## License

MIT © ng-forge
