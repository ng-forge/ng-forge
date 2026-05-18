---
title: Custom Kinds
slug: addons/custom-kinds
description: 'Register a custom addon kind component with withCustomAddon() and make it type-safe per field via the InputAddonExtensions module-augmentation seam. Covers runtime validation, ARIA defaults, and dropping into per-adapter input fields.'
---

When the built-in kinds (icon, button, text, template, component) don t cover your case — a rating widget in the prefix, a status pill in the suffix, a copy-to-clipboard component with bespoke styling — register a custom kind. Two independent steps: a runtime registration (`withCustomAddon`) and an optional type-level augmentation.

## 1. Define the addon shape

A custom kind extends `BaseAddon` and pins `kind` to a unique string literal:

```typescript name="rating-addon.ts"
import type { BaseAddon } from '@ng-forge/dynamic-forms';

export interface RatingAddon extends BaseAddon {
  readonly kind: 'rating';
  readonly value: number;
  readonly max?: number;
}
```

`BaseAddon` carries the universal axes — `slot`, optional `hidden`, optional `className`, optional `disabled` — so you only declare the kind-specific fields.

## 2. Build the kind component

```typescript name="rating-addon.component.ts"
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RatingAddon } from './rating-addon';

@Component({
  selector: 'app-rating-addon',
  template: `
    <span class="rating">
      @for (i of stars(); track $index) {
        <span [class.filled]="i < addon().value">★</span>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingAddonComponent {
  readonly addon = input.required<RatingAddon>();

  protected readonly stars = computed(() => Array.from({ length: this.addon().max ?? 5 }, (_, i) => i));
}
```

The contract: declare `addon: input.required<TAddon>()`. The dispatcher (`<df-addon-slot>`) wires the addon object via `[addon]` and forwards the `slot` HTML attribute on the host element. ARIA defaults are owned by your component — decorative kinds typically set `aria-hidden="true"`; interactive kinds handle their own labelling.

## 3. Register at the provider level

Define the `AddonKindDefinition` next to the addon shape:

```typescript name="rating-addon.ts"
import { DynamicFormError, type AddonKindDefinition } from '@ng-forge/dynamic-forms';
import type { RatingAddon } from './rating-addon';

export const RATING_KIND: AddonKindDefinition<RatingAddon> = {
  kind: 'rating',
  loadComponent: () => import('./rating-addon.component').then((m) => m.RatingAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.value !== 'number' || addon.value < 0) {
      throw new DynamicFormError(`Addon 'rating' on field '${fieldKey}' requires a non-negative 'value'.`);
    }
  },
};
```

Then pass it through `withCustomAddon(...)` to `provideDynamicForm` alongside your adapter s field bundle:

<docs-addon-info field="custom-kind-invocation"></docs-addon-info>

`loadComponent` returns a Promise — the kind component is loaded lazily on first render and cached.

`validate` is optional; when provided, the runtime addon validator calls it at config init. Throwing `DynamicFormError` drops the addon with an actionable warning and the form keeps rendering — `validate` is a sanitisation hook, not a hard fail.

## 4. Type-level augmentation (optional but recommended)

To make `kind: 'rating'` autocomplete inside the field s `addons` array, augment the active adapter s addon-extension seam:

<docs-addon-info field="custom-extension-name"></docs-addon-info>

The runtime registration and the type-level augmentation are independent — use either or both. Without augmentation, custom kinds still work at runtime; you lose IDE narrowing on the `addons` array.

## When _not_ to use a custom kind

- **Static decoration** — pure CSS / text → `kind: 'text'` covers it.
- **An entirely new field control** (file picker, rich-text editor, color picker) → register a custom **field type**, not an addon kind. Addons decorate; field types render the primary control. See [Adding custom fields](/recipes/custom-fields).
- **One-off behavior** for a specific button — use `action` (code-only) or `actionRef` (registered handler) on a built-in button kind.

## Verification checklist

When you ship a custom kind:

1. The kind component declares `addon: input.required<TAddon>()`.
2. `withCustomAddon(...)` is passed to `provideDynamicForm` after the field-type bundle.
3. The runtime `validate` function rejects malformed configs with `DynamicFormError`.
4. The type-level augmentation lives in the same file as the runtime registration so the two stay in sync.
5. ARIA defaults are explicit — `aria-hidden="true"` for decorative kinds; `aria-label` for kinds that convey meaning.

## Where to next

- **[Building an Adapter](/building-an-adapter)** — adapter authors registering bundled kinds.
- **[Custom field types](/recipes/custom-fields)** — when the "addon" you re building is really a new field control.
