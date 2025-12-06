<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-forms-ionic

Ionic field components for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-ionic.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-ionic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

## Setup

```scss
// styles.scss
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';
```

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [provideIonicAngular({ mode: 'md' }), provideDynamicForm(...withIonicFields())],
};
```

## Usage

```typescript
import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submitted)="onSubmit($event)" />`,
})
export class ContactFormComponent {
  config = {
    fields: [
      { key: 'name', type: 'input', value: '', label: 'Name', required: true, props: { fill: 'outline', labelPlacement: 'stacked' } },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        props: { fill: 'outline', labelPlacement: 'stacked' },
      },
      { type: 'submit', key: 'submit', label: 'Send', props: { color: 'primary', expand: 'block' } },
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
  ...withIonicFields({
    fill: 'outline',
    labelPlacement: 'floating',
    color: 'primary',
  }),
);
```

## Field Types

Input, Textarea, Select, Checkbox, Radio, Toggle, Datepicker, Slider, Multi-Checkbox, Button, Submit, Next, Previous

## Documentation

- [Ionic Integration](https://ng-forge.com/dynamic-forms/ui-libs-integrations/ionic)
- [Field Types](https://ng-forge.com/dynamic-forms/core/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/core/validation)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/core/conditional-logic)

## License

MIT © ng-forge
