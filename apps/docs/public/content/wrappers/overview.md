---
title: Wrappers
slug: wrappers/overview
description: 'Compose chrome around any dynamic form field without touching the field itself. Wrappers are Angular components chained around a field to add labels, cards, validation indicators, or other decoration.'
---

Wrappers decorate a rendered field with extra UI chrome — a titled section, a validation indicator, a card, a collapsible panel — without modifying the field component itself. Multiple wrappers stack outermost → innermost.

## How a wrapper chain looks

With `wrappers: [{ type: 'section' }, { type: 'css' }]` on a field, the outlet plugs each wrapper into the previous one's `#fieldComponent` slot — outermost first, field component last:

<docs-wrapper-chain-visual></docs-wrapper-chain-visual>

## Quick shape

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  wrappers: [{ type: 'section', title: 'Contact details' }],
}
```

## Live example

The form below layers a custom `section` wrapper on one field, inherits a form-level default wrapper on another, and opts the last field out entirely with `wrappers: null`.

<docs-live-example scenario="examples/wrapper-section"></docs-live-example>

The horizontal layout you see everywhere else in these docs is also a wrapper in action — `{ type: 'row', fields: [...] }` resolves to the container field with an auto-injected `row` wrapper. You never write the wrapper explicitly; it's an implementation detail of the `row` type.

## Built-in wrappers

Two wrappers ship with the library and are registered automatically:

- **`css`** — adds space-separated classes to a wrapping element. Accepts a `DynamicText` for `cssClasses` (string, `Signal<string>`, or `Observable<string>`):

  ```typescript
  { type: 'css', cssClasses: 'card p-4' }
  ```

- **`row`** — the flex/grid layout used under the hood when you write `{ type: 'row', fields: [...] }`. Keep writing `type: 'row'` — the wrapper plumbing is hidden.

## When to reach for a wrapper

Wrappers are one of three extension points. Pick the smallest that solves the problem.

| Problem                                                               | Use                                              | Cost                            |
| --------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| A static CSS class on the field's existing host                       | [`className`](/configuration) on the field       | Free — no wrapper instantiated  |
| Consistent chrome (card, section header, badge) around many fields    | **Wrapper**                                      | One component per wrapper level |
| A brand-new control (rich-text editor, file picker, colour picker, …) | [Custom field](/recipes/custom-fields)           | New component + registration    |
| Same chrome on every field in a form                                  | `FormConfig.defaultWrappers`                     | One line                        |
| Auto-decorate all fields of a specific type (e.g. every `input`)      | Wrapper with `types: ['input']` auto-association | One line in registration        |

Wrappers are **read-only** — they observe field state (value, validity, errors) but never mutate. Mutation belongs in the field component.

## SSR

Wrappers are SSR-safe. The component cache (`WRAPPER_COMPONENT_CACHE`) and registry (`WRAPPER_REGISTRY`) are DI-scoped rather than module-scoped, so there's no shared state between server renders.

## Next

1. **[Writing a wrapper](/wrappers/writing-a-wrapper)** — build your own wrapper component: the contract, reading field state, styling, testing.
2. **[Registering and applying wrappers](/wrappers/registering-and-applying)** — `createWrappers(…)`, module augmentation, `wrappers` on a field, `defaultWrappers`, auto-associations, opting out.
