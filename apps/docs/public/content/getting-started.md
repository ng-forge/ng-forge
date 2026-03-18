---
title: Getting Started
slug: getting-started
---

ng-forge generates fully working Angular forms from a single configuration object — validation, conditional logic, and multi-step wizards included. Here's how to set it up.

## 1. Choose Your UI Library

<docs-adapter-picker></docs-adapter-picker>

<docs-integration-view></docs-integration-view>

---

## 2. Your First Form

Every adapter uses the same `FormConfig` schema — import `DynamicForm` and bind a config object:

```typescript
@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class ContactComponent {
  config = {
    fields: [
      /* see Config tab below */
    ],
  } as const satisfies FormConfig;
}
```

Try it out — select a contact method and watch fields appear. Switch to the "Config" tab to see the full schema:

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
