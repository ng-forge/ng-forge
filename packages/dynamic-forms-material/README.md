<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-forms-material

Material Design field components for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-material)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
- [Field Types](https://ng-forge.com/dynamic-forms/core/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/core/validation)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/core/conditional-logic)

## License

MIT © ng-forge
