---
title: Presets and Actions
slug: addons/presets-and-actions
description: 'Wire button addons to behavior. Five built-in presets cover the common patterns (clear, reset, paste, copy, toggle-password-visibility). For custom behavior, register named handlers with provideAddonActions and reference them by string, or pass an inline action for code-only configs.'
---

Button addons accept exactly one click variant: `preset`, `actionRef`, or `action`. The variants are mutually exclusive at the type level — setting two is a compile error.

## The three variants

<docs-addon-info field="three-variants"></docs-addon-info>

Pick the leftmost variant that covers your case. Most addon buttons map to a preset.

## Built-in presets

Five presets ship with the library, available in every adapter:

| Preset                         | Behaviour                                                                                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'clear'`                      | Empties the field value. Writes `''` for string fields and `undefined` for non-string fields (numeric, date, object) so the field's declared type is preserved.                                 |
| `'reset'`                      | Restores the field s configured default value from the form s `defaultValues` map (resolved at click time). Falls back to `''` / `undefined` (matching `'clear'`) when no default is reachable. |
| `'paste'`                      | Reads from the system clipboard (`navigator.clipboard.readText()`) and writes the result to the field.                                                                                          |
| `'copy'`                       | Writes the field s current value to the system clipboard (`navigator.clipboard.writeText`).                                                                                                     |
| `'toggle-password-visibility'` | Flips the host input s `type` between `'password'` and `'text'`. No-op (warning logged) when used outside an input-style field that exposes a type-override token.                              |

All presets are JSON-safe. For form submission, use the dedicated `'submit'` field type — it is intentionally not exposed as a preset.

### Password toggle live demo

<docs-live-example scenario="examples/addon-password-toggle"></docs-live-example>

### Per-adapter wiring

<docs-addon-info field="preset-handler-context"></docs-addon-info>

## Registered handlers (`actionRef`)

When you need behavior that goes beyond the presets but want to keep the config JSON-safe, register named handlers at the application root and reference them by string.

```typescript name="app-actions.ts"
import { provideAddonActions } from '@ng-forge/dynamic-forms';

export const appActions = provideAddonActions({
  submitDraft: (ctx) => myDraftService.save(ctx.field.key, ctx.value),
  openPreview: (ctx) => myDialog.open(PreviewDialog, { data: ctx.value }),
});
```

Wire the feature into `provideDynamicForm`:

<docs-addon-info field="actions-wiring"></docs-addon-info>

The backend can now ship configs like:

```json
{ "kind": "<adapter-button-kind>", "icon": "send", "ariaLabel": "Send", "actionRef": "submitDraft" }
```

### Type narrowing

`provideAddonActions(...)` returns a feature whose `__handlerKeys` phantom field captures the registered names — derive the global `DynamicFormActionRegistry` augmentation from it in one line so `actionRef` autocompletes everywhere:

```typescript
export const appActions = provideAddonActions({
  runSearch: (ctx) => {
    /* … */
  },
  submitDraft: (ctx) => {
    /* … */
  },
});

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormActionRegistry extends Record<NonNullable<(typeof appActions)['__handlerKeys']>, true> {}
}
```

Each handler receives a discriminated `AddonActionContext`:

```typescript
type AddonActionContext<TValue = unknown> =
  | FieldBoundAddonActionContext<TValue> // form: ReadonlyFieldTree; setValue: required
  | OrphanAddonActionContext<TValue>; // form: null;               setValue: absent

interface FieldBoundAddonActionContext<TValue = unknown> {
  readonly field: { readonly key: string; readonly type: string };
  readonly form: ReadonlyFieldTree<TValue>;
  readonly value: TValue | undefined;
  readonly setValue: (next: TValue) => void; // <- non-optional once narrowed
}
```

Narrow with the `isFieldBoundContext` guard so write-back handlers don t need `ctx.setValue?.(…)` everywhere:

```typescript
import { isFieldBoundContext, provideAddonActions } from '@ng-forge/dynamic-forms';

provideAddonActions({
  submit: (ctx) => {
    if (!isFieldBoundContext(ctx)) return; // orphan — nothing to write to
    myService.send(ctx.field.key, ctx.value, ctx.setValue);
  },
});
```

For broader field state, use the form-tree projection ng-forge already supplies to wrappers — `field.key` is intentionally the only stable identity surface across the addon contract.

## JSON-safety quick reference

| Click variant | JSON-safe? | Use when                                                                        |
| ------------- | ---------- | ------------------------------------------------------------------------------- |
| `preset`      | yes        | Behaviour matches one of the five built-ins.                                    |
| `actionRef`   | yes        | Custom behaviour registered once via `provideAddonActions`.                     |
| `action`      | code-only  | Prototypes / scenarios where the config is hand-authored and never round-trips. |

Reactive axes are similarly tiered: `boolean` values are JSON-safe, `Signal<boolean>` / `Observable<boolean>` / function values are stripped from JSON-source configs by the validator (with a warning). See [Reactive addons from JSON](#reactive-from-json) below.

## Inline `action` (code-only)

For prototypes or scenarios where the handler can t live in JSON, pass a function directly:

```typescript
{
  slot: 'suffix',
  kind: '<adapter-button-kind>',
  icon: 'add',
  ariaLabel: 'Append marker',
  action: (ctx) => {
    if (!isFieldBoundContext(ctx)) return; // orphan — nothing to write to
    const current = typeof ctx.value === 'string' ? ctx.value : '';
    ctx.setValue(`${current}+`); // narrowed: no optional chain needed
  },
}
```

The validator drops `action` from JSON-source configs (it can t serialise a function), so reach for `actionRef` if the config might round-trip through a backend.

## Reactive `loading` and `disabled`

Button kinds expose both:

- `loading?: DynamicValue<boolean>` — when truthy, the button shows the adapter s spinner state. Implies disabled.
- `disabled?: DynamicValue<boolean>` — independent of loading; click is a no-op.

```typescript
const submitting = signal(false);

{
  slot: 'suffix',
  kind: '<adapter-button-kind>',
  icon: 'send',
  ariaLabel: 'Send',
  actionRef: 'submitDraft',
  loading: submitting,
  disabled: computed(() => !canSubmit()),
}
```

## Multi-set rule

Exactly one of `preset` / `actionRef` / `action` may be set. The TypeScript types enforce this via an XOR union; the runtime validator additionally drops any addon that smuggles multiple values past the type checker (with an actionable warning). Decorative buttons that simply look like buttons but do nothing are valid — omit all three.

## Reactive addons from JSON {#reactive-from-json}

JSON cannot carry `Signal` / `Observable` / function values, so two questions come up when you ship configs from a backend:

1. **How do I express `hidden`/`disabled`/`loading` reactivity?**
2. **What survives the round-trip?**

Three patterns, in order of preference:

1. **Pre-process the JSON in app code.** Before passing the parsed config to `DynamicForm`, walk the parsed tree and replace reactive axes with `computed(...)` against your app's signals. This keeps the wire format JSON-safe and the runtime reactive — your bridge code is the only place that needs to know app state.

   ```typescript
   const config = JSON.parse(jsonFromApi) as FormConfig;
   // Locate the target addon and overwrite its `hidden` axis with a Signal/Observable.
   const search = config.fields?.find((f) => f.key === 'search');
   const clearAddon = search?.addons?.find((a) => a.slot === 'suffix');
   if (clearAddon) {
     (clearAddon as { hidden: unknown }).hidden = computed(() => !hasValue());
   }
   ```

2. **Express the gate as a form-level derivation or condition.** When the reactive axis depends on form values rather than out-of-band app state, model it as a derivation on the host field's `logic` block. The condition lives in JSON (it's a string-expression DSL) and the addon stays static.

3. **Skip reactivity at the addon layer.** If the addon's visibility is purely a function of static form metadata, render it unconditionally and let the field's own validation/state hide the value semantically. Reach for this when (1) and (2) feel heavy.

Functions on `hidden` / `disabled` / `loading` / `action` are stripped from JSON-source configs at validation time with a logged warning — you'll see them in the console if a config carries an inline function. `preset` and `actionRef` are the JSON-safe escape hatches for behaviour; `computed`/`Observable` are the code-side escape hatches for reactivity.

## Where to next

- **[Custom Kinds](/addons/custom-kinds)** — when none of the built-in kinds fit, register your own kind component and augment the type registry.
- **[Migrating from ngx-formly](/migrating-from-ngx-formly#addons)** — concept mapping for users coming from formly s per-adapter addon shapes.
