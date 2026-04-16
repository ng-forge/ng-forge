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

## 4. Apply wrappers

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

Multiple wrappers stack outermost → innermost. The first entry is the outermost:

```typescript
wrappers: [
  { type: 'section', title: 'Card' }, // outer
  { type: 'css', cssClasses: 'muted' }, // inner — wraps the field directly
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

`wrappers: null` on a field clears the entire chain — no auto-associations, no defaults, no field-level entries. Use it as an escape hatch for fields that need to render bare.

## Interactive example

The form below sets `defaultWrappers: [{ type: 'css', cssClasses: 'demo-field' }]`. The **contact** field layers a `section` wrapper on top of the default, and **notes** opts out entirely with `wrappers: null`.

<docs-live-example scenario="examples/wrapper-section"></docs-live-example>

## Troubleshooting

- **Wrapper does not render.** Check that it's passed to `provideDynamicForm(...)` — `WRAPPER_REGISTRY` has no entry otherwise, and the outlet logs an `error`-level message via `DynamicFormLogger`.
- **`fieldComponent` is `undefined` in the wrapper's constructor.** Expected — it's a view query. Read it inside a `computed()` / `effect()` / template, never in the constructor.
- **Wrapper config isn't typed.** Confirm the `declare module` block runs (TypeScript only picks up augmentations from files that are actually imported). Re-exporting `appWrappers` from an entry module is enough.
