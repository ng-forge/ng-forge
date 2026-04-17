---
title: Wrappers
slug: wrappers/overview
description: 'Compose chrome around any dynamic form field without touching the field itself. Wrappers are Angular components chained around a field to add labels, cards, validation indicators, or other decoration.'
---

Wrappers decorate a rendered field with extra UI chrome — a titled section, a validation indicator, a card, a collapsible panel — without modifying the field component itself. Multiple wrappers stack outermost → innermost, like Formly's wrapper chain.

## Quick shape

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  wrappers: [{ type: 'section', title: 'Contact details' }],
}
```

At runtime, the outlet renders `section → input` — the section wrapper's `#fieldComponent` slot hosts the input.

## When to reach for a wrapper

| Goal                                                                       | Use                                         |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| Consistent titled section, card, or accordion around groups of fields      | **Wrapper**                                 |
| Conditional CSS classes on the field's existing host                       | Field `className` or built-in `css` wrapper |
| A completely new control (rich-text editor, file picker, colour picker, …) | [Custom field](/recipes/custom-fields)      |
| Repeat the same decoration for every field in a form                       | `FormConfig.defaultWrappers` — one line     |
| Auto-decorate specific field types across the whole app                    | `WrapperTypeDefinition.types` auto-assoc    |

Wrappers are read-only: they can observe field state (value, validity, errors, dirty) but never mutate it. Mutation stays in the field component.

## Built-in wrappers

Two wrappers ship with the library and are registered automatically:

- **`css`** — adds space-separated classes to a wrapping element, driven by a `cssClasses: DynamicText` input. Accepts a string, Signal, or Observable so classes can react to form state.
- **`row`** — the flex/grid layout used under the hood when you write `{ type: 'row', fields: [...] }`. This is a runtime detail; keep writing `type: 'row'`.

Everything else — section cards, validation indicators, feature-flag overlays — is yours to build.

## Live example

The row layout you see everywhere in these docs is a wrapper in action: `type: 'row'` resolves to the container field with an auto-injected `row` wrapper.

<docs-live-example scenario="examples/row"></docs-live-example>

## Next

- **[Writing a wrapper](/wrappers/writing-a-wrapper)** — the component contract, config inputs, and the `fieldInputs` bag that gives wrappers read-only access to the wrapped field.
- **[Registering and applying wrappers](/wrappers/registering-and-applying)** — `createWrappers(…)`, `InferWrapperRegistry` module augmentation, the `wrappers` array on a field, `defaultWrappers` on the form, and `wrappers: null` to opt a single field out.
