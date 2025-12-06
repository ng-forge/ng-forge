<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-forms-bootstrap

Bootstrap 5 field components for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-bootstrap.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-bootstrap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
  template: `<dynamic-form [config]="config" (submitted)="onSubmit($event)" />`,
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

- [Bootstrap Integration](https://ng-forge.com/dynamic-forms/docs/ui-libs-integrations/bootstrap)
- [Field Types](https://ng-forge.com/dynamic-forms/docs/core/field-types)
- [Validation](https://ng-forge.com/dynamic-forms/docs/core/validation)
- [Conditional Logic](https://ng-forge.com/dynamic-forms/docs/core/conditional-logic)

## License

MIT © ng-forge
