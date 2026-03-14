Get ng-forge dynamic forms up and running in your Angular project.

## Choose Your UI Library

Select the UI library you're using — the setup guide below will update to match.

<docs-adapter-picker></docs-adapter-picker>

<docs-integration-view></docs-integration-view>

---

## Your First Form

All adapters share the same `FormConfig` schema. Here's a login form that works regardless of which adapter you chose above:

<docs-live-example scenario="examples/login" hideForCustom></docs-live-example>

```typescript name="login.component.ts"
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-login',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class LoginComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        props: { type: 'email' },
      },
      {
        key: 'password',
        type: 'input',
        value: '',
        label: 'Password',
        required: true,
        minLength: 8,
        props: { type: 'password' },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Sign In',
      },
    ],
  } as const satisfies FormConfig;
}
```

## Requirements

- **Angular 21+** — required for signal support
- **TypeScript 5.6+** — for best type inference

---

## Next Steps

- **[Configuration →](/configuration)** — Set global defaults with `withXxxFields({ ... })` and per-form `defaultProps`
- **[Examples →](/examples)** — Browse complete form examples
- **[Field Types →](/schema-fields/field-types/text-inputs)** — All available field types and their props
- **[Building an Adapter →](/building-an-adapter)** — Create your own adapter for any UI library
