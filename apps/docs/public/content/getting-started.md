---
title: Getting Started
slug: getting-started
---

ng-forge turns JSON-like configuration into fully working Angular forms — with validation, conditional logic, and multi-step wizards built in. You write a `FormConfig` object, and ng-forge handles rendering, state management, and reactivity.

Here's the core idea — a single object becomes a complete form. Fields can react to each other: show, hide, and validate based on other values — no imperative code required.

```typescript
const config: FormConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Full Name', required: true },
    {
      key: 'contactMethod',
      type: 'select',
      label: 'Preferred Contact',
      required: true,
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
      ],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      email: true,
      logic: [
        { type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'contactMethod', operator: 'notEquals', value: 'email' } },
        { type: 'required', condition: { type: 'fieldValue', fieldPath: 'contactMethod', operator: 'equals', value: 'email' } },
      ],
    },
    { key: 'message', type: 'textarea', label: 'Message', required: true, minLength: 10 },
    { key: 'submit', type: 'submit', label: 'Send Message' },
  ],
};
```

No `FormGroup`, no `FormControl`, no template boilerplate — and fields show/hide reactively. Pick your UI library below to get started.

---

Get ng-forge dynamic forms up and running in your Angular project.

## Choose Your UI Library

Select the UI library you're using — the setup guide below will update to match.

<docs-adapter-picker></docs-adapter-picker>

<docs-integration-view></docs-integration-view>

---

## Your First Form

All adapters share the same `FormConfig` schema — just import `DynamicForm` and bind your config:

```typescript
@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class ContactComponent {
  config = { fields: [...] } as const satisfies FormConfig;
}
```

Try it out — select a contact method and watch fields appear. Switch the "Config" tab to see the full schema:

<docs-live-example scenario="examples/contact-dynamic-fields" hideForCustom></docs-live-example>

## Requirements

- **Angular 21+** — required for signal support
- **TypeScript 5.6+** — for best type inference

---

## Next Steps

- **[Configuration](/configuration)** — Set global defaults with `withXxxFields({ ... })` and per-form `defaultProps`
- **[Examples](/examples)** — Browse complete form examples
- **[Field Types](/field-types/text-inputs)** — All available field types and their props
- **[Building an Adapter](/building-an-adapter)** — Create your own adapter for any UI library
