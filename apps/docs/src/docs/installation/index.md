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
export class LoginComponent {
  config = { fields: [...] } as const satisfies FormConfig;
}
```

Here's a login form that works with any adapter — switch the "Config" tab to see the full schema:

<docs-live-example scenario="examples/login" hideForCustom></docs-live-example>

## Requirements

- **Angular 21+** — required for signal support
- **TypeScript 5.6+** — for best type inference

---

## Next Steps

- **[Configuration →](/configuration)** — Set global defaults with `withXxxFields({ ... })` and per-form `defaultProps`
- **[Examples →](/examples)** — Browse complete form examples
- **[Field Types →](/field-types/text-inputs)** — All available field types and their props
- **[Building an Adapter →](/building-an-adapter)** — Create your own adapter for any UI library
