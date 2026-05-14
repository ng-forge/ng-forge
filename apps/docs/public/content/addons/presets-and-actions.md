---
title: Presets and Actions
slug: addons/presets-and-actions
description: 'Wire button addons to behavior. Five built-in presets cover the common patterns (clear, reset, paste, copy, toggle-password-visibility). For custom behavior, register named handlers with provideAddonActions and reference them by string, or pass an inline action for code-only configs.'
---

Button addons (`pi-button` / `mat-button` / `bs-button` / `ion-button`) accept exactly one click variant: `preset`, `actionRef`, or `action`. The variants are mutually exclusive at the type level — setting two is a compile error.

## The three variants

```typescript
// 1. Built-in preset — JSON-safe, no code required.
{ slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }

// 2. Registered handler — JSON-safe, looked up by name.
{ slot: 'suffix', kind: 'pi-button', icon: 'send', ariaLabel: 'Send', actionRef: 'submitDraft' }

// 3. Inline function — code-only, dropped from JSON-derived configs by the validator.
{ slot: 'suffix', kind: 'pi-button', icon: 'plus', ariaLabel: 'Add', action: (ctx) => ctx.setValue?.((ctx.value ?? '') + '+') }
```

Pick the leftmost variant that covers your case. Most addon buttons map to a preset.

## Built-in presets

Five presets ship with the library, available in every adapter:

| Preset                         | Behaviour                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `'clear'`                      | Empties the field value (writes `''`).                                                                                                                             |
| `'reset'`                      | Restores the field s configured default value from the form s `defaultValues` map (resolved at click time). Falls back to empty when no default is reachable.      |
| `'paste'`                      | Reads from the system clipboard (`navigator.clipboard.readText()`) and writes the result to the field.                                                             |
| `'copy'`                       | Writes the field s current value to the system clipboard (`navigator.clipboard.writeText`).                                                                        |
| `'toggle-password-visibility'` | Flips the host input s `type` between `'password'` and `'text'`. No-op (warning logged) when used outside an input-style field that exposes a type-override token. |

All presets are JSON-safe. For form submission, use the dedicated `'submit'` field type — it is intentionally not exposed as a preset.

### Password toggle live demo

<docs-live-example scenario="examples/addon-password-toggle"></docs-live-example>

The toggle works in every adapter — each one provides a per-field `*_INPUT_TYPE_OVERRIDE` token at the input field component scope. The preset writes to the override signal; the input reads `typeOverride() ?? props().type` to compute its effective `type` attribute.

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

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { appActions } from './app-actions';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), appActions)],
};
```

The backend can now ship configs like:

```json
{ "kind": "mat-button", "icon": "send", "ariaLabel": "Send", "actionRef": "submitDraft" }
```

### Type narrowing

`provideAddonActions(...)` augments the global `DynamicFormActionRegistry` interface so `actionRef` autocompletes to the registered names. Each handler receives the full `AddonActionContext`:

```typescript
interface AddonActionContext {
  readonly field: { readonly key: string };
  readonly value: unknown;
  readonly setValue?: (next: unknown) => void;
}
```

Use `ctx.setValue` to write back to the host field s value (same backing as `'clear'` / `'reset'`).

## Inline `action` (code-only)

For prototypes or scenarios where the handler can t live in JSON, pass a function directly:

```typescript
{
  slot: 'suffix',
  kind: 'mat-button',
  icon: 'add',
  ariaLabel: 'Append marker',
  action: (ctx) => {
    const current = typeof ctx.value === 'string' ? ctx.value : '';
    ctx.setValue?.(`${current}+`);
  },
}
```

The validator drops `action` from JSON-source configs (it can t serialise a function), so reach for `actionRef` if the config might round-trip through a backend.

## Reactive `loading` and `disabled`

Button kinds expose both:

- `loading?: DynamicValue<boolean>` — when truthy, the button shows the adapter s spinner state (Material spinner inside the button, Bootstrap `.spinner-border`, Ionic `<ion-spinner>`, PrimeNG `[loading]`). Implies disabled.
- `disabled?: DynamicValue<boolean>` — independent of loading; click is a no-op.

```typescript
const submitting = signal(false);

{
  slot: 'suffix',
  kind: 'mat-button',
  icon: 'send',
  ariaLabel: 'Send',
  actionRef: 'submitDraft',
  loading: submitting,
  disabled: computed(() => !canSubmit()),
}
```

## Multi-set rule

Exactly one of `preset` / `actionRef` / `action` may be set. The TypeScript types enforce this via an XOR union; the runtime validator additionally drops any addon that smuggles multiple values past the type checker (with an actionable warning). Decorative buttons that simply look like buttons but do nothing are valid — omit all three.

## Where to next

- **[Custom Kinds](/addons/custom-kinds)** — when none of the built-in kinds fit, register your own kind component and augment the type registry.
- **[Migrating from ngx-formly](/migrating-from-ngx-formly#addons)** — concept mapping for users coming from formly s per-adapter addon shapes.
