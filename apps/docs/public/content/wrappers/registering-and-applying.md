---
title: Registering and Applying Wrappers
slug: wrappers/registering-and-applying
description: 'Register custom wrappers with createWrappers(), augment FieldRegistryWrappers once via InferWrapperRegistry, and apply them at the form or field level. Covers the merge order, null opt-out, and types-based auto-association.'
---

Wrappers travel through the library as **registered types** — a `WrapperTypeDefinition` with a lazy-loaded component. Registration tells `provideDynamicForm(...)` how to resolve a config like `{ type: 'section' }` to your component class, and how to type-check wrapper configs in form definitions.

## 1. Register with `createWrappers`

`createWrappers(...)` returns a branded bundle that `provideDynamicForm(...)` recognises:

```typescript name="app-wrappers.ts"
import { createWrappers, wrapperProps } from '@ng-forge/dynamic-forms';
import type { SectionWrapper } from './section-wrapper.component';

export const appWrappers = createWrappers({
  wrapperName: 'section',
  loadComponent: () => import('./section-wrapper.component'),
  props: wrapperProps<SectionWrapper>(),
});
```

`wrapperProps<T>()` is a zero-cost type carrier — it returns `undefined` at runtime and exists purely so TypeScript can thread the config type `T` into the bundle.

## 2. Augment `FieldRegistryWrappers` once

Declare the augmentation in the same file you registered the wrapper. `InferWrapperRegistry<typeof appWrappers>` does the bookkeeping:

```typescript name="app-wrappers.ts"
import type { InferWrapperRegistry } from '@ng-forge/dynamic-forms';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryWrappers extends InferWrapperRegistry<typeof appWrappers> {}
}
```

Add new entries to `createWrappers(...)` and the augmentation updates itself. Config objects everywhere in the app now autocomplete and type-check `{ type: 'section', title: '…' }`.

## 3. Pass the bundle to `provideDynamicForm`

```typescript name="app.config.ts"
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { appWrappers } from './app-wrappers';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), appWrappers)],
};
```

> [!NOTE]
> `provideDynamicForm(...)` is an application-level provider — call it once in `ApplicationConfig.providers` (or the equivalent `bootstrapApplication` providers). It is not intended for `Route.providers` and the library does not support merging or overriding the wrapper registry per route. Register every field type and wrapper the app needs in that single call.

## 4. Apply wrappers

Three ways to reach a wrapper, in order of increasing scope:

### Per-field

Set `wrappers` on any field:

```typescript
{
  key: 'contact',
  type: 'input',
  label: 'Contact name',
  wrappers: [{ type: 'section', title: 'Primary contact' }],
}
```

Multiple wrappers stack outermost → innermost. The first entry is the outermost. Mixing a custom wrapper with the built-in `css`:

```typescript
// section wraps css wraps the field. `section` must be registered first
// (see Writing a Wrapper). `css` is built-in.
wrappers: [
  { type: 'section', title: 'Card' }, // outer
  { type: 'css', cssClasses: 'muted' }, // inner
];
```

### Form-wide defaults

Set `defaultWrappers` on `FormConfig` to apply a chain to **every** field that does not opt out:

```typescript name="form.config.ts"
const formConfig: FormConfig = {
  defaultWrappers: [{ type: 'css', cssClasses: 'demo-field' }],
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true },
    { key: 'notes', type: 'input', label: 'Notes', wrappers: null },
  ],
};
```

`notes` skips the defaults entirely via `wrappers: null`.

### Auto-association by field type

A `WrapperTypeDefinition` can declare `types: ['input', 'select']` to apply automatically wherever those field types render:

```typescript
createWrappers({
  wrapperName: 'floatingLabel',
  loadComponent: () => import('./floating-label-wrapper.component'),
  types: ['input', 'textarea'],
});
```

Every `input` and `textarea` across the app now receives the `floatingLabel` wrapper without touching field config.

## Merge order

The effective wrapper chain for one field is merged from three sources, outermost → innermost:

1. **Auto-association** — wrappers whose `types` array includes the field's `type`
2. **Form defaults** — `FormConfig.defaultWrappers`
3. **Field-level** — the field's own `wrappers` array

## `wrappers` state cheatsheet

| `wrappers` value | Effect                                             |
| ---------------- | -------------------------------------------------- |
| `undefined`      | Inherit (auto-associations + defaults apply)       |
| `null`           | **Opt out** — render the field bare                |
| `[]`             | Inherit (same as `undefined` — **not** an opt-out) |
| `[{ …wrapper }]` | Append to auto-associations + defaults             |

> [!WARNING]
> `wrappers: []` (an empty array) is **not** an opt-out. Auto-associations and `defaultWrappers` still apply — the field-level list just adds zero additional wrappers. Use `wrappers: null` to skip them entirely.

## Interactive example

The form below sets `defaultWrappers: [{ type: 'css', cssClasses: 'demo-field' }]`. The **contact** field layers a `section` wrapper on top of the default, and **notes** opts out entirely with `wrappers: null`.

<docs-live-example scenario="examples/wrapper-section"></docs-live-example>

## Troubleshooting

- **Wrapper does not render.** Check that it's passed to `provideDynamicForm(...)` — `WRAPPER_REGISTRY` has no entry otherwise, and the outlet logs an `error`-level message via `DynamicFormLogger` plus a `console.error` with the `[Dynamic Forms]` prefix.
- **`fieldComponent` is `undefined` in the wrapper's constructor.** Expected — it's a view query. Read it inside a `computed()` / `effect()` / template, never in the constructor.
- **Wrapper config isn't typed.** Confirm the `declare module` block runs (TypeScript only picks up augmentations from files that are actually imported). Re-exporting `appWrappers` from an entry module is enough.
- **Typed config prop does nothing.** A typo like `tilte` instead of `title` won't throw — the wrapper renders without that prop. Unknown keys are intentionally dropped so wrappers don't fight over unrelated config. Rely on the TypeScript augmentation to catch the typo at the config site.
- **Wrapper re-renders on every keystroke.** Expected when the wrapper reads a mapper-driven input directly — read only the signals you need inside a `computed()` and rely on signal equality to short-circuit downstream reactivity.

## Where to go from here

- Back to **[Writing a wrapper](/wrappers/writing-a-wrapper)** for the component contract and field-state reading patterns.
- **[Recipes → Adding Custom Fields](/recipes/custom-fields)** when a new wrapper isn't enough — you need a brand-new control.
